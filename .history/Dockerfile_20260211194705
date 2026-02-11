# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build with explicit output
RUN npx nest build --path dist


# =========================
# Stage 2: Production
# =========================
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install prod deps
RUN npm install --omit=dev

# Copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
