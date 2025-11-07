# ===== build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# انسخ مجلد prisma قبل باقي السورس
COPY prisma ./prisma
# اطبع نسخة Prisma ثم شغّل generate على المسار الصريح
RUN npx prisma --version && npx prisma generate --schema=prisma/schema.prisma

# الآن انسخ باقي السورس وابنِ
COPY . .
RUN npm run build && npm prune --omit=dev

# ===== runtime stage =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
