# 🚀 SCHNELLANLEITUNG - Von 0 zu Video-Call in 10 Minuten

## ⏱️ Schritt für Schritt (5 Terminals)

### Terminal 1️⃣: Installation & Vorbereitung

```bash
cd videocall
npm install

# Output sollte enthalten:
# added XXX packages in XXs
# npm notice 
```

✅ **Fertig!** Dependencies sind installiert.

---

### Terminal 2️⃣: Signaling-Server starten

```bash
# Zusätzliche Dependencies
npm install express socket.io cors

# Server starten
node signaling-server.example.js

# Output:
# 🎥 Signaling-Server läuft auf http://localhost:3000
# 📊 Stats verfügbar auf http://localhost:3000/stats
# ❤️ Health Check auf http://localhost:3000/health
```

✅ **Fertig!** Signaling-Server läuft auf Port 3000.

---

### Terminal 3️⃣: Development-Server starten

```bash
npm run dev

# Output:
# VITE v7.3.1  ready in 234 ms
# 
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

✅ **Fertig!** App läuft auf Port 5173.

---

### Browser 1️⃣ & 2️⃣: Testen

**Fenster / Tab 1:**
```
http://localhost:5173
```
1. Klicken Sie auf **"✨ Raum erstellen"**
2. Sie erhalten einen 6-stelligen Code (z.B. ABC123)

**Fenster / Tab 2:**
```
http://localhost:5173
```
1. Klicken Sie auf **"📞 Raum beitreten"**
2. Geben Sie den Code aus Fenster 1 ein
3. Klicken Sie **"📞 Raum beitreten"**

**Result:**
- Beide Seiten fordern Kamera/Mikrofon-Zugriff an
- Nach Bestätigung: **Video-Chat läuft!** 🎉

---

## 📋 Was Sie sehen sollten

### Fenster 1 (nach "Raum erstellen"):
```
📞 VideoCall - Raum ABC123

[VIDEO AREA - Remote Video (warte auf Tab 2)]

⚙️ Geräte
✨ Filter

🎤 Mikrofon        📹 Kamera        🖥️ Bildschirm        📞 Beenden
```

### Fenster 2 (nach "Raum beitreten"):
```
[SAME UI]

[VIDEO AREA - lokales Video + Remote Video von Fenster 1]

Status: ✅ Verbunden
```

---

## 🎮 Features testen

### 🎤 Mikrofon aus/an
- Button klicken → Status ändert sich zu rot
- Audio wird deaktiviert

### 📹 Kamera aus/an
- Button klicken → Lokales Video wird schwarz
- Video wird deaktiviert

### 🖥️ Bildschirmfreigabe
- Button klicken → Zeigt Ihren Bildschirm statt Kamera
- Andere Seite sieht Ihren Bildschirm
- Beim Beenden: automatisch zurück zu Kamera

### ✨ Video-Filter
- Klicken Sie **"✨ Filter"**
- Wählen Sie Filter aus: Graustufen, Sepia, Blur, etc.
- Filter werden lokale angewendet (andere Seite sieht normal)

### ⚙️ Geräte wechseln
- Klicken Sie **"⚙️ Geräte"**
- Wählen Sie andere Kamera/Mikrofon aus der Dropdown
- Should switch sofort!

### 📋 Code kopieren
- Button **"📋 ABC123"** oben rechts
- Code wird in Zwischenablage kopiert
- Status: "✅ Code kopiert!" bestätigt dies

---

## 🔧 Wenn etwas nicht funktioniert

| Problem | Lösung |
|---------|--------|
| "Verbindung zum Signaling-Server fehlgeschlagen" | Terminal 2 läuft? Port 3000 frei? |
| "Kamera/Mikrofon konnte nicht aufgerufen werden" | Browser-Berechtigung geben (Adressleiste) |
| "Raum ist voll" | Der Code gilt bereits für 2 Personen, neuen Raum erstellen |
| Kein Video sichtbar | Beide Seiten verbunden? Firewall blockiert? |
| Audio/Video funktioniert, aber keine Verbindung | TURN-Server fehlt (für NAT-Traversal) |

---

## 🌐 Im echten Netzwerk testen

### Beide auf gleicher Seite (gleicher Raum)

```bash
# Computer 1: Netzwerk-IP
192.168.1.100

# Computer 2: https://192.168.1.100:5173
# ⚠️ HTTPS nicht verfügbar im Dev-Mode!
# Nur für LAN-Tests funktioniert HTTP
```

**Problem:** Moderne Browser blockiert HTTP webcam-Zugriff!

**Lösung:** 
- Hosting auf HTTPS (z.B. Vercel)
- Oder localhost beide: `http://localhost:5173`

---

## 📦 Production vorbereiten

Wenn Sie alles testen konnten:

### 1. Build testen
```bash
npm run build
npm run preview

# Output: Local: http://localhost:4173
```

### 2. TURN-Server konfigurieren
- Siehe `CONFIGURATION.md` → Punkt 1️⃣

### 3. Deployen
- Siehe `DEPLOYMENT.md`

---

## 📚 Nächste wichtige Dokumentation

1. **`README.md`** - Vollständige Features & Troubleshooting
2. **`CONFIGURATION.md`** - Wo Sie extern Daten eintragen müssen (TURN, Icons, etc.)
3. **`ARCHITECTURE.md`** - Technische Details für Entwickler
4. **`DEPLOYMENT.md`** - Wie Sie es online deployen
5. **`PROJECT_SUMMARY.md`** - Projekt-Übersicht

---

## ✅ Checklist für erste Verwendung

- [ ] Terminal 1: `npm install` ✅
- [ ] Terminal 2: `node signaling-server.example.js` läuft ✅
- [ ] Terminal 3: `npm run dev` läuft ✅
- [ ] Browser 1 öffnet http://localhost:5173 ✅
- [ ] Browser 2 öffnet http://localhost:5173 ✅
- [ ] Video-Chat zwischen zwei Tabs funktioniert ✅
- [ ] Alle Buttons (Audio, Video, Screen, Filter) funktionieren ✅
- [ ] Raum-Code kopiert sich korrekt ✅

---

## 🎓 Nächster Lernschritt

Jetzt dass Sie sehen, dass es funktioniert:

1. **Kurz**: Lesen Sie `PROJECT_SUMMARY.md`
2. **Mittel**: Lesen Sie `CONFIGURATION.md` (was muss ich anpassen?)
3. **Viel**: Lesen Sie `ARCHITECTURE.md` (wie funktioniert der Code?)
4. **Deployment**: Lesen Sie `DEPLOYMENT.md`

---

## 💡 Tipps

- **Mehrere Browser**: Statt zwei Tabs können Sie auch Chrome + Firefox nutzen
- **Unterschiedliche Geräte**: Desktop + Laptop im gleichen Netzwerk
- **DevTools öffnen**: F12 → Network → WebSocket verbindung sehen

---

**Glückwunsch! Sie haben ein funktionierendes Video-Call-System! 🎉**

**Nächster Schritt:** Lesen Sie `CONFIGURATION.md` um einen echten TURN-Server zu konfigurieren.

---

*Fragen? Fehler? Siehe README.md → Troubleshooting*
