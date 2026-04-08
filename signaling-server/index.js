import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const corsOptions = {
	origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
	methods: ['GET', 'POST']
};

const io = new SocketIOServer(httpServer, {
	cors: corsOptions,
	transports: ['websocket', 'polling']
});

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;
const rooms = new Map();

function removeUserFromRooms(socketId) {
	for (const [roomCode, room] of rooms.entries()) {
		if (!room.users.includes(socketId)) continue;

		room.users = room.users.filter((id) => id !== socketId);
		io.to(roomCode).emit('user-left', { userId: socketId });

		if (room.users.length === 0) {
			rooms.delete(roomCode);
		}
	}
}

io.on('connection', (socket) => {
	console.log('socket connected', socket.id);

	socket.on('join-room', ({ roomCode }) => {
		if (!roomCode) return;

		if (!rooms.has(roomCode)) {
			rooms.set(roomCode, {
				users: [],
				initiator: socket.id
			});
		}

		const room = rooms.get(roomCode);

		if (room.users.length >= 2) {
			socket.emit('room-full');
			return;
		}

		if (!room.users.includes(socket.id)) {
			room.users.push(socket.id);
		}

		socket.join(roomCode);

		socket.emit('joined-room', {
			isInitiator: room.initiator === socket.id,
			participantCount: room.users.length,
			roomCode
		});

		if (room.users.length === 2) {
			io.to(roomCode).emit('user-joined', {
				participantCount: 2,
				roomCode
			});
		}
	});

	socket.on('offer', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) socket.to(roomCode).emit('offer', data);
	});

	socket.on('answer', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) socket.to(roomCode).emit('answer', data);
	});

	socket.on('ice-candidate', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) socket.to(roomCode).emit('ice-candidate', data);
	});

	socket.on('leave-room', () => {
		removeUserFromRooms(socket.id);
	});

	socket.on('disconnect', () => {
		removeUserFromRooms(socket.id);
	});
});

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
	res.json({
		activeConnections: io.engine.clientsCount,
		activeRooms: rooms.size,
		rooms: Array.from(rooms.entries()).map(([code, room]) => ({
			code,
			participants: room.users.length,
			initiator: room.initiator
		}))
	});
});

httpServer.listen(PORT, () => {
	console.log(`Signaling server listening on ${PORT}`);
});
