# ===== build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

# نسخ package.json وتثبيت كل التبعيات (يشمل dev)
COPY package*.json ./
RUN npm ci

# انسخ مجلد prisma وشغّل prisma generate قبل البناء
COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# انسخ باقي السورس
COPY . .

# ابنِ المشروع
RUN npm run build

# ===== runtime stage =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

# نسخ ملفات التشغيل فقط
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# نسخ prisma client من مرحلة البناء
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# نسخ ناتج البناء وملف prisma schema
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]
