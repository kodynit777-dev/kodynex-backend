# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# 1) فقط ملفات البكج أولاً عشان الكاش
COPY package*.json ./

# 2) تثبيت الاعتمادات (يتضمن postinstall: prisma generate)
RUN npm ci

# 3) نسخ سكيمة بريزما وتشغيل generate (اختياري لأن postinstall سوّاها)
COPY prisma ./prisma
RUN npx prisma generate

# 4) نسخ بقية السورس وبناء NestJS
COPY . .
RUN npm run build

# 5) إزالة dev deps للصورة النهائية
RUN npm prune --omit=dev

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

# (اختياري) حزم لازمة أحياناً لـ Prisma مع Alpine
RUN apk add --no-cache openssl libc6-compat

# 6) نسخ الملفات النهائية فقط
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# ملاحظة:
# - لو عندك مجلد public فعلاً (يُخدم عبر ServeStaticModule)، انسخه من السورس:
#   COPY --from=builder /app/public ./public
# - غير كذا "لا" تضيفه.

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
