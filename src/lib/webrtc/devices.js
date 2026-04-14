
export async function getAudioInputDevices() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices
			.filter((device) => device.kind === 'audioinput')
			.map((device) => ({
				deviceId: device.deviceId,
				label: device.label || `Mikrofon ${device.deviceId.substring(0, 5)}`
			}));
	} catch (err) {
		console.error('Fehler beim Abrufen von Audio-Geräten:', err);
		return [];
	}
}


export async function getVideoInputDevices() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices
			.filter((device) => device.kind === 'videoinput')
			.map((device) => ({
				deviceId: device.deviceId,
				label: device.label || `Kamera ${device.deviceId.substring(0, 5)}`
			}));
	} catch (err) {
		console.error('Fehler beim Abrufen von Video-Geräten:', err);
		return [];
	}
}

export async function getAudioOutputDevices() {
	try {
		
		const devices = await navigator.mediaDevices.enumerateDevices();
		return devices
			.filter((device) => device.kind === 'audiooutput')
			.map((device) => ({
				deviceId: device.deviceId,
				label: device.label || `Lautsprecher ${device.deviceId.substring(0, 5)}`
			}));
	} catch (err) {
		console.error('Fehler beim Abrufen von Audio-Output-Geräten:', err);
		return [];
	}
}

export async function getDefaultAudioInputDevice() {
	const devices = await getAudioInputDevices();
	return devices.length > 0 ? devices[0].deviceId : null;
}

export async function getDefaultVideoInputDevice() {
	const devices = await getVideoInputDevices();
	return devices.length > 0 ? devices[0].deviceId : null;
}

export function onDeviceChange(callback) {
	navigator.mediaDevices.addEventListener('devicechange', callback);
	return () => {
		navigator.mediaDevices.removeEventListener('devicechange', callback);
	};
}

export function isMediaSupported() {
	return !!(
		navigator.mediaDevices &&
		navigator.mediaDevices.getUserMedia &&
		navigator.mediaDevices.enumerateDevices
	);
}
