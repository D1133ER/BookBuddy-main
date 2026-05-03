import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: isProduction ? undefined : false,
	}),
);
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
	}),
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
	max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
	message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Health check
app.get("/health", (_, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes placeholder
app.get("/api/books", (_, res) => {
	res.json({
		message: "BookBuddy API - Use VITE_USE_MOCK_DB=true for mock data",
	});
});

app.get("/api/users", (_, res) => {
	res.json({ message: "User endpoints" });
});

app.get("/api/transactions", (_, res) => {
	res.json({ message: "Transaction endpoints" });
});

// Socket.IO chat (replicated from chat server)
const onlineUsers = new Map();
const messageHistory = new Map();

io.on("connection", (socket) => {
	console.log(`[Socket.IO] Client connected: ${socket.id}`);

	socket.on("user:join", (userId) => {
		if (!onlineUsers.has(userId)) {
			onlineUsers.set(userId, new Set());
		}
		onlineUsers.get(userId).add(socket.id);
		io.emit("user:status", { userId, isOnline: true });
		const onlineUserIds = Array.from(onlineUsers.keys());
		socket.emit("users:online", onlineUserIds);
	});

	socket.on("message:private", (data) => {
		const { recipientId, senderId, content, timestamp, messageId } = data;
		const message = {
			id: messageId,
			senderId,
			recipientId,
			content,
			timestamp: timestamp || new Date().toISOString(),
		};
		const conversationId = [senderId, recipientId].sort().join("-");
		if (!messageHistory.has(conversationId)) {
			messageHistory.set(conversationId, []);
		}
		messageHistory.get(conversationId).push(message);
		const recipientSockets = onlineUsers.get(recipientId);
		if (recipientSockets) {
			recipientSockets.forEach((socketId) => {
				io.to(socketId).emit("message:new", message);
			});
		}
		socket.emit("message:sent", message);
	});

	socket.on("typing:start", ({ senderId, recipientId }) => {
		const recipientSockets = onlineUsers.get(recipientId);
		if (recipientSockets) {
			recipientSockets.forEach((socketId) => {
				io.to(socketId).emit("typing:update", {
					userId: senderId,
					isTyping: true,
				});
			});
		}
	});

	socket.on("typing:stop", ({ senderId, recipientId }) => {
		const recipientSockets = onlineUsers.get(recipientId);
		if (recipientSockets) {
			recipientSockets.forEach((socketId) => {
				io.to(socketId).emit("typing:update", {
					userId: senderId,
					isTyping: false,
				});
			});
		}
	});

	socket.on("message:history", ({ userId, otherUserId }, callback) => {
		const conversationId = [userId, otherUserId].sort().join("-");
		const history = messageHistory.get(conversationId) || [];
		callback(history);
	});

	socket.on("disconnect", () => {
		for (const [userId, sockets] of onlineUsers.entries()) {
			if (sockets.has(socket.id)) {
				sockets.delete(socket.id);
				if (sockets.size === 0) {
					onlineUsers.delete(userId);
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
║   🚀 BookBuddy API Server running on port ${PORT}             ║
║                                                            ║
║   Use VITE_USE_MOCK_DB=true for mock data              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
