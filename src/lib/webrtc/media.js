/**
 * Media Module
 * Verwaltet den Zugriff auf Kamera und Mikrofon
 */

/**
 * Fordert Zugriff auf Kamera und Mikrofon an
 * @param {string} audioDeviceId - Optional: spezifische Mikrofon-ID
 * @param {string} videoDeviceId - Optional: spezifische Kamera-ID
 * @returns {Promise<MediaStream>}
 */
export async function getMediaStream(audioDeviceId = null, videoDeviceId = null) {
	const constraints = {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			autoGainControl: true
		},
		video: {
			width: { ideal: 1280 },
			height: { ideal: 720 }
		}
	};

	// Nutze spezifische Geräte-IDs, falls vorhanden
	if (audioDeviceId) {
		constraints.audio.deviceId = { exact: audioDeviceId };
	}
	if (videoDeviceId) {
		constraints.video.deviceId = { exact: videoDeviceId };
	}

	try {
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		return stream;
	} catch (err) {
		throw new Error(
			`Medienzugriff fehlgeschlagen: ${err.name === 'NotAllowedError' ? 'Berechtigung verweigert' : err.message}`
		);
	}
}

/**
 * Fordert Zugriff auf Bildschirmfreigabe an
 * @returns {Promise<MediaStream>}
 */
export async function getScreenShare() {
	try {
		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: {
				cursor: 'always'
			},
			audio: false
		});
		return stream;
	} catch (err) {
		if (err.name === 'NotAllowedError') {
			throw new Error('Bildschirmfreigabe wurde abgebrochen');
		}
		throw new Error(`Bildschirmfreigabe fehlgeschlagen: ${err.message}`);
	}
}

/**
 * Ersetzt einen Video-Track in einem bestehenden MediaStream
 * @param {MediaStream} stream - Der existierende Stream
 * @param {MediaStreamTrack} newTrack - Der neue Video-Track
 */
export function replaceVideoTrack(stream, newTrack) {
	const oldTrack = stream.getVideoTracks()[0];
	if (oldTrack) {
		stream.removeTrack(oldTrack);
	}
	stream.addTrack(newTrack);
}

/**
 * Stoppt alle Tracks in einem MediaStream
 * @param {MediaStream} stream
 */
export function stopMediaStream(stream) {
	if (stream) {
		stream.getTracks().forEach((track) => {
			track.stop();
		});
	}
}

/**
 * Wechselt zu einem anderen Gerät (Audio oder Video)
 * @param {MediaStream} stream - Der aktuelle Stream
 * @param {'audio'|'video'} kind - Track-Typ
 * @param {string} deviceId - Neue Geräte-ID
 * @returns {Promise<MediaStreamTrack>}
 */
export async function switchDevice(stream, kind, deviceId) {
	const constraints = kind === 'audio' ? { audio: { deviceId: { exact: deviceId } } } : { video: { deviceId: { exact: deviceId } } };

	try {
		const newStream = await navigator.mediaDevices.getUserMedia(constraints);
		const newTrack = kind === 'audio' ? newStream.getAudioTracks()[0] : newStream.getVideoTracks()[0];

		const sender = stream.getTracks()[0];
		if (sender) {
			const peerConnection = window.__peerConnection;
			if (peerConnection) {
				const rtcSender = peerConnection.getSenders().find((s) => s.track && s.track.kind === kind);
				if (rtcSender) {
					await rtcSender.replaceTrack(newTrack);
				}
			}
		}

		// Alte Tracks stoppen, aber nicht den neuen Track entfernen
		stream.getTracks().forEach((track) => {
			if (track.kind === kind && track !== newTrack) {
				track.stop();
			}
		});

		if (kind === 'video') {
			replaceVideoTrack(stream, newTrack);
		} else {
			const oldAudioTrack = stream.getAudioTracks()[0];
			if (oldAudioTrack) {
				stream.removeTrack(oldAudioTrack);
			}
			stream.addTrack(newTrack);
		}

		return newTrack;
	} catch (err) {
		throw new Error(`Gerätwechsel fehlgeschlagen: ${err.message}`);
	}
}
