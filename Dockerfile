# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-bookworm-slim

# ---- deps: production-only node_modules, built in parallel with "builder" ----
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit --no-fund

# ---- builder: full deps + prisma client + nest build ----
FROM node:${NODE_VERSION} AS builder

ENV PRISMA_CLI_TELEMETRY_DISABLED=1 \
    CHECKPOINT_DISABLE=1

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

RUN npx prisma generate

COPY . .

RUN npm run build

# ---- runner: minimal production image ----
FROM node:${NODE_VERSION} AS runner

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production \
    PRISMA_CLI_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
