# 🔧 Konfigurationsguide für VideoCall

## ⚙️ Übersicht der Konfigurationen

Hier sind alle Stellen dokumentiert, wo Sie externe Daten (TURN-Server, URLs, Keys) eintragen müssen.

## 1️⃣ TURN-Server Konfiguration (WICHTIG!)

### Wo: `src/lib/webrtc/peer.js`

```javascript
const ICE_SERVERS = {
	iceServers: [
		// Google STUN (kostenlos, öffentlich)
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{ urls: 'stun:stun2.l.google.com:19302' },
		
		// ⬇️ ERSETZEN SIE DIES MIT IHREM TURN-SERVER:
		{
			urls: 'turn:your-turn-server.com:3478',
			username: 'your-username',
			credential: 'your-password'
		}
		// Optional: mehrere TURN-Server hinzufügen
	]
};
```

### TURN-Server finden

**Kostenlose/kostengünstige Provider:**

1. **Twilio** (https://www.twilio.com/stun-turn)
   - $0.01-$0.02 pro GB
   - URL: `turn:xxx.twilio.com:3478?transport=udp`
   - Username/Credential im Twilio Dashboard

2. **XIRSYS** (https://xirsys.com/)
   - Kostenlos: 500GB/Monat
   - URL: `turn:sx.xirsys.com:3478`
   - Credentials: Email + API Key

3. **Metered.ca** (https://www.metered.ca/)
   - Kostenlos mit limits
   - Sehr benutzerfreundlich

4. **Selbst gehostet**
   - coturn: Open-Source TURN-Server
   ```bash
   sudo apt-get install coturn
   sudo systemctl start coturn
   ```

## 2️⃣ Signaling-Server URL

### Entwicklung: `src/app.html` oder `.env`

```bash
# .env.local (nicht committen!)
VITE_SIGNALING_URL=http://localhost:3000
```

Die App nutzt diese URL automatisch in `src/lib/webrtc/signaling.js`:

```javascript
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';
```

### Production: Environment im Deployment

**Vercel:**
- Settings → Environment Variables
- Name: `VITE_SIGNALING_URL`
- Value: `https://your-signaling-server.com`

**Railway:**
- Variables → Neue Variable
- Name: `VITE_SIGNALING_URL`
- Value: `https://your-signaling-server.on.railway.app`

**Docker:**
- `docker-compose.yml` oder `.env`-File

## 3️⃣ PWA Icons und App-Branding

### Wo: `static/`

**Erforderliche Dateien (ersetzen Sie die Platzhalter):**

```
static/
├── favicon-16x16.png          (16×16 px)
├── favicon-32x32.png          (32×32 px)
├── apple-touch-icon.png       (180×180 px)
├── android-chrome-192x192.png (192×192 px)
├── android-chrome-512x512.png (512×512 px)
├── maskable-icon-192x192.png  (192×192 px, für Android)
├── maskable-icon-512x512.png  (512×512 px, für Android)
└── manifest.json              (bereits konfiguriert)
```

**So erstellen Sie Icons:**
1. Design ein 512×512px Icon
2. Nutzen Sie einen Online-Tool wie https://www.favicon-generator.org/
3. Icons in `static/` kopieren
4. `manifest.json` überprüfen (Pfade passen sich an)

### App-Namen in `static/manifest.json` anpassen:

```json
{
	"name": "Ihr App-Name hier",
	"short_name": "App-Kurz",
	"description": "Ihre Beschreibung",
	"theme_color": "#1f2937",
	"background_color": "#111827"
}
```

## 4️⃣ Sprache anpassen (UI-Strings)

### Deutsche Texte ersetzen

Die gesamte UI ist auf **Deutsch** geschrieben. Zum Ändern:

**Komponenten-Dateien** (z.B. `src/lib/components/*.svelte`):

```svelte
<!-- Suchen Sie nach Texten wie: -->
📞 Raum erstellen
🎤 Mikrofon
🔇 Mikrofon aus

<!-- Und ersetzen Sie diese -->
```

**Landing Page** (`src/routes/+page.svelte`):

```svelte
<h2 class="mb-4 text-4xl font-bold text-white">Verbinden Sie sich jetzt</h2>
<!-- Ersetzen Sie diese Texte nach Bedarf -->
```

**Room Page** (`src/routes/room/[code]/+page.svelte`):

```svelte
<h1>VideoCall - Raum {roomCode}</h1>
<!-- Und weitere Texte in der Datei -->
```

## 5️⃣ Farben und Design

### Tailwind CSS Konfiguration

Die App nutzt Tailwind CSS Standard-Farben. Zum Anpassen:

**Bearbeiten Sie die Klassen in den Komponenten:**

```svelte
<!-- Beispiel VideoPanel.svelte -->
<div class="absolute inset-0 flex items-center justify-center bg-gray-900">
  <!-- bg-gray-900 = Hintergrundfarbe -->
  <!-- Zu anderen Tailwind-Farben ändern: bg-gray-800, bg-blue-900, etc. -->
</div>
```

**Wichtige Farben in der App:**

| Element | Farbe | Klasse |
|---------|-------|--------|
| Hintergrund | Dunkelgrau | `bg-gray-900` |
| Cards | Grau-800 | `bg-gray-800` |
| Buttons (Primary) | Blau-600 | `bg-blue-600` |
| Buttons (Danger) | Rot-600 | `bg-red-600` |
| Text | Weiß/Grau | `text-white`, `text-gray-100` |

## 6️⃣ Video-Qualität anpassen

### Wo: `src/lib/webrtc/media.js`

```javascript
export async function getMediaStream(audioDeviceId = null, videoDeviceId = null) {
	const constraints = {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			autoGainControl: true
		},
		video: {
			width: { ideal: 1280 },  // ← Hier ändern
			height: { ideal: 720 }   // ← Hier ändern
		}
	};
	// ...
}
```

**Empfohlene Werte:**

- **HD (1280×720)**: Normal, gute Balance
- **Full HD (1920×1080)**: Bessere Qualität, höhere Bandbreite
- **SD (640×480)**: Niedriger Bandbreitenbedarf, schlechtere Qualität

```javascript
// Beispiel: Full HD
video: {
	width: { ideal: 1920 },
	height: { ideal: 1080 }
}

// Beispiel: SD für langsame Verbindungen
video: {
	width: { ideal: 640 },
	height: { ideal: 480 }
}
```

## 7️⃣ Audio-Qualität und Echo-Cancellation

### Wo: `src/lib/webrtc/media.js`

```javascript
audio: {
	echoCancellation: true,      // Echo-Unterdrückung
	noiseSuppression: true,      // Hintergrund-Noise
	autoGainControl: true        // Automatische Lautstärke
}
```

Diese können bei Bedarf deaktiviert werden (z.B. für Musik-Streaming):

```javascript
audio: {
	echoCancellation: false,
	noiseSuppression: false,
	autoGainControl: false
}
```

## 8️⃣ Raum-Code-Format anpassen

### Wo: `src/lib/components/JoinRoom.svelte`

```javascript
function generateRoomCode() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < 6; i++) {  // ← Länge ändern (z.B. 8, 10, etc.)
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}
```

Und in der Route-Validierung (`src/routes/room/[code]/+page.js`):

```javascript
if (!code || code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
	throw redirect(302, '/');
}
// Ändern Sie 6 auf Ihre neue Länge
```

## 9️⃣ Service Worker anpassen

### Wo: `static/service-worker.js`

```javascript
const CACHE_NAME = 'videocall-v1'; // Version bei Updates ändern

// Später bei neuem Build:
const CACHE_NAME = 'videocall-v2';
```

Das zwingt Clients, den Cache zu invalidieren und neue Assets zu laden.

## 🔟 Signaling-Server Protokoll anpassen

### Wo: `signaling-server.example.js`

**Port ändern:**

```javascript
const PORT = process.env.PORT || 3000;  // ← Hier
```

**Max. Teilnehmer pro Raum:**

```javascript
// Aktuell:
if (room.users.length >= 2) {
	socket.emit('room-full');
	return;
}

// Ändern zu z.B. 5 Personen:
if (room.users.length >= 5) {
	socket.emit('room-full');
	return;
}
```

**Raum-Cleanup-Timeout hinzufügen (optional):**

```javascript
// Nach Room erstellen:
setInterval(() => {
	for (const [code, room] of rooms.entries()) {
		if (room.users.length === 1) {
			const age = Date.now() - room.createdAt;
			if (age > 30 * 60 * 1000) { // 30 Minuten
				rooms.delete(code);
				console.log(`Raum ${code} gelöscht (Timeout)`);
			}
		}
	}
}, 5 * 60 * 1000); // Alle 5 Minuten prüfen
```

## 1️⃣1️⃣ Logging und Debug

### Development Logging aktivieren

In `src/lib/webrtc/signaling.js`:

```javascript
socket.on('connect', () => {
	console.log('[Signaling] Mit Server verbunden');  // Bereits vorhanden
});
```

###  Production Logging minimieren

In `src/lib/webrtc/peer.js`:

```javascript
if (process.env.NODE_ENV === 'development') {
	console.log('Debug-Nachricht');
}
```

## 1️⃣2️⃣ Performance-Monitoring

### Browser-Monitoring hinzufügen

```javascript
// In +page.svelte
performance.mark('call-connected');
performance.measure('call-setup', 'navigationStart', 'call-connected');
console.log(performance.getEntriesByName('call-setup')[0].duration);
```

### Sentry Integration (Optional)

```bash
npm install @sentry/svelte
```

```javascript
import * as Sentry from "@sentry/svelte";

Sentry.init({
  dsn: "YOUR_DSN_HERE",
  environment: process.env.NODE_ENV,
});
```

---

## ✅ Konfiguration Checklist

- [ ] TURN-Server in `peer.js` konfiguriert
- [ ] Signaling-URL in `.env.local` oder Deployment gesetzt
- [ ] PWA Icons in `static/` ersetzt (optional aber empfohlen)
- [ ] `manifest.json` App-Namen angepasst
- [ ] Deutsche Texte ggf. geändert
- [ ] Video-Qualität für Zielgruppe angepasst
- [ ] Service-Worker Cache-Version aktualisiert (bei Updates)
- [ ] SSL/HTTPS in Production aktiviert (erforderlich!)
- [ ] CORS auf Signaling-Server konfiguriert
- [ ] Firewall-Ports für WebSocket/WebRTC geöffnet

---

**Nächste Schritte:** Siehe README.md für Quick Start oder DEPLOYMENT.md für Production
