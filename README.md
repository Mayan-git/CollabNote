# CollabNote

A real-time collaborative note editor — Google Docs-style live editing, Notion-style organization, and built-in AI writing tools. Built as a full-stack, production-shaped SaaS monorepo.

![CollabNote](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Node](https://img.shields.io/badge/node-%3E%3D20-green)

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Monorepo structure](#monorepo-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Deployment](#deployment)

## Features

- **Authentication** — signup/login, JWT access + refresh token rotation, email verification, password reset, avatar upload, role-based authorization
- **Notes** — rich text editing (TipTap), markdown, checklists, tables, code blocks with syntax highlighting, tags, folders, pin/favorite/archive/trash, full-text search
- **Real-time collaboration** — Socket.IO with a Redis adapter, live presence, cursor broadcasting, typing indicators, collaborative autosave
- **Version history** — automatic snapshots on every save with one-click restore
- **Sharing & permissions** — owner/editor/commenter/viewer roles, email invitations, expiring public share links
- **Comments** — inline comments with resolve/delete and @mention notifications
- **AI toolkit** — summarize, fix grammar, rewrite, translate, generate titles/tags, meeting-notes formatting, action-item extraction (pluggable LLM provider)
- **Notifications** — real-time in-app notifications for shares, mentions, and comments
- **Admin panel** — user management, note moderation, analytics dashboard, activity logs
- **Dashboard** — sidebar navigation, dark/light/system theme, global search, notification center

## Tech stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Radix UI primitives (shadcn-style) · Zustand · TanStack Query · Axios · React Hook Form + Zod · TipTap · Framer Motion · React Router · Recharts

**Backend:** Node.js · Express · TypeScript · Socket.IO (+ Redis adapter) · MongoDB/Mongoose · Redis (ioredis) · JWT · bcrypt · Helmet/CORS/rate-limiting · Multer + Cloudinary · Nodemailer · Zod · Swagger

**DevOps:** Docker & Docker Compose · GitHub Actions CI · ESLint/Prettier · Husky + Commitlint · Vitest

## Monorepo structure

```
.
├── client/          # React 19 + Vite SPA
│   └── src/
│       ├── app/            # query client, app-level wiring
│       ├── components/     # ui primitives, layout, feature components
│       ├── context/        # AuthProvider, SocketProvider
│       ├── features/       # (feature-scoped extension point)
│       ├── hooks/           # data-fetching & socket hooks
│       ├── layouts/         # AuthLayout, DashboardLayout
│       ├── pages/           # route-level pages
│       ├── services/        # axios API clients + socket client
│       ├── store/           # zustand stores
│       └── types/           # shared TS types
├── server/          # Express + TypeScript API
│   └── src/
│       ├── config/          # env, db, redis, cloudinary, swagger, logger
│       ├── constants/       # roles, http status, socket events
│       ├── controllers/     # route handlers
│       ├── helpers/         # mailer + templates
│       ├── middlewares/     # auth, validation, rate limiting, errors, upload
│       ├── models/          # Mongoose schemas
│       ├── repositories/    # data-access layer
│       ├── services/        # business logic layer
│       ├── socket/          # Socket.IO server, presence, event bus
│       ├── routes/          # Express routers
│       ├── utils/           # ApiError, ApiResponse, jwt, pagination, etc.
│       └── validators/      # Zod request schemas
├── docs/            # architecture, API, deployment, environment guides
├── docker-compose.yml
└── .github/workflows/ci.yml
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture write-up.

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Redis Cloud](https://redis.com/redis-enterprise-cloud/))
- (Optional) Cloudinary account for file uploads, SMTP credentials for email, an LLM API key for AI features

### Local development (without Docker)

```bash
# 1. Install all workspace dependencies from the repo root
npm install

# 2. Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env
# then fill in server/.env with your Mongo/Redis/JWT secrets

# 3. Run both apps concurrently
npm run dev
```

- API: http://localhost:5000 (docs at `/api-docs`)
- Client: http://localhost:5173

### Local development with Docker Compose

```bash
docker compose up --build
```

This starts MongoDB, Redis, the API, and the client (served via Nginx) with sane defaults. Override secrets via a `.env` file at the repo root (see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)).

## Environment variables

Full reference: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

## Scripts

Run from the repo root (npm workspaces):

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Run client + server concurrently in watch mode |
| `npm run build` | Build both workspaces for production           |
| `npm run lint`  | Lint both workspaces                           |
| `npm run test`  | Run backend and frontend test suites           |

## Architecture

CollabNote follows a layered, clean-architecture-inspired backend (routes → controllers → services → repositories → models) and a feature-oriented frontend (services → hooks → pages/components). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details, including the real-time collaboration design.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Developer guide](docs/DEVELOPER_GUIDE.md)

## Deployment

- **Frontend** → Vercel or the included Nginx Docker image
- **Backend** → Render or the included Docker image
- **Database** → MongoDB Atlas
- **Cache / Socket.IO adapter** → Redis Cloud
- **File storage** → Cloudinary

Step-by-step instructions: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## License

MIT
