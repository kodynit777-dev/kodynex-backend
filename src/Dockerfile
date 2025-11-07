# ===== build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

# انسخ الحزم + prisma أولاً
COPY package*.json ./
COPY prisma ./prisma

# ثبّت واعمل generate قبل build
RUN npm ci
RUN npx prisma generate

# انسخ بقية السورس وابنِ
COPY . .
RUN npm run build

# قلّص الديف ديبندنسيز
RUN npm prune --omit=dev

# ===== runtime stage =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# حِزم مطلوبة لـ Prisma على Alpine
RUN apk add --no-cache openssl libc6-compat

# انسخ ما نحتاجه للتشغيل فقط
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
