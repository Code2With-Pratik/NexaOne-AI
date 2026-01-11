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

// 👇 Track Active Meetings (Map: roomId -> { hostSocketId, hostUserId, waitingUsers: Set })
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

    // 4. CALLING EVENTS (1-on-1)
    socket.on("outgoing_call", ({ callerId, calleeId, callerName, isVideo, roomId, logId }) => {
        console.log(`[Call] ${callerId} calling ${calleeId}`);
        io.to(calleeId).emit("incoming_call", { callerId, callerName, isVideo, roomId, logId });
    });

    socket.on("call_accepted_signal", ({ callerId, roomId }) => {
        io.to(callerId).emit("call_accepted", { roomId });
    });

    socket.on("end_call", ({ to }) => {
        io.to(to).emit("call_ended");
    });

    // ============================================================
    // 5. 👇 GROUP MEETING GATEKEEPER EVENTS (Complete)
    // ============================================================

    // A. HOST STARTS MEETING
    socket.on("meeting_start", ({ roomId, userId }) => {
        // Register this socket as the HOST for this room
        const roomData = meetingRooms.get(roomId) || { waiting: new Set() };
        roomData.hostSocketId = socket.id;
        roomData.hostUserId = userId; // Important for Host Badge
        meetingRooms.set(roomId, roomData);
        
        console.log(`[Meeting] Host ${userId} started room ${roomId}`);
    });

    // B. GUEST REQUESTS TO JOIN (Knock Knock)
    socket.on("join_request", ({ roomId, user }) => {
        const roomData = meetingRooms.get(roomId);

        if (!roomData || !roomData.hostSocketId) {
            // No host? Maybe auto-join or error. For now, tell guest host is missing.
            socket.emit("join_status", { status: "no_host" });
            return;
        }

        console.log(`[Meeting] ${user.name} requesting to join ${roomId}`);
        
        // Notify HOST that someone is waiting
        io.to(roomData.hostSocketId).emit("guest_waiting", { 
            socketId: socket.id, 
            user: user 
        });
    });

    // C. HOST PROCESSES REQUEST (Approve/Reject)
    socket.on("process_request", ({ guestSocketId, action }) => {
        // action = "approved" | "rejected"
        console.log(`[Meeting] Guest ${guestSocketId} was ${action}`);
        
        // Notify the GUEST of the decision
        io.to(guestSocketId).emit("join_status", { status: action });
    });

    // D. KICK USER
    socket.on("kick_participant", ({ socketId }) => {
        io.to(socketId).emit("kicked");
    });

    // E. 👇 NEW: GUEST CANCELS REQUEST
    socket.on("cancel_request", ({ roomId }) => {
        const roomData = meetingRooms.get(roomId);
        if (roomData && roomData.hostSocketId) {
            // Tell Host to remove this user from the list
            io.to(roomData.hostSocketId).emit("guest_cancelled", { socketId: socket.id });
        }
    });

    // F. 👇 NEW: GET ROOM INFO (For Host Badge)
    socket.on("get_room_info", ({ roomId }) => {
        const roomData = meetingRooms.get(roomId);
        if (roomData) {
            // Send back the Host's User ID so clients can show the crown icon
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

      // Cleanup Meetings (If Host leaves, maybe warn others?)
      for (const [roomId, data] of meetingRooms.entries()) {
          if (data.hostSocketId === socket.id) {
              // Host disconnected
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