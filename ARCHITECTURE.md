# VideoCall - Architektur & Technische Details

## 🏗️ Gesamtarchitektur

Das Projekt besteht aus drei Hauptkomponenten:

```
┌──────────────┐
│   Frontend   │  (SvelteKit PWA)
│ - React zur  │
│   UI da, hat │
└──────────────┘
       │
       │ Socket.IO
       │
┌──────────────┐
│   Signaling  │  (Node.js / Express)
│   Server     │
└──────────────┘
       ▲
       │ Direct P2P
       │ (WebRTC)
       │
┌──────────────┐
│   Browser B  │  
│   (WebRTC)   │
└──────────────┘
```

## 📡 Frontend-Architektur

### Svelte-Komponenten-Hierarchie

```
App (Browser)
├── Landing Page (+page.svelte)
│   └── JoinRoom.svelte
│       ├─ UI für Raum erstellen
│       └─ UI für Raum beitreten
│
└── Room Page (room/[code]/+page.svelte)
    ├─ VideoPanel.svelte
    │  ├─ Remote Video (Main)
    │  └─ Local Video (PiP)
    ├─ CallControls.svelte
    │  ├─ Audio/Video Toggle
    │  ├─ Screen Share Toggle
    │  └─ End Call Button
    ├─ DeviceSelector.svelte
    │  ├─ Mikrofon Dropdown
    │  ├─ Kamera Dropdown
    │  └─ Lautsprecher Dropdown
    └─ FilterSelector.svelte
       ├─ Local Video Filter
       └─ Remote Video Filter
```

### State Management (Svelte Stores)

**callStore.js** - Zentraler Store für Call-Status:

```javascript
{
  roomCode: string,                    // 6-stelliger Raum-Code
  participantCount: number,            // 1 oder 2
  connectionState: string,             // idle, joining, connected, error, full
  localStream: MediaStream,            // Lokales Audio/Video
  remoteStream: MediaStream,           // Remote Audio/Video
  peerConnection: RTCPeerConnection,  // WebRTC-Verbindung
  signalingSocket: Socket,             // Socket.IO-Socket
  isAudioEnabled: boolean,             // Mikrofon-Status
  isVideoEnabled: boolean,             // Kamera-Status
  isScreenSharing: boolean,            // Screen Share-Status
  currentVideoFilter: string,          // Filter für lokales Video
  remoteVideoFilter: string,           // Filter für remote Video
  selectedMicrophone: string,          // Geräte-ID
  selectedCamera: string,              // Geräte-ID
  selectedAudioOutput: string,         // Geräte-ID (falls unterstützt)
  error: string                        // Error-Nachricht
}
```

## 🔌 WebRTC-Module

### peer.js - RTCPeerConnection Management

**Verantwortlichkeiten:**
- Erstelt RTCPeerConnection mit konfigurierten ICE-Servern
- Erstelt/bearbeitet SDP Offer/Answer
- Verwaltet ICE-Kandidaten
- Registriert Event-Handler

**Wichtige Funktionen:**
```javascript
createPeerConnection()        // Neue WebRTC-Verbindung
addStreamToPeer()            // MediaStream hinzufügen
createOffer()                // SDP-Offer erstellen
createAnswer()               // SDP-Answer erstellen
setRemoteDescription()       // Remote SDP setzen
addIceCandidate()           // ICE-Kandidaten hinzufügen
setupPeerEventHandlers()     // Event-Listener registrieren
closePeerConnection()        // Verbindung schließen
```

### media.js - MediaStream Verwaltung

**Verantwortlichkeiten:**
- Zugriff auf Kamera/Mikrofon (getUserMedia)
- Bildschirmfreigabe (getDisplayMedia)
- Track-Austausch bei Gerätewechsel

**Wichtige Funktionen:**
```javascript
getMediaStream()        // Kamera/Mikrofon anfordern
getScreenShare()        // Bildschirmfreigabe anfordern
replaceVideoTrack()     // Video-Track ersetzen
stopMediaStream()       // Stream stoppen
switchDevice()          // Zu anderem Gerät wechseln
```

### devices.js - Geräte-Enumeration

**Verantwortlichkeiten:**
- Aufzählen verfügbarer Audio-/Video-Geräte
- Device-Change-Events lauschen

**Wichtige Funktionen:**
```javascript
getAudioInputDevices()         // Mikrofone auflisten
getVideoInputDevices()         // Kameras auflisten
getAudioOutputDevices()        // Lautsprecher auflisten
getDefaultAudioInputDevice()   // Standard-Mikrofon
getDefaultVideoInputDevice()   // Standard-Kamera
onDeviceChange()               // Auf USB-Geräte lauschen
isMediaSupported()             // Browser-Support prüfen
```

### filters.js - CSS-Filter

**Verantwortlichkeiten:**
- Video-Filter für lokale/remote Videos
- CSS-Filter-Anwendung

**Verfügbare Filter:**
```javascript
none          // Normal
grayscale     // Graustufen
sepia         // Sepia
saturate      // Gesättigt
hueRotate     // Farbton
contrast      // Kontrast
brightness    // Helligkeit
blur          // Unschärfe
invert        // Invertiert
```

### signaling.js - Signaling mit Socket.IO

**Verantwortlichkeiten:**
- Verbindung zu Signaling-Server
- Weitergabe von SDP/ICE über Network
- Raum-Management auf Client-Seite

**Socket.IO Events:**
```javascript
// Client → Server
'join-room'         // Raum beitreten
'offer'             // SDP-Offer senden
'answer'            // SDP-Answer senden
'ice-candidate'     // ICE-Kandidat senden
'leave-room'        // Raum verlassen

// Server → Client
'connect'           // Mit Server verbunden
'user-joined'       // 2. Benutzer beigetreten
'room-full'         // Raum voll (3+ Personen)
'offer'             // Offer vom anderen Benutzer
'answer'            // Answer vom anderen Benutzer
'ice-candidate'     // ICE-Kandidat vom anderen
'user-left'         // Benutzer hat Raum verlassen
'error'             // Fehler
```

## 🔄 Signaling-Flow (detailliert)

### Initiator-Flow

```
┌────────────────────────────────┐
│ Benutzer A öffnet App           │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Klickt "Raum erstellen"         │
│ Code wird generiert (z.B. ABC123)
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Navigiert zu /room/ABC123       │
│ Fordert getUserMedia an         │
│ Verbindet zu Signaling-Server   │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Socket.emit('join-room',        │
│   { roomCode: 'ABC123',         │
│     isInitiator: true })        │
└────────────────────────────────┘
              ↓
       WARTET AUF USER B...
              ↓
┌────────────────────────────────┐
│ Erhält 'user-joined' Event      │
│ → Ein zweiter Benutzer ist da!  │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Erstellt RTCPeerConnection      │
│ Fügt eigenem Stream hinzu       │
│ Erstellt Offer mit createOffer()
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Socket.emit('offer', {...})     │
│ (SDP wird an User B gesendet)   │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Erhält 'answer' Event           │
│ setRemoteDescription(answer)    │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Sende/empfange ice-candidates   │
│ addIceCandidate() auf beiden    │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ WebRTC Connected!               │
│ ontrack Event → Remote Video    │
│ Audio/Video wird übertragen     │
└────────────────────────────────┘
```

### Responder-Flow

```
┌────────────────────────────────┐
│ Benutzer B öffnet App           │
│ Klickt "Raum beitreten"         │
│ Gibt Code ein: ABC123           │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Navigiert zu /room/ABC123       │
│ Fordert getUserMedia an         │
│ Verbindet zu Signaling-Server   │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Socket.emit('join-room',        │
│   { roomCode: 'ABC123',         │
│     isInitiator: false })       │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Server antwortet mit            │
│ 'user-joined' (an beide)        │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Erhält 'offer' Event von User A │
│ Erstellt RTCPeerConnection      │
│ Fügt eigenem Stream hinzu       │
│ setRemoteDescription(offer)     │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Erstellt Answer mit createAnswer()
│ setLocalDescription(answer)     │
│ Socket.emit('answer', {...})    │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ Sende/empfange ice-candidates   │
│ addIceCandidate() auf beiden    │
└────────────────────────────────┘
              ↓
┌────────────────────────────────┐
│ WebRTC Connected!               │
│ ontrack Event → Remote Video    │
│ Audio/Video wird übertragen     │
└────────────────────────────────┘
```

## 🖥️ Signaling-Server Details

Der Beispiel-Server (`signaling-server.example.js`) ist in Node.js/Express/Socket.IO geschrieben:

### Room Management

```javascript
rooms = Map<roomCode, {
  users: Array<socketId>,
  initiator: socketId
}>
```

**Regeln:**
- Max 2 User pro Room
- 3. User-Verbindung wird zurückgewiesen mit `'room-full'` Event
- Wenn User disconnect → aus Room entfernen
- Wenn Room leer → Room löschen

### Event Handling

```javascript
socket.on('join-room', (data) => {
  // Prüfe ob Raum voll
  // Füge User zu Raum hinzu
  // Benachrichtige andere User
})

socket.on('offer', (data) => {
  // Weiterleiten an andere User im Raum
  socket.to(roomCode).emit('offer', data)
})

socket.on('answer', (data) => {
  // Weiterleiten an andere User
  socket.to(roomCode).emit('answer', data)
})

socket.on('ice-candidate', (data) => {
  // Weiterleiten an andere User
  socket.to(roomCode).emit('ice-candidate', data)
})
```

## 🎨 UI-Komponenten

### VideoPanel.svelte

Zeigt lokal und remo Video an. Abonniert `callStore`:

```javascript
// Wenn localStream ändert → update video element
// Wenn remoteStream ändert → update video element
// Wendet Filter an beide Videos an (via CSS)
```

**HTML-Struktur:**
```
<video> Remote Video (main area)
<video> Local Video (PiP, bottom-right)
  ├─ Status-Indikatoren (Mute, Video aus, Screen Share)
  └─ Filter-Info
```

### CallControls.svelte

Buttons für Call-Kontrolle:

- **Audio Toggle**: `callStore.toggleAudio()` → toggled `isAudioEnabled`
- **Video Toggle**: `callStore.toggleVideo()` → toggled `isVideoEnabled`
- **Screen Share**: 
  - An: `getScreenShare()` → replaces video track
  - Aus: zurück zu Kamera
- **End Call**: `endCallHandler()` → cleanup & redirect to `/`

### DeviceSelector.svelte

Dropdown-Menu für:
- Mikrofon (Audio Input)
- Kamera (Video Input)
- Lautsprecher (Audio Output, fallunterstützt)

Bei Änderung: `switchDevice()` in media.js

### FilterSelector.svelte

Zwei Selects für Filter:
1. Local Video Filter
2. Remote Video Filter (wenn vorhanden)

Wendet CSS-Filter auf `<video>`-Elemente an.

## 📦 PWA Features

### manifest.json

```json
{
  "name": "VideoCall - Sichere ...",
  "start_url": "/",
  "display": "standalone",
  "icons": [...]
}
```

**Features:**
- Standalone-Modus (ohne Browser-UI)
- App-Shortcuts (neuen Raum, beitreten)
- Share-Target (teile Code via Share API)
- Protocol-Handler (web+videocall://)

### service-worker.js

Implementiert Cache-Strategien:

- **Cache-first** für statische Assets (JS, CSS, Fonts)
- **Network-first** für HTML (dynamischer Content)
- **Offline-Fallback** für fehlende Assets

Ermöglicht:
- Offline-Nutzung der Landing-Page
- Schnelleres Laden durch Caching

## 🔐 Sicherheitsaspekte

### WebRTC Encryption

- **SRTP** - Media-Streams sind verschlüsselt
- **DTLS** - Handshake ist verschlüsselt
- **SECURE-CONTEXT** - HTTPS in Production

### Datenschutz

- **Peer-to-Peer** - Keine Aufzeichnung (außer optional im Signaling-Server)
- **End-to-End** - Server sieht keine Media-Inhalte
- **Ephemere Räume** - Codes sind eindeutig und werden nicht realisiert

### TURN-Server Security

TURN-Server können optional konfiguriert werden:
- **Authentication** - Username/Password für TURN-Zugriff
- **CoA (Change of Address)** - Verhindert Zweckentfremdung
- **Rate Limiting** - Schutz vor Missbrauch

## 🚀 Performance-Optimierungen

### Media-Qualität

```javascript
// In media.js:
video: {
  width: { ideal: 1280 },
  height: { ideal: 720 }
}
// Bei schwacher Verbindung auf 640x480 reduzieren
```

### Network-Adaptivität

WebRTC hat eingebaute Qualitäts-Anpassung:
- Hardware unterstützte Codec-Auswahl
- Adaptive Bitrate Control
- Packet Loss Recovery

### CPU-Effizienz

- CSS-Filter statt Canvas-Filter (GPU)
- Hardware-Encoding für Video (falls unterstützt)
- Effiziente Svelte-Reaktivität

## 📊 Monitoring & Debugging

### Browser WebRTC Stats

Chrome/Edge: `chrome://webrtc-internals`

Firefox: `about:webrtc`

Zeigt:
- Connection State
- ICE Candidates
- Bandwidth
- Codec-Informationen

### Signaling-Server Stats

API: `GET /stats`

```json
{
  "activeConnections": 2,
  "activeRooms": 1,
  "rooms": [
    {
      "code": "ABC123",
      "participants": 2,
      "initiator": "socket-id"
    }
  ]
}
```

### Logging

- Client: Browser DevTools Console
- Server: ServerConsole-Output oder Winston/Bunyan Logger

---

**Weitere Details:** Siehe komponenten-spezifische Kommentare im Code
