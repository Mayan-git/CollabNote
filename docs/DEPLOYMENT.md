# Deployment guide

CollabNote deploys as three independent pieces: a static frontend, a Node API, and managed data stores. Two paths are documented: managed PaaS (Vercel + Render + Atlas + Redis Cloud + Cloudinary) and self-hosted Docker Compose.

## 1. Managed PaaS deployment

### 1.1 MongoDB Atlas

1. Create a free/shared cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Add a database user and allow-list your deployment platform's IPs (or `0.0.0.0/0` for simplicity, tightened later).
3. Copy the connection string into `MONGO_URI`.

### 1.2 Redis Cloud

1. Create a free database at [redis.com/try-free](https://redis.com/try-free).
2. Copy the connection string (`redis://default:<password>@<host>:<port>`) into `REDIS_URL`.

### 1.3 Cloudinary

1. Create an account at [cloudinary.com](https://cloudinary.com).
2. Copy the Cloud name, API key, and API secret from the dashboard into `CLOUDINARY_*`.

### 1.4 Backend → Render

1. Push this repo to GitHub.
2. In Render, create a **Web Service** pointing at the `server/` directory (Root Directory: `server`).
3. Build command: `npm ci && npm run build`. Start command: `npm start`.
4. Add all variables from [ENVIRONMENT.md](ENVIRONMENT.md) (server section) in the Render dashboard, with `CLIENT_URL` set to your Vercel domain once known and `NODE_ENV=production`.
5. Deploy. Note the resulting `https://<service>.onrender.com` URL.

### 1.5 Frontend → Vercel

1. Import the repo into Vercel, set **Root Directory** to `client`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variables `VITE_API_URL=https://<render-service>.onrender.com/api/v1` and `VITE_SOCKET_URL=https://<render-service>.onrender.com`.
4. Deploy, then go back to Render and set `CLIENT_URL` to the resulting Vercel domain (e.g. `https://collabnote.vercel.app`) so CORS and cookies work, and redeploy the backend.

### 1.6 CI/CD

`.github/workflows/ci.yml` lints, type-checks, tests, and builds both workspaces (and verifies both Docker images build) on every push/PR. Connect Vercel/Render's own GitHub integrations for automatic deploys on merge to `main`.

## 2. Self-hosted with Docker Compose

```bash
cp server/.env.example server/.env   # fill in secrets
docker compose up --build -d
```

This brings up MongoDB, Redis, the API (port 5000), and the frontend served via Nginx (port 5173). Override any variable via a root-level `.env` file consumed by `docker-compose.yml` (`JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`, `AI_API_KEY`, …).

For a production host, put the whole stack behind a reverse proxy (e.g. Caddy/Traefik) that terminates TLS and forwards:

- `/` → the `client` container
- `/api/v1` and `/socket.io` → the `server` container (make sure WebSocket upgrade headers are forwarded)

## 3. Post-deploy checklist

- [ ] `CLIENT_URL` on the backend matches the deployed frontend origin exactly (including scheme)
- [ ] `NODE_ENV=production` on the backend so cookies are `Secure`/`SameSite=None`
- [ ] Distinct, high-entropy values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`
- [ ] SMTP credentials verified (send a test signup) or accept that emails will only be logged
- [ ] Cloudinary credentials verified (upload an avatar)
- [ ] `AI_API_KEY` set if AI features should be enabled
- [ ] MongoDB Atlas network access restricted to your deployment platform once stable
- [ ] `/api-docs` reachable and not exposing anything sensitive you don't want public (or put it behind auth/IP restriction)
