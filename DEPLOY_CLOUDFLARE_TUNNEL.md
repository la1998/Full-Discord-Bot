# Public access via Cloudflare Tunnel (Windows VM)

## 1) Buy a domain
Buy your domain at any registrar (Namecheap, Infomaniak, etc.).

## 2) Move DNS to Cloudflare (free)
- Create a Cloudflare account
- Add your domain
- Cloudflare will show you 2 nameservers
- Set those nameservers at your registrar

## 3) Configure Discord OAuth Redirect
In the Discord Developer Portal -> OAuth2:
Add this redirect URL:
`https://YOUR_DOMAIN/api/auth/callback`

## 4) Backend .env
Copy `backend/.env.example` to `backend/.env` and fill in:
- CLIENT_ID / CLIENT_SECRET
- DISCORD_TOKEN
- GUILD_ID / BOTMASTER_ID
- FRONTEND_URL=https://YOUR_DOMAIN
- DISCORD_REDIRECT_URI=https://YOUR_DOMAIN/api/auth/callback
- SESSION_SECRET (random)
- COOKIE_SECURE=true

## 5) Build frontend
From `frontend/`:
- `npm install`
- `npm run build`

## 6) Run backend
From `backend/`:
- `npm install`
- `npx prisma generate`
- `npx prisma migrate deploy` (or `npx prisma db push` for sqlite)
- `node index.js`

## 7) Cloudflare Tunnel (cloudflared)
Install `cloudflared` on the Windows VM.

Create a tunnel and route your domain to it.
Then configure the tunnel to point to your backend:
- Public hostname: `YOUR_DOMAIN`
- Service: `http://localhost:4000`

Because the frontend is built files, you can:
A) Serve frontend from a small static server and proxy via the tunnel, or
B) (Recommended) Serve frontend via Nginx/Caddy on Windows and proxy /api to backend.

### Simple option (one origin): serve frontend + proxy /api
Use a reverse proxy on the VM (Caddy is easiest on Windows):
- Serve `frontend/dist`
- Reverse proxy `/api/*` -> `localhost:4000`

(If you want, I can generate the exact Caddyfile or Nginx config for your VM.)
