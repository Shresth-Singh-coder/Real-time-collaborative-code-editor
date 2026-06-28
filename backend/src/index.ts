import express from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import ACTIONS from "./actions";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

type Client = {
    socketId: string;
    username: string;
};

const userSocketMap: Record<string, string> = {};

const getAllConnectedClients = (roomId: string): Client[] => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room) return [];

    return Array.from(room).map((socketId) => ({
        socketId,
        username: userSocketMap[socketId] ?? "",
    }));
};

app.use(express.static("build"));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }: { roomId: string; username: string }) => {
        userSocketMap[socket.id] = username;

        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }: { roomId: string; code: string }) => {
        socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }: { socketId: string; code: string }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];

        rooms.forEach((roomId) => {
            socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        delete userSocketMap[socket.id];
    });
});

const PORT = process.env.PORT ?? 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});