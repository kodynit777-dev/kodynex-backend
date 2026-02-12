# ---------- Builder ----------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# 🔑 تثبيت OpenSSL 1.1
RUN apt-get update && apt-get install -y \
    openssl \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ---------- Production ----------
FROM node:20-bookworm-slim

WORKDIR /app

# 🔑 تثبيت OpenSSL 1.1
RUN apt-get update && apt-get install -y \
    openssl \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/main.js"]
