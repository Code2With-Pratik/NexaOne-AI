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

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    // 1. JOIN EVENT: User comes online
    socket.on("join", (userId) => {
      socket.join(userId); // Join a room with their own ID
      onlineUsers.set(userId, socket.id); // Mark as online
      
      console.log(`User ${userId} came online.`);
      
      // Broadcast to EVERYONE that this user is now online
      io.emit("user_status_update", { userId, status: "Online" });
      
      // Send the list of currently online users to the new person
      socket.emit("current_online_list", Array.from(onlineUsers.keys()));
    });

    // 2. TYPING EVENT: User starts typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("display_typing", { senderId });
    });

    // 3. STOP TYPING EVENT: User stops
    socket.on("stop_typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("hide_typing", { senderId });
    });

    // 4. MESSAGE EVENT
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
        
        // Send to Receiver
        io.to(data.receiverId).emit("receive_message", {
            ...data,
            id: savedMsg.id,
            createdAt: savedMsg.createdAt
        });

      } catch (error) {
        console.error("DB Save Error:", error);
      }
    });

    // 5. CALLING EVENTS (UPDATED FOR LIVEKIT 1-ON-1)
    
    // A. Caller starts a call -> Notify Receiver
    socket.on("outgoing_call", ({ callerId, calleeId, callerName, isVideo, roomId }) => {
        console.log(`[Call] ${callerId} calling ${calleeId} (Video: ${isVideo}) in room ${roomId}`);
        
        // Send notification to the receiver's room
        io.to(calleeId).emit("incoming_call", { 
            callerId, 
            callerName, 
            isVideo, 
            roomId 
        });
    });

    // B. Receiver Accepts -> Notify Caller to join room
    socket.on("call_accepted_signal", ({ callerId, roomId }) => {
        console.log(`[Call] Call accepted by receiver. Notifying caller ${callerId}`);
        io.to(callerId).emit("call_accepted", { roomId });
    });

    // C. End Call -> Notify the other person to close the overlay
    socket.on("end_call", ({ to }) => {
        console.log(`[Call] End signal sent to ${to}`);
        io.to(to).emit("call_ended");
    });

    // 6. DISCONNECT: User leaves
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline.`);
          io.emit("user_status_update", { userId, status: "Offline" });
          break;
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