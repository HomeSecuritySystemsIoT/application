FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ── builder: install all deps + build ────────────────────────────────────────
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ── runner: production image ──────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
