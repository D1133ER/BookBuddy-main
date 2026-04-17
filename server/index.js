import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

// Store message history (in-memory, for demo purposes)
const messageHistory = new Map(); // Map<conversationId, Message[]>

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // User joins with their user ID
  socket.on("user:join", (userId) => {
    console.log(`[Socket.IO] User ${userId} joined with socket ${socket.id}`);
    
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast user's online status to all connected clients
    io.emit("user:status", { userId, isOnline: true });

    // Send list of online users to the joining user
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit("users:online", onlineUserIds);
  });

  // Handle private message
  socket.on("message:private", (data) => {
    const { recipientId, senderId, content, timestamp, messageId } = data;
    console.log(`[Socket.IO] Private message from ${senderId} to ${recipientId}`);

    const message = {
      id: messageId,
      senderId,
      recipientId,
      content,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Store in history
    const conversationId = [senderId, recipientId].sort().join("-");
    if (!messageHistory.has(conversationId)) {
      messageHistory.set(conversationId, []);
    }
    messageHistory.get(conversationId).push(message);

    // Send to recipient if online
    const recipientSockets = onlineUsers.get(recipientId);
    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("message:new", message);
      });
    }

    // Send back to sender for confirmation
    socket.emit("message:sent", message);
  });

  // Handle typing indicator
  socket.on("typing:start", ({ senderId, recipientId }) => {
    console.log(`[Socket.IO] ${senderId} is typing to ${recipientId}`);
    const recipientSockets = onlineUsers.get(recipientId);
    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("typing:update", { userId: senderId, isTyping: true });
      });
    }
  });

  socket.on("typing:stop", ({ senderId, recipientId }) => {
    console.log(`[Socket.IO] ${senderId} stopped typing to ${recipientId}`);
    const recipientSockets = onlineUsers.get(recipientId);
    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit("typing:update", { userId: senderId, isTyping: false });
      });
    }
  });

  // Handle read receipt
  socket.on("message:read", ({ conversationId, readerId, readBy }) => {
    console.log(`[Socket.IO] Messages in ${conversationId} read by ${readBy}`);
    
    // Notify the other user
    const otherUserId = conversationId.replace(readBy, "").replace("-", "");
    const otherUserSockets = onlineUsers.get(otherUserId);
    if (otherUserSockets) {
      otherUserSockets.forEach((socketId) => {
        io.to(socketId).emit("message:read", { conversationId, readBy });
      });
    }
  });

  // Get message history for a conversation
  socket.on("message:history", ({ userId, otherUserId }, callback) => {
    const conversationId = [userId, otherUserId].sort().join("-");
    const history = messageHistory.get(conversationId) || [];
    console.log(`[Socket.IO] Sending history for ${conversationId}: ${history.length} messages`);
    callback(history);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);

    // Find and remove user from online users
    for (const [userId, sockets] of onlineUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast user's offline status
          io.emit("user:status", { userId, isOnline: false });
        }
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 BookBuddy Chat Server running on port ${PORT}          ║
║                                                            ║
║   Socket.IO Real-time Chat Enabled                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
