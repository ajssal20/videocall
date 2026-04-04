/**
 * Devices Module
 * Verwaltet die Aufzählung von verfügbaren Audio- und Video-Geräten
 */

/**
 * Ruft alle verfügbaren Audio-Input-Geräte ab
 * @returns {Promise<Array>} Array von Geräten mit { deviceId, label }
 */
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

/**
 * Ruft alle verfügbaren Video-Input-Geräte ab
 * @returns {Promise<Array>} Array von Geräten mit { deviceId, label }
 */
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

/**
 * Ruft alle verfügbaren Audio-Output-Geräte ab (falls unterstützt)
 * @returns {Promise<Array>} Array von Geräten mit { deviceId, label }
 */
export async function getAudioOutputDevices() {
	try {
		// Funktioniert nur wenn enumerateDevices die audio output wird unterstützt
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

/**
 * Gibt das Standard-Audio-Input-Gerät zurück
 * @returns {Promise<string|null>} Die Device-ID oder null
 */
export async function getDefaultAudioInputDevice() {
	const devices = await getAudioInputDevices();
	return devices.length > 0 ? devices[0].deviceId : null;
}

/**
 * Gibt das Standard-Video-Input-Gerät zurück
 * @returns {Promise<string|null>} Die Device-ID oder null
 */
export async function getDefaultVideoInputDevice() {
	const devices = await getVideoInputDevices();
	return devices.length > 0 ? devices[0].deviceId : null;
}

/**
 * Lauscht auf Geräteänderungen (Verbindung/Trennung von USB-Geräten)
 * @param {Function} callback - Wird bei Geräteänderungen aufgerufen
 * @returns {Function} Funktion zum Entfernen des Listeners
 */
export function onDeviceChange(callback) {
	navigator.mediaDevices.addEventListener('devicechange', callback);
	return () => {
		navigator.mediaDevices.removeEventListener('devicechange', callback);
	};
}

/**
 * Prüft, ob die Browser-API Kamera/Mikrofon unterstützt
 * @returns {boolean}
 */
export function isMediaSupported() {
	return !!(
		navigator.mediaDevices &&
		navigator.mediaDevices.getUserMedia &&
		navigator.mediaDevices.enumerateDevices
	);
}
