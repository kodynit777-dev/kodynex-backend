# ====== deps/builder ======
FROM node:20-alpine AS builder
WORKDIR /app

# 1) باكدجات النظام
RUN apk add --no-cache openssl libc6-compat

# 2) انسخ ملفات الحزم + مجلد prisma قبل npm ci
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# 3) ثبّت الاعتمادات (يشمل postinstall: prisma generate)
RUN npm ci

# 4) انسخ باقي السورس وابنِ
COPY . .
RUN npm run build

# ====== runner ======
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production

# لو تستخدم إخراج Next.js العادي:
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm","run","start"]
