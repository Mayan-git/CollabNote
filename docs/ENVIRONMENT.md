# Environment variables

## Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and fill in the values below.

| Variable                                              | Required                   | Description                                                                                                             |
| ----------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                                            | no (default `development`) | `development` \| `test` \| `production`                                                                                 |
| `PORT`                                                | no (default `5000`)        | API port                                                                                                                |
| `CLIENT_URL`                                          | yes                        | Origin of the frontend, used for CORS and links in emails                                                               |
| `MONGO_URI`                                           | yes                        | MongoDB connection string (local or Atlas)                                                                              |
| `JWT_SECRET`                                          | yes                        | Signing secret for access tokens (32+ random chars)                                                                     |
| `JWT_EXPIRES_IN`                                      | no (default `15m`)         | Access token TTL                                                                                                        |
| `JWT_REFRESH_SECRET`                                  | yes                        | Signing secret for refresh tokens — **must differ** from `JWT_SECRET`                                                   |
| `JWT_REFRESH_EXPIRES_IN`                              | no (default `30d`)         | Refresh token TTL                                                                                                       |
| `COOKIE_SECRET`                                       | yes                        | Used to sign cookies                                                                                                    |
| `REDIS_URL`                                           | yes                        | Redis connection string (Socket.IO adapter, rate limiting)                                                              |
| `CLOUDINARY_CLOUD_NAME`                               | for uploads                | Cloudinary account                                                                                                      |
| `CLOUDINARY_API_KEY`                                  | for uploads                | Cloudinary API key                                                                                                      |
| `CLOUDINARY_API_SECRET`                               | for uploads                | Cloudinary API secret                                                                                                   |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | for email                  | Outbound SMTP for verification/reset/invite emails. If unset, emails are logged instead of sent (useful for local dev). |
| `SMTP_FROM`                                           | no                         | From-address display name                                                                                               |
| `AI_PROVIDER`                                         | no (default `anthropic`)   | `anthropic` or `gemini`                                                                                                 |
| `AI_API_KEY`                                          | for AI features            | API key for the configured LLM provider (Anthropic key or Google AI Studio key)                                         |
| `AI_MODEL`                                            | no                         | Model identifier to call, e.g. `claude-sonnet-5` (Anthropic) or `gemini-2.0-flash` (Gemini)                             |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`             | no                         | Global rate-limit window/ceiling                                                                                        |

Generate strong secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Client (`client/.env`)

Copy `client/.env.example` to `client/.env`.

| Variable          | Required | Description                                                    |
| ----------------- | -------- | -------------------------------------------------------------- |
| `VITE_API_URL`    | yes      | Base URL of the REST API, e.g. `http://localhost:5000/api/v1`  |
| `VITE_SOCKET_URL` | yes      | Base URL of the Socket.IO server, e.g. `http://localhost:5000` |

## Notes

- Never commit `.env` files — they're git-ignored by default.
- In production, set `NODE_ENV=production` so cookies are marked `Secure` and `SameSite=None` (required for cross-origin cookie auth between a Vercel frontend and a Render backend).
- If `AI_API_KEY` is unset, AI endpoints return a `400` explaining the feature isn't configured rather than failing silently.
