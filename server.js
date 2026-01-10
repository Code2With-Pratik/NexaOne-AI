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
// We use a Map to instantly look up if a user is online
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
      // (So they know who else is online immediately)
      socket.emit("current_online_list", Array.from(onlineUsers.keys()));
    });

    // 2. TYPING EVENT: User starts typing
    socket.on("typing", ({ senderId, receiverId }) => {
      // Send only to the specific receiver
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

    // 5. CALL EVENTS
    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    });
    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });

    // 6. DISCONNECT: User leaves
    socket.on("disconnect", () => {
      // Find which user disconnected
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline.`);
          // Tell everyone they are offline
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