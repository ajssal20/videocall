/**
 * Peer Module
 * Verwaltet die WebRTC-Peer-Verbindung zwischen zwei Clients
 */

// STUN und TURN-Konfiguration
// WICHTIG: Ersetzen Sie die TURN-Server mit Ihren eigenen Zugangsdaten!
const ICE_SERVERS = {
	iceServers: [
		// Öffentliche STUN-Server
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{ urls: 'stun:stun2.l.google.com:19302' },
		// WICHTIG: TURN-Server konfigurieren!
		// Beispiel (ersetzen Sie mit Ihren Daten):
		// {
		//   urls: 'turn:your-turn-server.com:3478',
		//   username: 'your-username',
		//   credential: 'your-password'
		// }
	]
};

/**
 * Erstellt eine neue WebRTC-Peer-Verbindung
 * @returns {RTCPeerConnection}
 */
export function createPeerConnection() {
	const peerConnection = new RTCPeerConnection({
		iceServers: ICE_SERVERS.iceServers
	});

	// Speichere die Verbindung global für Media-Track-Wechsel
	window.__peerConnection = peerConnection;

	return peerConnection;
}

/**
 * Fügt einen MediaStream zu einer Peer-Verbindung hinzu
 * @param {RTCPeerConnection} peerConnection
 * @param {MediaStream} stream
 */
export function addStreamToPeer(peerConnection, stream) {
	if (!peerConnection || !stream) return;

	stream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, stream);
	});
}

/**
 * Erstellt ein SDP-Offer
 * @param {RTCPeerConnection} peerConnection
 * @returns {Promise<RTCSessionDescription>}
 */
export async function createOffer(peerConnection) {
	try {
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
		return offer;
	} catch (err) {
		throw new Error(`Offer-Erstellung fehlgeschlagen: ${err.message}`);
	}
}

/**
 * Erstellt ein SDP-Answer
 * @param {RTCPeerConnection} peerConnection
 * @returns {Promise<RTCSessionDescription>}
 */
export async function createAnswer(peerConnection) {
	try {
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		return answer;
	} catch (err) {
		throw new Error(`Answer-Erstellung fehlgeschlagen: ${err.message}`);
	}
}

/**
 * Setzt eine entfernte SDP-Beschreibung
 * @param {RTCPeerConnection} peerConnection
 * @param {RTCSessionDescription} description
 */
export async function setRemoteDescription(peerConnection, description) {
	try {
		await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
	} catch (err) {
		throw new Error(`Remote Description fehlgeschlagen: ${err.message}`);
	}
}

/**
 * Fügt einen ICE-Kandidaten hinzu
 * @param {RTCPeerConnection} peerConnection
 * @param {RTCIceCandidate} candidate
 */
export async function addIceCandidate(peerConnection, candidate) {
	try {
		if (candidate) {
			await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
		}
	} catch (err) {
		console.error('ICE-Kandidat fehlgeschlagen:', err);
	}
}

/**
 * Schließt eine Peer-Verbindung
 * @param {RTCPeerConnection} peerConnection
 */
export function closePeerConnection(peerConnection) {
	if (peerConnection) {
		peerConnection.close();
		window.__peerConnection = null;
	}
}

/**
 * Gibt die Verbindungsstatus zurück
 * @param {RTCPeerConnection} peerConnection
 * @returns {string} connection state
 */
export function getConnectionState(peerConnection) {
	if (!peerConnection) return 'disconnected';
	return peerConnection.connectionState;
}

/**
 * Gibt die ICE-Verbindungsstatus zurück
 * @param {RTCPeerConnection} peerConnection
 * @returns {string} iceConnectionState
 */
export function getIceConnectionState(peerConnection) {
	if (!peerConnection) return 'disconnected';
	return peerConnection.iceConnectionState;
}

/**
 * Registriert Handler für wichtige Peer-Events
 * @param {RTCPeerConnection} peerConnection
 * @param {Object} handlers - Callbacks: { onIceCandidate, onTrack, onStateChange }
 */
export function setupPeerEventHandlers(peerConnection, handlers) {
	const { onIceCandidate, onTrack, onStateChange, onConnectionStateChange } = handlers;

	if (onIceCandidate) {
		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				onIceCandidate(event.candidate);
			}
		};
	}

	if (onTrack) {
		peerConnection.ontrack = (event) => {
			onTrack(event.streams[0]);
		};
	}

	if (onStateChange) {
		peerConnection.oniceconnectionstatechange = () => {
			onStateChange(peerConnection.iceConnectionState);
		};
	}

	if (onConnectionStateChange) {
		peerConnection.onconnectionstatechange = () => {
			onConnectionStateChange(peerConnection.connectionState);
		};
	}
}
