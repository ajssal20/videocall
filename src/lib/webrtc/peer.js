const turnUrls = (import.meta.env.VITE_TURN_URLS || import.meta.env.VITE_TURN_URL || '')
	.split(',')
	.map((url) => url.trim())
	.filter(Boolean);

const ICE_SERVERS = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{ urls: 'stun:stun2.l.google.com:19302' },
		{ urls: 'stun:stun.relay.metered.ca:80' },
		...turnUrls.map((url) => ({
			urls: url,
			username: import.meta.env.VITE_TURN_USERNAME,
			credential: import.meta.env.VITE_TURN_CREDENTIAL
		}))
	]
};

export function createPeerConnection() {
	const peerConnection = new RTCPeerConnection({
		iceServers: ICE_SERVERS.iceServers
	});

	window.__peerConnection = peerConnection;

	return peerConnection;
}

export function addStreamToPeer(peerConnection, stream) {
	if (!peerConnection || !stream) return;

	stream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, stream);
	});
}

export async function createOffer(peerConnection) {
	try {
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
		return offer;
	} catch (err) {
		throw new Error(`Offer-Erstellung fehlgeschlagen: ${err.message}`);
	}
}

export async function createAnswer(peerConnection) {
	try {
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		return answer;
	} catch (err) {
		throw new Error(`Answer-Erstellung fehlgeschlagen: ${err.message}`);
	}
}

export async function setRemoteDescription(peerConnection, description) {
	try {
		await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
	} catch (err) {
		throw new Error(`Remote Description fehlgeschlagen: ${err.message}`);
	}
}

export async function addIceCandidate(peerConnection, candidate) {
	try {
		if (candidate) {
			await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
		}
	} catch (err) {
		console.error('ICE-Kandidat fehlgeschlagen:', err);
	}
}

export function closePeerConnection(peerConnection) {
	if (peerConnection) {
		peerConnection.close();
		window.__peerConnection = null;
	}
}

export function getConnectionState(peerConnection) {
	if (!peerConnection) return 'disconnected';
	return peerConnection.connectionState;
}

export function getIceConnectionState(peerConnection) {
	if (!peerConnection) return 'disconnected';
	return peerConnection.iceConnectionState;
}

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
