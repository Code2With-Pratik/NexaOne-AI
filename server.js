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

// Track Online Users (Map: userId -> socketId)
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
    // 1. JOIN EVENT: User comes online (Global App Presence)
    socket.on("join", (userId) => {
      socket.join(userId); 
      onlineUsers.set(userId, socket.id); 
      
      console.log(`User ${userId} came online.`);
      io.emit("user_status_update", { userId, status: "Online" });
      socket.emit("current_online_list", Array.from(onlineUsers.keys()));
    });

    // 2. TYPING EVENTS
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("display_typing", { senderId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("hide_typing", { senderId });
    });

    // 3. MESSAGE EVENT
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

    // ============================================================
    // 4. 👇 CALLING EVENTS (UPDATED WITH DB LOGGING)
    // ============================================================

    // A. INITIATE CALL -> Create Log in DB
    socket.on("outgoing_call", async ({ callerId, calleeId, callerName, isVideo, roomId }) => {
        console.log(`[Call] ${callerId} calling ${calleeId}`);
        
        try {
            // 1. Create the Call Log immediately as "MISSED" (it updates if answered)
            const log = await prisma.callLog.create({
                data: {
                    initiatorId: callerId,
                    receiverId: calleeId,
                    type: isVideo ? "VIDEO" : "AUDIO",
                    status: "MISSED",
                }
            });

            // 2. Send the call signal to receiver WITH the logId
            io.to(calleeId).emit("incoming_call", { 
                callerId, 
                callerName, 
                isVideo, 
                roomId, 
                logId: log.id 
            });

            // 3. Send the logId back to the caller (so they can update it too)
            socket.emit("call_sent_success", { logId: log.id });

        } catch (e) {
            console.error("Error creating call log:", e);
        }
    });

    // B. ANSWER CALL -> Update Log to "COMPLETED" (Connected)
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

    // C. REJECT CALL -> Update Log to "REJECTED"
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

    // D. END CALL -> Set End Time
    socket.on("end_call", async ({ to, logId }) => {
        io.to(to).emit("call_ended");

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
    // 5. GROUP MEETING GATEKEEPER EVENTS
    // ============================================================

    // A. HOST STARTS MEETING
    socket.on("meeting_start", ({ roomId, userId }) => {
        const roomData = meetingRooms.get(roomId) || { waiting: new Set() };
        roomData.hostSocketId = socket.id;
        roomData.hostUserId = userId; 
        meetingRooms.set(roomId, roomData);
        
        console.log(`[Meeting] Host ${userId} started room ${roomId}`);
    });

    // B. GUEST REQUESTS TO JOIN
    socket.on("join_request", ({ roomId, user }) => {
        const roomData = meetingRooms.get(roomId);

        if (!roomData || !roomData.hostSocketId) {
            socket.emit("join_status", { status: "no_host" });
            return;
        }

        console.log(`[Meeting] ${user.name} requesting to join ${roomId}`);
        
        io.to(roomData.hostSocketId).emit("guest_waiting", { 
            socketId: socket.id, 
            user: user 
        });
    });

    // C. HOST PROCESSES REQUEST
    socket.on("process_request", ({ guestSocketId, action }) => {
        console.log(`[Meeting] Guest ${guestSocketId} was ${action}`);
        io.to(guestSocketId).emit("join_status", { status: action });
    });

    // D. KICK USER
    socket.on("kick_participant", ({ socketId }) => {
        io.to(socketId).emit("kicked");
    });

    // E. GUEST CANCELS REQUEST
    socket.on("cancel_request", ({ roomId }) => {
        const roomData = meetingRooms.get(roomId);
        if (roomData && roomData.hostSocketId) {
            io.to(roomData.hostSocketId).emit("guest_cancelled", { socketId: socket.id });
        }
    });

    // F. GET ROOM INFO
    socket.on("get_room_info", ({ roomId }) => {
        const roomData = meetingRooms.get(roomId);
        if (roomData) {
            socket.emit("room_info", { hostIdentity: roomData.hostUserId });
        }
    });

    // ============================================================

    // 6. DISCONNECT
    socket.on("disconnect", () => {
      // Cleanup Online Users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
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