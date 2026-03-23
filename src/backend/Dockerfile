# ==============================================================================
# Backend — Dockerfile (multi-stage)
# ==============================================================================

# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ─── Desarrollo (hot reload con nodemon) ─────────────────────────────────────
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ─── Producción ──────────────────────────────────────────────────────────────
FROM base AS production
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
