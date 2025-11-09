# ====== deps/builder ======
FROM node:20-alpine AS builder
WORKDIR /app

# 1) حزم النظام
RUN apk add --no-cache openssl libc6-compat

# 2) انسخ ملفات الحزم + prisma قبل npm ci
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# 3) ثبّت الاعتمادات (يشمل postinstall: prisma generate)
# لو تبغى صورة أصغر لاحقًا، ممكن تستخدم --omit=dev لكن تأكد وقتها أن prisma موجودة ضمن dependencies (وهي عندك كذلك ✅)
RUN npm ci

# 4) انسخ باقي السورس وابنِ (Nest يطلّع dist)
COPY . .
RUN npm run build

# ====== runner ======
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# انسخ فقط اللي نحتاجه للتشغيل:
# - node_modules (من builder بعد generate)
# - dist (ناتج البناء)
# - prisma (لو بتحتاج migrations وقت التشغيل/المهام المؤقتة)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000
# شغّل النسخة المبنية (بدون اعتماد على nest CLI)
CMD ["node","dist/main.js"]
