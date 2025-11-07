# ===== build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

# ثبّت الحزم
COPY package*.json ./
RUN npm ci

# انسخ بقية السورس
COPY . .

# شغّل prisma generate إذا المجلد موجود
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; else echo "No prisma/schema.prisma, skipping generate"; fi

# ابنِ المشروع
RUN npm run build

# قلّص الديف ديبندنسيز
RUN npm prune --omit=dev

# ===== runtime stage =====
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# مكاتب مطلوبة مع Prisma غالباً
RUN apk add --no-cache openssl libc6-compat

# انسخ ما نحتاجه للتشغيل
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# لا تنسخ prisma هنا (غير موجود وقد لا يلزم وقت التشغيل)
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
