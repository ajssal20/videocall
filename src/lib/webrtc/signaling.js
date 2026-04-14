import { io } from 'socket.io-client';

let socket = null;

export function connectToSignalingServer(signalingUrl, handlers = {}) {
	return new Promise((resolve, reject) => {
		try {
			socket = io(signalingUrl, {
				transports: ['websocket', 'polling'],
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				reconnectionAttempts: 5
			});

			const {
				onConnect,
				onDisconnect,
				onError,
				onRoomFull,
				onRoomJoined,
				onUserJoined,
				onOffer,
				onAnswer,
				onIceCandidate,
				onUserLeft
			} = handlers;

			
			socket.on('connect', () => {
				console.log('Mit Signaling-Server verbunden');
				if (onConnect) onConnect();
				resolve(socket);
			});

			socket.on('disconnect', () => {
				console.log('Von Signaling-Server getrennt');
				if (onDisconnect) onDisconnect();
			});

			socket.on('error', (err) => {
				console.error('Signaling-Fehler:', err);
				if (onError) onError(err);
				reject(err);
			});

			
			socket.on('room-full', () => {
				console.log('Raum ist voll');
				if (onRoomFull) onRoomFull();
			});

			socket.on('joined-room', (data) => {
				console.log('Raum beigetreten:', data);
				if (onRoomJoined) onRoomJoined(data);
			});

			socket.on('user-joined', (data) => {
				console.log('Benutzer beigetreten:', data);
				if (onUserJoined) onUserJoined(data);
			});

			socket.on('offer', (data) => {
				if (onOffer) onOffer(data);
			});

			socket.on('answer', (data) => {
				console.log('Answer erhalten');
				if (onAnswer) onAnswer(data);
			});

			socket.on('ice-candidate', (data) => {
				if (onIceCandidate) onIceCandidate(data);
			});

			socket.on('user-left', () => {
				console.log('Benutzer hat den Raum verlassen');
				if (onUserLeft) onUserLeft();
			});
		} catch (err) {
			console.error('Verbindung zum Signaling-Server fehlgeschlagen:', err);
			reject(err);
		}
	});
}

export function joinRoom(roomCode, isInitiator = false) {
	if (!socket) throw new Error('Nicht mit Signaling-Server verbunden');

	socket.emit('join-room', {
		roomCode,
		isInitiator,
		timestamp: Date.now()
	});
}

export function sendOffer(offer) {
	if (!socket) throw new Error('Nicht mit Signaling-Server verbunden');

	socket.emit('offer', {
		offer: offer.toJSON ? offer.toJSON() : offer,
		timestamp: Date.now()
	});
}

export function sendAnswer(answer) {
	if (!socket) throw new Error('Nicht mit Signaling-Server verbunden');

	socket.emit('answer', {
		answer: answer.toJSON ? answer.toJSON() : answer,
		timestamp: Date.now()
	});
}


export function sendIceCandidate(candidate) {
	if (!socket) throw new Error('Nicht mit Signaling-Server verbunden');

	socket.emit('ice-candidate', {
		candidate: candidate.toJSON ? candidate.toJSON() : candidate,
		timestamp: Date.now()
	});
}
export function leaveRoom() {
	if (socket) {
		socket.emit('leave-room');
	}
}
export function disconnectSignaling() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export function getSocket() {
	return socket;
}
