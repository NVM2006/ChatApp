import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Link Frontend của bạn
  },
});

// Object dùng để lưu trữ: Biến User ID thành Socket ID
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("Một người dùng đã kết nối:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id; // Lưu lại ID thiết bị của user này
  }

  // Lắng nghe sự kiện ngắt kết nối
  socket.on("disconnect", () => {
    console.log("Người dùng ngắt kết nối:", socket.id);
    delete userSocketMap[userId];
  });
});

export { app, io, server };
