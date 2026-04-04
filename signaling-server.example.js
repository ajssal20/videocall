/**
 * BEISPIEL-Signaling-Server für VideoCall
 * 
 * Dies ist ein einfaches Beispiel-Signaling-Server mit Socket.IO
 * 
 * Installation:
 * npm install express socket.io cors
 * 
 * Start:
 * node signaling-server.js
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

app.use(cors());

const PORT = process.env.PORT || 3000;

// Store für aktive Räume und Benutzer
const rooms = new Map();

io.on('connection', (socket) => {
	console.log('Benutzer verbunden:', socket.id);

	// Ein Benutzer tritt einem Raum bei
	socket.on('join-room', (data) => {
		const { roomCode, isInitiator } = data;

		if (!rooms.has(roomCode)) {
			rooms.set(roomCode, {
				users: [],
				initiator: socket.id
			});
		}

		const room = rooms.get(roomCode);

		// Prüfe, ob der Raum voll ist (maximal 2 Benutzer)
		if (room.users.length >= 2) {
			socket.emit('room-full');
			return;
		}

		// Benutzer zum Raum hinzufügen und zur Socket-IO-Room beitreten
		room.users.push(socket.id);
		socket.join(roomCode);

		console.log(`Benutzer ${socket.id} betrat Raum ${roomCode}. Teilnehmer: ${room.users.length}`);

		// Informiere den beigetretenen Benutzer darüber, ob er der Initiator ist
		socket.emit('joined-room', {
			isInitiator: room.initiator === socket.id,
			participantCount: room.users.length,
			roomCode
		});

		// Benachrichtige alle anderen im Raum, dass ein Benutzer zugefügt wurde
		if (room.users.length === 2) {
			// Benachrichtige beide Benutzer
			io.to(roomCode).emit('user-joined', {
				participantCount: 2,
				roomCode
			});
		}
	});

	// Übermittle Offer
	socket.on('offer', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) {
			socket.to(roomCode).emit('offer', data);
		}
	});

	// Übermittle Answer
	socket.on('answer', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) {
			socket.to(roomCode).emit('answer', data);
		}
	});

	// Übermittle ICE-Kandidaten
	socket.on('ice-candidate', (data) => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);
		if (roomCode) {
			socket.to(roomCode).emit('ice-candidate', data);
		}
	});

	// Benutzer verlässt den Raum
	socket.on('leave-room', () => {
		const roomCode = Array.from(socket.rooms).find((room) => room !== socket.id);

		if (roomCode && rooms.has(roomCode)) {
			const room = rooms.get(roomCode);
			room.users = room.users.filter((id) => id !== socket.id);

			// Benachrichtige andere Benutzer
			io.to(roomCode).emit('user-left', {
				userId: socket.id
			});

			console.log(`Benutzer ${socket.id} verließ Raum ${roomCode}. Teilnehmer: ${room.users.length}`);

			// Lösche Raum, wenn leer
			if (room.users.length === 0) {
				rooms.delete(roomCode);
				console.log(`Raum ${roomCode} wurde gelöscht`);
			}
		}

		socket.leave(roomCode);
	});

	// Verbindung getrennt
	socket.on('disconnect', () => {
		console.log('Benutzer getrennt:', socket.id);

		// Entferne Benutzer aus allen Räumen
		for (const [roomCode, room] of rooms.entries()) {
			if (room.users.includes(socket.id)) {
				room.users = room.users.filter((id) => id !== socket.id);

				// Benachrichtige andere
				io.to(roomCode).emit('user-left', {
					userId: socket.id
				});

				console.log(`Benutzer ${socket.id} wurde aus Raum ${roomCode} entfernt.`);

				// Lösche Raum, wenn leer
				if (room.users.length === 0) {
					rooms.delete(roomCode);
					console.log(`Raum ${roomCode} wurde gelöscht`);
				}
			}
		}
	});

	// Health Check
	socket.on('ping', () => {
		socket.emit('pong');
	});
});

// Health Check Endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Statistics Endpoint (nur für Debugging)
app.get('/stats', (req, res) => {
	const stats = {
		activeConnections: io.engine.clientsCount,
		activeRooms: rooms.size,
		rooms: Array.from(rooms.entries()).map(([code, room]) => ({
			code,
			participants: room.users.length,
			initiator: room.initiator
		}))
	};
	res.json(stats);
});

httpServer.listen(PORT, () => {
	console.log(`🎥 Signaling-Server läuft auf http://localhost:${PORT}`);
	console.log(`📊 Stats verfügbar auf http://localhost:${PORT}/stats`);
	console.log(`❤️ Health Check auf http://localhost:${PORT}/health`);
});
