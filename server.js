const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

// 1. Load env vars
require('dotenv').config(); 

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// 2. Initialize Prisma with the Postgres Adapter (The Prisma 7 Way)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  let onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
    });

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

        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            ...data,
            id: savedMsg.id,
            createdAt: savedMsg.createdAt
          });
        }
      } catch (error) {
        console.error("DB Save Error:", error);
      }
    });

    // ... Keep your existing video call events here (callUser, answerCall, etc.) ...
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        const receiverSocketId = onlineUsers.get(userToCall);
        if (receiverSocketId) io.to(receiverSocketId).emit("callUser", { signal: signalData, from, name });
    });
    socket.on("answerCall", (data) => {
        const callerSocketId = onlineUsers.get(data.to);
        if (callerSocketId) io.to(callerSocketId).emit("callAccepted", data.signal);
    });
    socket.on("endCall", ({ to }) => {
        const socketId = onlineUsers.get(to);
        if (socketId) io.to(socketId).emit("callEnded");
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});