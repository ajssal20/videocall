# 📞 VideoCall - Projekt-Übersicht

## ✨ Was Sie bekommen

Ein **vollständiges, professionelles SvelteKit-Projekt** für sichere 1-zu-1 Videotelefonie mit WebRTC:

### ✅ Feature-Umfang

- **Videotelefonie**: WebRTC-basiert, P2P-Verbindung zwischen genau 2 Personen
- **Bildschirmfreigabe**: Einfaches Umschalten zwischen Kamera und Bildschirm
- **Video-Filter**: 9 CSS-basierte Filter (Graustufen, Sepia, Blur, etc.)
- **Geräteauswahl**: Dynamische Auswahl von Mikrofon, Kamera, Lautsprecher
- **Raum-System**: 6-stellige Code-basierte Raum-Verwaltung (max. 2 Personen)
- **PWA-Ready**: Installierbar, offline-fähig, Service Worker
- **Responsive Design**: Desktop & Mobile optimiert
- **Deutsche UI**: Vollständig auf Deutsch

### 📁 Projektstruktur

```
videocall/
├── 📄 README.md                           ← Anfänger: Hier starten!
├── 📄 ARCHITECTURE.md                     ← Technische Details
├── 📄 DEPLOYMENT.md                       ← Deployment-Guides
├── 📄 CONFIGURATION.md                    ← Konfigurationen eintragen
├── 📄 .env.example                        ← Template für .env.local
├── 📄 signaling-server.example.js         ← Beispiel-Server (Node.js)
├── package.json                           ← Dependencies
├── vite.config.js                         ← Vite Konfiguration
├── svelte.config.js                       ← SvelteKit Konfiguration
│
├── src/
│   ├── app.html                           ← Root HTML
│   ├── lib/
│   │   ├── components/                    ← Svelte UI-Komponenten
│   │   │   ├── VideoPanel.svelte          ✨ Zeigt lokales+Remote Video
│   │   │   ├── CallControls.svelte        ✨ Audio/Video/Screen/Hang-up
│   │   │   ├── DeviceSelector.svelte      ✨ Geräte-Dropdown-Menü
│   │   │   ├── FilterSelector.svelte      ✨ Video-Filter
│   │   │   └── JoinRoom.svelte            ✨ Raum erstellen/beitreten
│   │   │
│   │   ├── webrtc/                        ← WebRTC & Media Logic
│   │   │   ├── peer.js                    💎 RTCPeerConnection Manager
│   │   │   ├── media.js                   💎 getUserMedia, Screen Share
│   │   │   ├── devices.js                 💎 Geräte-Enumeration
│   │   │   ├── filters.js                 💎 CSS-Filter-Management
│   │   │   └── signaling.js               💎 Socket.IO Signaling
│   │   │
│   │   ├── stores/
│   │   │   └── callStore.js               🎯 Globale Call-State
│   │   │
│   │   └── assets/
│   │
│   └── routes/
│       ├── +page.svelte                   🏠 Landing Page
│       └── room/
│           └── [code]/
│               ├── +page.svelte           📞 Room/Call Page
│               └── +page.js               🔐 Route-Validierung
│
├── static/
│   ├── manifest.json                      📱 PWA Manifest
│   ├── service-worker.js                  🔄 Service Worker (Caching)
│   ├── icon.svg                           🎨 App-Icon (Platzhalter)
│   ├── favicon-16x16.png                  🔗 Favicon (Platzhalter)
│   ├── favicon-32x32.png                  🔗 Favicon (Platzhalter)
│   └── robots.txt                         🤖 SEO
```

## 🚀 Quick-Start (3 Schritte)

### 1️⃣ Installation & Dependencies

```bash
cd videocall
npm install
```

### 2️⃣ Signaling-Server starten

```bash
# Neues Terminal
npm install express socket.io cors
node signaling-server.example.js

# Output: 🎥 Signaling-Server läuft auf http://localhost:3000
```

### 3️⃣ Entwicklungsserver starten

```bash
# Drittes Terminal
npm run dev

# Output: VITE v7.3.1  ready in XXX ms
#         ➜  Local:   http://localhost:5173/
```

**Fertig!** Öffnen Sie zwei Browser-Fenster und testen Sie:
- Fenster 1: "Raum erstellen"
- Fenster 2: Code eingeben und "Raum beitreten"
- Video-Chat läuft! 📞

## 📝 Wichtige Stellen für Konfiguration

### 🔴 MUSS konfiguriert werden:

1. **TURN-Server** (`src/lib/webrtc/peer.js`)
   - Ohne TURN: funktioniert nur im gleichen Netzwerk
   - Mit TURN: funktioniert überall (NAT-Traversal)
   - Siehe `CONFIGURATION.md` → Punkt 1️⃣

2. **Signaling-Server URL** (`.env.local` oder Deployment)
   - Development: `http://localhost:3000` (Standard)
   - Production: Ihre Server-URL
   - Siehe `CONFIGURATION.md` → Punkt 2️⃣

### 🟡 SOLLTE angepasst werden (optional):

3. **PWA Icons** (`static/*.png`)
   - Platzhalter-Icons ersetzen mit echten Icons
   - Siehe `CONFIGURATION.md` → Punkt 3️⃣

4. **App-Namen & Sprache** (diverse `.svelte`-Dateien)
   - UI-Texte auf Ihre Sprache ändern
   - Siehe `CONFIGURATION.md` → Punkt 4️⃣

5. **Farben & Design** (Tailwind CSS Klassen)
   - Branding anpassen
   - Siehe `CONFIGURATION.md` → Punkt 5️⃣

## 🏗️ Code-Architektur

### Frontend (SvelteKit)

```
Landing (/page.svelte)
  └─ join-room
      ├─ create
      └─ join
        ↓
      Room (/room/[code]/+page.svelte)
        ├─ VideoPanel (Display)
        ├─ CallControls (Buttons)
        ├─ DeviceSelector (Dropdowns)
        ├─ FilterSelector (Filter)
        └─ [Store: callStore]
```

### WebRTC-Flow

```
User A                          User B
  │                               │
  ├─ Signaling-Server ──────────┤
  │  (Socket.IO)                 │
  │                               │
  ├──────── WebRTC P2P ──────────┤
  │  (Media-Streams)              │
  │  Audio + Video                │
  │  ◄──────────────────────────┤
```

### Komponenten & Module

| Datei | Verantwortung | Größe |
|-------|-----------|-------|
| **peer.js** | WebRTC P2P | ~150 Lines |
| **media.js** | Kamera/Mikrofon | ~100 Lines |
| **signaling.js** | Socket.IO | ~120 Lines |
| **devices.js** | Geräte-Liste | ~80 Lines |
| **filters.js** | CSS-Filter | ~50 Lines |
| **callStore.js** | State Management | ~50 Lines |
| **VideoPanel.svelte** | Video-Display | ~60 Lines |
| **CallControls.svelte** | Buttons | ~100 Lines |
| **DeviceSelector.svelte** | Dropdowns | ~80 Lines |
| **FilterSelector.svelte** | Filter-UI | ~40 Lines |
| **+page.svelte (room)** | Main Room Logic | ~250 Lines |
| **Total** | | ~1000+ Lines |

## 🔒 Sicherheit

✅ **Was ist sicher:**
- Media-Streams: SRTP-verschlüsselt (WebRTC automatic)
- Signaling: kann über HTTPS/WSS gesichert werden
- P2P: nur zwei Personen, direkt, kein Server

⚠️ **Was Sie tun müssen:**
- HTTPS/SSL in Production aktivieren (erforderlich!)
- TURN-Server mit Credentials verwenden
- Raum-Codes als "Authentifizierung" (nicht hochsicher)

## 🚀 Deployment-Optionen

### 🥇 Empfohlen: Vercel + Railway

```bash
# Frontend: Vercel (kostenlos)
npm install -g vercel
vercel

# Signaling: Railway.app (kostenlos mit limits)
# railway login
# railway up
```

### 🥈 Alternative: Docker Self-Hosted

```bash
docker-compose up -d
# Alles läuft lokal
```

### 🥉 Kostenlos: GitHub Pages + Server

```bash
# Frontend: GitHub Pages (kostenlos)
git push origin main

# Signaling: Railway/Heroku (kostenlos mit limits)
```

Siehe `DEPLOYMENT.md` für Details.

## 📚 Dokumentation

| Datei | Inhalt |
|-------|--------|
| **README.md** | Quick Start, Features, Troubleshooting |
| **ARCHITECTURE.md** | Technische Details, Flow-Diagramme |
| **DEPLOYMENT.md** | Production-Setup (Vercel, Docker, etc.) |
| **CONFIGURATION.md** | Wo Sie Daten eintragen müssen |
| **PROJECT_SUMMARY.md** | Diese Datei |

## 🎓 Lernpfad

### Anfänger: "Ich will nur testen"

1. Lesen: `README.md` → Quick Start
2. Installieren: `npm install` + `node signaling-server.example.js`
3. Starten: `npm run dev`
4. Testen: Zwei Browser-Fenster öffnen

### Fortgeschrittene: "Ich will konfigurieren"

1. Lesen: `CONFIGURATION.md`
2. TURN-Server einrichten (Punkt 1️⃣)
3. Icons anpassen (Punkt 3️⃣)
4. UI-Texte ändern (Punkt 4️⃣)
5. Testen in Production

### Entwickler: "Ich will verstehen & erweitern"

1. Lesen: `ARCHITECTURE.md`
2. Studieren Sie die WebRTC-Module (`src/lib/webrtc/*.js`)
3. Verstehen Sie die Svelte-Komponenten
4. Modifizieren Sie Code nach Bedarf
5. Siehe `DEPLOYMENT.md` für Production

## 🔄 Workflow für Änderungen

### Feature hinzufügen

1. Bearbeiten Sie die relevante Datei
2. `npm run dev` neu starten (hot reload)
3. Testen im Browser
4. Committen & deployen

### Bug fixen

1. Öffnen Sie Chrome DevTools (F12)
2. Überprüfen Sie Network-Tab (Socket.IO)
3. Überprüfen Sie WebRTC-Stats (`chrome://webrtc-internals`)
4. Debuggen in der relevanten `.js`-Datei
5. Testen & committen

## ❓ Häufig gestellte Fragen

### "Kann ich das in TypeScript verwenden?"

Ja, aber das war nicht in den Anforderungen, daher ist es in JavaScript. Die Migrationen wäre einfach (SvelteKit unterstützt TS).

### "Kann mehr als 2 Personen in einem Raum sein?"

Nein (ist beabsichtigt). Zum Ändern: `signaling-server.example.js` Zeile ~40 editieren.

### "Funktioniert es ohne Internet?"

Teilweise:
- Landing-Page: Ja (Service Worker cacht diese)
- Video-Call: Nein (benötigt Signaling-Server)

### "Kann ich private Servers verwenden?"

Ja, ändern Sie `VITE_SIGNALING_URL` in `.env.local`.

### "Ist der Code Production-ready?"

Ja! Es ist professionell strukturiert und dokumentiert. Jedoch benötigt es:
- Konfigurierte TURN-Server
- Production-Deployment
- HTTPS/SSL
- Monitoring & Logging (optional)

## 🎯 Nächste Schritte

1. **Quick Start**: `npm install && node signaling-server.example.js && npm run dev`
2. **Konfigurieren**: Lesen Sie `CONFIGURATION.md`
3. **Deployen**: Folgen Sie `DEPLOYMENT.md`
4. **Erweitern**: Modifizieren Sie Code nach Bedarf

## 💬 Support

- **Fehler?** → Siehe `README.md` → Troubleshooting
- **Konfiguration?** → Siehe `CONFIGURATION.md`
- **Deployment?** → Siehe `DEPLOYMENT.md`
- **Code verstehen?** → Siehe `ARCHITECTURE.md`

---

**Status:** ✅ Vollständig, professionell, ready to use!

**Viel Spaß mit VideoCall! 📞**
