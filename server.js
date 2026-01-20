const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

require('dotenv').config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Database Setup
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Track Online Users (Map: userId -> { socketId, name, avatar })
const onlineUsers = new Map();

// Track Active Meetings (Map: roomId -> { hostSocketId, hostUserId, waitingUsers: Set })
const meetingRooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    
    // ============================================================
    // 0. AUTO-JOIN ON CONNECTION & METADATA SYNC
    // ============================================================
    const { userId, userName, userAvatar } = socket.handshake.query;
    
    if (userId) {
        socket.join(userId);
        
        // Store Name and Avatar
        onlineUsers.set(userId, { 
            socketId: socket.id, 
            name: userName || "Unknown User", 
            avatar: userAvatar || "" 
        });
        
        console.log(`✅ User ${userId} (${userName}) connected.`);
        
        // Broadcast full user details to update lists immediately
        io.emit("user_status_update", { 
            userId: userId, 
            status: "Online",
            user: { name: userName, avatar: userAvatar } 
        });
        
        // Send Full Map Entries to the connecting user
        socket.emit("current_online_list", Array.from(onlineUsers.entries()));
    }

    // 👇 NEW: Explicit listener to update metadata (fixing the Gatekeeper sync issue)
    // 👇 UPDATED: Listener to sync metadata AND send the list to late-joiners
        socket.on("update_user_metadata", ({ userId, name, avatar }) => {
            if (userId) {
                socket.join(userId); // Ensure they join their own room!

                onlineUsers.set(userId, { socketId: socket.id, name, avatar });
                
                console.log(`✅ User ${userId} identified via metadata event.`);

                // 1. Tell everyone else this user is now online
                io.emit("user_status_update", { 
                    userId, 
                    status: "Online",
                    user: { name, avatar } 
                });

                // 2. 👇 CRITICAL FIX: Send the online list to THIS user now
                // (Because they missed it during the initial anonymous connection)
                socket.emit("current_online_list", Array.from(onlineUsers.entries()));
            }
        });

    socket.on("request_online_users", () => {
        socket.emit("current_online_list", Array.from(onlineUsers.entries()));
    });

    // ============================================================
    // 1. MANUAL JOIN FALLBACK
    // ============================================================
    socket.on("join", (userId) => {
      socket.join(userId); 
      if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, { socketId: socket.id, name: "User", avatar: "" });
      }
      io.emit("user_status_update", { userId, status: "Online" });
      socket.emit("current_online_list", Array.from(onlineUsers.entries()));
    });

    // ============================================================
    // 2. TYPING INDICATORS
    // ============================================================
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("display_typing", { senderId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("hide_typing", { senderId });
    });

    // ============================================================
    // 3. MESSAGING
    // ============================================================
    socket.on("send_message", async (data) => {
      try {
        const savedMsg = await prisma.message.create({
          data: {
            content: data.text,
            type: data.type,
            senderId: String(data.senderId),
            receiverId: String(data.receiverId)
          }
        });
        
        io.to(data.receiverId).emit("receive_message", {
            ...data,
            id: savedMsg.id,
            createdAt: savedMsg.createdAt
        });
      } catch (error) {
        console.error("DB Save Error:", error);
      }
    });

    socket.on("mark_messages_read", ({ senderId, receiverId }) => {
        io.to(senderId).emit("messages_read_update", { receiverId });
    });

    // ============================================================
    // 4. CALLING EVENTS
    // ============================================================
    socket.on("outgoing_call", async ({ callerId, calleeId, callerName, isVideo, roomId }) => {
        console.log(`[Call] ${callerId} calling ${calleeId}`);
        try {
            const log = await prisma.callLog.create({
                data: {
                    initiatorId: callerId,
                    receiverId: calleeId,
                    type: isVideo ? "VIDEO" : "AUDIO",
                    status: "MISSED",
                }
            });

            io.to(calleeId).emit("incoming_call", { 
                callerId, callerName, isVideo, roomId, logId: log.id 
            });

            socket.emit("call_sent_success", { logId: log.id });
        } catch (e) { console.error("Error creating call log:", e); }
    });

    socket.on("call_accepted_signal", async ({ callerId, roomId, logId }) => {
        io.to(callerId).emit("call_accepted", { roomId });
        if (logId) {
            try {
                await prisma.callLog.update({
                    where: { id: logId },
                    data: { status: "COMPLETED" } 
                });
            } catch (e) { console.error("Error updating log (accept):", e); }
        }
    });

    socket.on("reject_call", async ({ callerId, logId }) => {
        io.to(callerId).emit("call_rejected");
        if (logId) {
            try {
                await prisma.callLog.update({
                    where: { id: logId },
                    data: { status: "REJECTED" }
                });
            } catch (e) { console.error("Error updating log (reject):", e); }
        }
    });

    socket.on("end_call", async ({ to, logId }) => {
        if (to) io.to(to).emit("call_ended");
        if (logId) {
            try {
                await prisma.callLog.update({
                    where: { id: logId },
                    data: { endedAt: new Date() }
                });
            } catch (e) { console.error("Error updating log (end):", e); }
        }
    });

    // ============================================================
    // 5. GROUP MEETING EVENTS
    // ============================================================
    socket.on("meeting_start", ({ roomId, userId }) => {
        socket.join(roomId);
        const roomData = meetingRooms.get(roomId) || { waiting: new Set() };
        roomData.hostSocketId = socket.id;
        roomData.hostUserId = userId;
        meetingRooms.set(roomId, roomData);
        console.log(`[Meeting] Host ${userId} started room ${roomId}`);
    });

    socket.on("join_request", ({ roomId, user }) => {
        const roomData = meetingRooms.get(roomId);
        if (!roomData || !roomData.hostSocketId) {
            socket.emit("join_status", { status: "no_host" });
            return;
        }
        console.log(`[Meeting] ${user.name} requesting to join ${roomId}`);
        io.to(roomData.hostSocketId).emit("guest_waiting", { socketId: socket.id, user: user });
    });

    socket.on("process_request", ({ guestSocketId, action }) => {
        io.to(guestSocketId).emit("join_status", { status: action });
    });

    socket.on("get_room_info", ({ roomId }) => {
        socket.join(roomId);
        const roomData = meetingRooms.get(roomId);
        if (roomData) {
            socket.emit("room_info", { hostIdentity: roomData.hostUserId });
        }
    });

    socket.on("kick_participant", ({ roomId, targetIdentity }) => {
        console.log(`Kick requested for User: ${targetIdentity} in Room: ${roomId}`);
        io.to(roomId).emit("participant_kicked", { userId: targetIdentity });
    });

    socket.on("end_meeting_for_all", ({ roomId }) => {
        console.log(`Host ended meeting: ${roomId}`);
        io.to(roomId).emit("meeting_ended");
        meetingRooms.delete(roomId);
    });

    socket.on("cancel_request", ({ roomId }) => {
        const roomData = meetingRooms.get(roomId);
        if (roomData && roomData.hostSocketId) {
            io.to(roomData.hostSocketId).emit("guest_cancelled", { socketId: socket.id });
        }
    });

    // ============================================================
    // 6. DISCONNECT & CLEANUP
    // ============================================================
    socket.on("disconnect", () => {
      // Cleanup Online Users
      for (const [userId, userData] of onlineUsers.entries()) {
        if (userData.socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("user_status_update", { userId, status: "Offline" });
          break;
        }
      }

      // Cleanup Meetings
      for (const [roomId, data] of meetingRooms.entries()) {
          if (data.hostSocketId === socket.id) {
              console.log(`[Meeting] Host disconnected from ${roomId}`);
              meetingRooms.delete(roomId);
          }
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});