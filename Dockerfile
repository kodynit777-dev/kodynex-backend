# FORCE REBUILD 2026-02-10
# ------------------------
# -----------------------------
# Stage 1: Build the application
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the full source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the project
RUN npm run build


# -----------------------------
# Stage 2: Production image
# -----------------------------
FROM node:20-alpine
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy dist + prisma client + prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

CMD ["node", "dist/main.js"]
