import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import Meeting from "./models/Meeting.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
    res.send("Video Calling Server is running!");
});

const rooms = new Map();
const socketToUser = new Map();

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", async ({ roomId, userName, userId, isAdmin }) => {
        try {
            socket.join(roomId);
            
            if (!rooms.has(roomId)) {
                rooms.set(roomId, {
                    users: new Set(),
                    admin: isAdmin ? socket.id : null,
                    permissions: new Map()
                });
            }
            
            const room = rooms.get(roomId);
            room.users.add(socket.id);
            
            if (room.users.size === 1) {
                room.admin = socket.id;
            }
            
            socketToUser.set(socket.id, { userId, userName, roomId });
            
            room.permissions.set(socket.id, {
                canSpeak: true,
                canVideo: true,
                canScreenShare: true
            });
            
            // Update meeting participants in database
            await Meeting.findOneAndUpdate(
                { meetingId: roomId },
                {
                    $push: {
                        participants: {
                            userId,
                            name: userName,
                            joinedAt: new Date()
                        }
                    }
                }
            );
            
            socket.to(roomId).emit("user-joined", {
                userId: socket.id,
                userName,
                isAdmin: room.admin === socket.id
            });
            
            const users = Array.from(room.users).map(id => ({
                userId: id,
                userName: socketToUser.get(id)?.userName,
                isAdmin: id === room.admin,
                permissions: room.permissions.get(id)
            }));
            
            socket.emit("room-users", users);
            
            io.to(roomId).emit("room-users-updated", users);
            
            console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);
        } catch (error) {
            console.error("Error joining room:", error);
            socket.emit("error", { message: "Failed to join room" });
        }
    });

    socket.on("offer", ({ offer, to }) => {
        socket.to(to).emit("offer", {
            offer,
            from: socket.id,
            userName: socketToUser.get(socket.id)?.userName
        });
    });

    socket.on("answer", ({ answer, to }) => {
        socket.to(to).emit("answer", {
            answer,
            from: socket.id
        });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
        socket.to(to).emit("ice-candidate", {
            candidate,
            from: socket.id
        });
    });

    socket.on("chat-message", async ({ roomId, message }) => {
        try {
            const user = socketToUser.get(socket.id);
            if (!user) {
                console.error("Chat message from unknown user:", socket.id);
                return;
            }
            
            console.log(`Chat message from ${user.userName} in room ${roomId}: ${message}`);
            
            const chatMessage = {
                sender: user.userName,
                message,
                timestamp: new Date(),
                senderId: socket.id
            };
            
            await Meeting.findOneAndUpdate(
                { meetingId: roomId },
                {
                    $push: {
                        chatHistory: {
                            sender: user.userName,
                            message,
                            timestamp: new Date()
                        }
                    }
                }
            );
            
            socket.to(roomId).emit("chat-message", chatMessage);
            console.log(`Chat message sent to room ${roomId}, recipients:`, Array.from(rooms.get(roomId)?.users || []));
        } catch (error) {
            console.error("Error sending chat message:", error);
        }
    });

    socket.on("toggle-audio", ({ roomId, isEnabled }) => {
        const user = socketToUser.get(socket.id);
        if (user) {
            socket.to(roomId).emit("user-audio-toggle", {
                userId: socket.id,
                userName: user.userName,
                isEnabled
            });
        }
    });

    socket.on("toggle-video", ({ roomId, isEnabled }) => {
        const user = socketToUser.get(socket.id);
        if (user) {
            socket.to(roomId).emit("user-video-toggle", {
                userId: socket.id,
                userName: user.userName,
                isEnabled
            });
        }
    });

    socket.on("start-screen-share", ({ roomId }) => {
        const user = socketToUser.get(socket.id);
        if (user) {
            socket.to(roomId).emit("user-screen-share-start", {
                userId: socket.id,
                userName: user.userName
            });
        }
    });

    socket.on("stop-screen-share", ({ roomId }) => {
        const user = socketToUser.get(socket.id);
        if (user) {
            socket.to(roomId).emit("user-screen-share-stop", {
                userId: socket.id,
                userName: user.userName
            });
        }
    });

    socket.on("update-permissions", ({ roomId, targetUserId, permissions }) => {
        const room = rooms.get(roomId);
        if (!room || room.admin !== socket.id) {
            socket.emit("error", { message: "Only admin can update permissions" });
            return;
        }
        
        room.permissions.set(targetUserId, permissions);
        
        io.to(targetUserId).emit("permissions-updated", permissions);
        
        io.to(roomId).emit("user-permissions-changed", {
            userId: targetUserId,
            permissions
        });
    });

    socket.on("remove-user", ({ roomId, targetUserId }) => {
        const room = rooms.get(roomId);
        if (!room || room.admin !== socket.id) {
            socket.emit("error", { message: "Only admin can remove users" });
            return;
        }
        
        io.to(targetUserId).emit("removed-from-room", {
            message: "You have been removed from the meeting by the admin"
        });
        
        const targetSocket = io.sockets.sockets.get(targetUserId);
        if (targetSocket) {
            targetSocket.leave(roomId);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        
        const user = socketToUser.get(socket.id);
        if (user) {
            const { roomId, userName } = user;
            const room = rooms.get(roomId);
            
            if (room) {
                room.users.delete(socket.id);
                room.permissions.delete(socket.id);
                
                if (room.admin === socket.id && room.users.size > 0) {
                    room.admin = Array.from(room.users)[0];
                    io.to(room.admin).emit("promoted-to-admin");
                }
                
                if (room.users.size === 0) {
                    rooms.delete(roomId);
                } else {
                    const updatedUsers = Array.from(room.users).map(id => ({
                        userId: id,
                        userName: socketToUser.get(id)?.userName,
                        isAdmin: id === room.admin,
                        permissions: room.permissions.get(id)
                    }));
                    io.to(roomId).emit("room-users-updated", updatedUsers);
                }
                
                socket.to(roomId).emit("user-left", {
                    userId: socket.id,
                    userName
                });
            }
            
            socketToUser.delete(socket.id);
        }
    });

    socket.on("leave-room", ({ roomId }) => {
        const user = socketToUser.get(socket.id);
        if (user) {
            socket.leave(roomId);
            
            const room = rooms.get(roomId);
            if (room) {
                room.users.delete(socket.id);
                room.permissions.delete(socket.id);
                
                if (room.admin === socket.id && room.users.size > 0) {
                    room.admin = Array.from(room.users)[0];
                    io.to(room.admin).emit("promoted-to-admin");
                }
                
                if (room.users.size === 0) {
                    rooms.delete(roomId);
                } else {
                    const updatedUsers = Array.from(room.users).map(id => ({
                        userId: id,
                        userName: socketToUser.get(id)?.userName,
                        isAdmin: id === room.admin,
                        permissions: room.permissions.get(id)
                    }));
                    io.to(roomId).emit("room-users-updated", updatedUsers);
                }
                
                socket.to(roomId).emit("user-left", {
                    userId: socket.id,
                    userName: user.userName
                });
            }
            
            socketToUser.delete(socket.id);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
});