FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ── builder: install all deps + build ────────────────────────────────────────
FROM base AS builder
# NEXT_PUBLIC_* vars are baked into the JS bundle at build time
ARG NEXT_PUBLIC_FRONTEND_URL
ARG NEXT_PUBLIC_BACKEND_WS_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_BACKEND_WS_URL=$NEXT_PUBLIC_BACKEND_WS_URL
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
