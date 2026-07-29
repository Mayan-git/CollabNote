# Build context is the monorepo root (npm workspaces share one lockfile there).
# Build with: docker build -f client/Dockerfile -t collabnote-client .

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci

COPY client ./client
RUN npm run build --workspace=client

# --- Production stage ---
FROM nginx:1.27-alpine AS production
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
