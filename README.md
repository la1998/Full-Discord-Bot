# Arty Dashboard

Ein webbasiertes Dashboard mit **Discord OAuth Login**, Backend
(Node.js), Frontend (Vite/Build), **Caddy Reverse Proxy** und
**Cloudflare Tunnel** für sicheren öffentlichen Zugriff -- optimiert für
Windows (VM / Homelab).

------------------------------------------------------------------------

## ✨ Features

-   🔐 Discord OAuth2 Login
-   👥 Zugriffsbeschränkung (nur erlaubte Nutzer / Server)
-   🌍 Öffentlich erreichbar über HTTPS (Cloudflare Tunnel)
-   🧠 Session-Handling (Cookie-basiert)
-   🧩 Trennung von Frontend & Backend
-   ⚙️ Ein-Klick-Start über `start-all.bat`
-   🪟 Windows-VM-kompatibel (Proxmox / Homelab)

------------------------------------------------------------------------

## 🏗️ Projektstruktur

    bot-dashboard-full-V2/
    ├─ backend/
    │  ├─ index.js
    │  ├─ auth.js
    │  ├─ discord/
    │  │  └─ bot.js
    │  └─ prisma/
    ├─ frontend/
    │  ├─ src/
    │  └─ dist/
    ├─ Caddyfile
    ├─ start-all.bat
    ├─ start-all.ps1
    ├─ .gitignore
    └─ README.md

------------------------------------------------------------------------

## 🚀 Voraussetzungen

-   Node.js (LTS)
-   npm
-   Caddy
-   cloudflared
-   Windows 10/11 oder Windows Server

------------------------------------------------------------------------

## 🔑 Umgebungsvariablen

Datei: `backend/.env` (nicht committen)

    PORT=4000
    FRONTEND_URL=https://arty-dashbord.com

    DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
    DISCORD_CLIENT_SECRET=YOUR_DISCORD_CLIENT_SECRET
    DISCORD_REDIRECT_URI=https://arty-dashbord.com/api/auth/callback

    SESSION_SECRET=CHANGE_ME
    COOKIE_SECURE=true

------------------------------------------------------------------------

## 🛠️ Installation

Frontend:

    cd frontend
    npm install
    npm run build

Backend:

    cd backend
    npm install
    npx prisma generate

------------------------------------------------------------------------

## ▶️ Starten

    start.bat

Startet: - Backend - Caddy - Cloudflare Tunnel - Discord Bot

------------------------------------------------------------------------

## 🌍 Zugriff

-   Lokal: http://127.0.0.1:8080
-   Öffentlich: https://arty-dashbord.com
-   Login: https://arty-dashbord.com/api/auth/login

------------------------------------------------------------------------

## 🔐 Sicherheit

-   `.env` niemals committen
-   `.cloudflared` niemals committen
-   Tokens regelmäßig rotieren

------------------------------------------------------------------------

## 📦 Deployment

-   Für kleine private Gruppen (ca. 2--5 Nutzer)
-   Redis optional für persistente Sessions

------------------------------------------------------------------------

## 📄 Lizenz

Private Nutzung / internes Tool.
