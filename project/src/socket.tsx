import { io } from "socket.io-client";

export const initSocket = async () => {
  const socket = io("http://127.0.0.1:5000");

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
  });

  return socket;
};