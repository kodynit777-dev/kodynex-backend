# =====================================================
# Stage 1 — Builder
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# انسخ ملفات البكج أولاً (علشان cache)
COPY package*.json ./

# انسخ prisma قبل npm ci عشان postinstall ما يفشل
COPY prisma ./prisma

# ثبّت التبعيات كاملة (يشمل dev)
RUN npm ci

# انسخ باقي ملفات المشروع
COPY . .

# شغّل Prisma generate (لو ما اشتغل بالpostinstall)
RUN npx prisma generate

# أبنِ تطبيق Next.js
RUN npm run build


# =====================================================
# Stage 2 — Runner (صغير وخفيف)
# =====================================================
FROM node:20-alpine AS runner

WORKDIR /app

# نحتاج openssl و gcompat لتوافق Prisma في Alpine
RUN apk add --no-cache openssl libc6-compat

# نسخ ملفات التشغيل فقط من الـ builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# تعيين المنفذ الافتراضي
ENV PORT=3000
EXPOSE 3000

# الأمر النهائي للتشغيل
CMD ["npm", "start"]
