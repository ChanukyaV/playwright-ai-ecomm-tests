# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: production runner ───────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
# Override at deploy time via Cloud Run env vars
# GEMINI_API_KEY must be supplied at deploy time (never bake it into the image)
ENV GEMINI_MODEL=gemini-3.5-flash-lite

# next.config.ts sets output: "standalone" — copy only what's needed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
