# VideoCall Signaling Server

Ein einfacher Socket.IO-Signaling-Server für WebRTC-Videotelefonie.

## 🚀 Deployment

Deploy this folder as a separate Node service.

### Empfohlene Hosting-Services:

#### Railway (Einfachste Option)
1. Gehe zu [railway.app](https://railway.app)
2. Erstelle ein neues Projekt
3. Verbinde dein GitHub-Repository (dieser `signaling-server` Ordner)
4. Railway erkennt automatisch die Node.js-App
5. Die App läuft auf `https://your-app-name.up.railway.app`

#### Render (Kostenloser Plan verfügbar)
1. Gehe zu [render.com](https://render.com)
2. Erstelle eine neue "Web Service"
3. Verbinde dein GitHub-Repository
4. Setze Build Command: `npm install`
5. Setze Start Command: `npm start`
6. Die App läuft auf `https://your-app-name.onrender.com`

#### Heroku
1. Installiere Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. Die App läuft auf `https://your-app-name.herokuapp.com`

## 🔧 Environment Variables

Required environment variables:

- `PORT` is provided automatically by Render/Railway
- `ALLOWED_ORIGINS` optional comma-separated frontend origins

Example:

`ALLOWED_ORIGINS=https://videocall-two-pi.vercel.app`
