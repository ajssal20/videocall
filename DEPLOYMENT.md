# VideoCall - Deployment Guide

## 📦 Deployment Szenarien

### 1. Vercel + Railway (Empfohlen)

Schnellstes Setup für Production.

#### Frontend auf Vercel

```bash
# Installieren
npm i -g vercel

# In videocall/-Folder
vercel login
vercel

# .env.production während Deployment setzen:
VITE_SIGNALING_URL=https://your-signaling-server.com
```

Vercel wird automatisch:
- SvelteKit bauen
- Statische Assets deployen
- Service Worker registrieren

#### Signaling-Server auf Railway

```bash
# Railway Account erstellen: https://railway.app/

# Railway CLI
npm install -g @railway/cli
railway login

# Signaling-Server vorbereiten
# server/package.json:
{
  "name": "videocall-signaling",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "cors": "^2.8.5"
  }
}

# server/index.js (Basis-Version)
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// [Erweitern Sie mit dem Code aus signaling-server.example.js]

httpServer.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

# Railway deployen
railway init
railway up
```

Nach Deployment:
- Railway zeigt Domain an (z.B. videocall-signaling-prod.up.railway.app)
- Diese Domain in Vercel-Environment-Variablen setzen

```bash
# In Vercel Dashboard:
VITE_SIGNALING_URL=https://videocall-signaling-prod.up.railway.app
```

### 2. Docker + Self-Hosted

Für maximale Kontrolle.

#### Docker Setup

**Dockerfile (Frontend)**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

**Dockerfile (Signaling-Server)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./videocall
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_SIGNALING_URL=http://signaling:3001
    depends_on:
      - signaling

  signaling:
    build:
      context: ./signaling-server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - frontend
      - signaling
```

**nginx.conf (Beispiel)**
```nginx
upstream frontend {
    server frontend:3000;
}

upstream signaling {
    server signaling:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://signaling;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

#### Deploy

```bash
# Bauen und starten
docker-compose up -d

# Logs
docker-compose logs -f

# Stoppen
docker-compose down
```

### 3. GitHub Pages + Server

Für kostenloses Hosten des Frontends.

#### GitHub Pages Setup

```bash
# Repository-Einstellungen:
# Pages → Source: Deploy from a branch → gh-pages

# vite.config.js:
export default defineConfig({
  base: '/<repo-name>/',
  plugins: [tailwindcss(), sveltekit()]
})

# package.json:
{
  "scripts": {
    "build": "vite build && echo '<path> <file>' > build/404.html"
  }
}

# GitHub Actions Workflow
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

Signaling-Server separiert hosten (Railway, Heroku, Render, etc.)

### 4. Netlify

Alternative zu Vercel.

```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🔒 SSL/TLS Certificates

WebRTC benötigt HTTPS in Production!

### Letsencrypt (kostenlos)

```bash
# Certbot installieren
sudo apt-get install certbot python3-certbot-nginx

# Certificate anfordern
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

### Nginx SSL-Config

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend:3000;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🎯 Pre-Deployment Checklist

- [ ] Frontend: `npm run build` erfolgreich
- [ ] Signaling-Server: lokal getestet
- [ ] TURN-Server konfiguriert (wenn nötig)
- [ ] Environment-Variablen gesetzt
- [ ] Service-Worker registriert
- [ ] HTTPS/SSL aktiviert
- [ ] CORS korrekt konfiguriert
- [ ] WebRTC-Firewall-Ports offen (UDP 50000-60000+)

## 📊 Performance-Tuning

### Nginx

```nginx
# Gzip-Kompression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Caching
location ~* \.js$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.css$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# WebSocket Timeout
proxy_read_timeout 86400;
proxy_send_timeout 86400;
```

### Node.js

```javascript
// server/index.js
const io = new SocketIOServer(httpServer, {
  serveClient: false,
  maxHttpBufferSize: 10e6,
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket']
});
```

### SvelteKit

```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['socket.io-client']
        }
      }
    }
  }
})
```

## 🐛 Monitoring & Logs

### Auf Vercel

- Dashboard → Logs
- Deployments → Logs anschauen

### Auf Railway

```bash
railway logs
railway logs --follow
```

### Auf selbst-gehosteten Servern

```bash
# Systemd-Service
sudo journalctl -u videocall-frontend -f
sudo journalctl -u videocall-signaling -f

# Docker
docker-compose logs -f frontend
docker-compose logs -f signaling
```

## 🔄 Updates & Rollback

### Frontend Update (Vercel)

```bash
git push origin main
# Vercel deployed automatisch
```

### Signaling-Server Update

```bash
git push origin main
# Railway deployed automatisch (falls auto-deploy aktiv)

# Oder manuell:
vercel deploy --prod  # Wenn auf Vercel
railway up           # Wenn auf Railway
```

### Fallback/Rollback

**Vercel**
- Dashboard → Deployments → alten Deployment wählen → Promote to Production

**Railway**
- Dashboard → Deployments → älteres Deployment wählen → Redeploy

## 💡 Wichtige URLs nach Deployment

- **Frontend**: https://yourdomain.com
- **Signaling-Server**: https://signaling-yourdomain.com (oder internal)
- **WebRTC Stats**: https://yourdomain.com/room/ABC123 → Chrome DevTools
- **Health Check**: https://signaling-yourdomain.com/health

## 🚨 Häufige Fehler

### "CORS Error"
- Signaling-Server CORS aktiviert?
- Browser-Origin in CORS-Config?

### "Kein WebSocket"
-HTP→ HTTPS upgraden?
- Firewall blockiert WebSocket?
- Proxy nicht WebSocket-aware?

### "WebRTC Verbindung fehlgeschlagen"
- STUN/TURN Server erreichbar?
- Firewall UDP blockiert?
- Browser Privacy-Mode?

### "Service Worker registriert nicht"
- HTTPS aktiviert?
- Manifest.json vorhanden?
- Service Worker in /static/?

---

**Support:** Siehe README.md für Troubleshooting
