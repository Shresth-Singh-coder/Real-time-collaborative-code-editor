import { io } from "socket.io-client";

export const initSocket = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                     (import.meta.env.DEV ? "http://localhost:5000" : "/");
  const socket = io(backendUrl);

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
  });

  return socket;
};