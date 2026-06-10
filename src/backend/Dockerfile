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

# ─── Producción (solo dependencias de prod) ──────────────────────────────────
FROM base AS production
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
