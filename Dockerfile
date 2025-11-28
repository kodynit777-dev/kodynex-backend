# -----------------------------
# Stage 1: Build the application
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the full source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the project
RUN npm run build


# -----------------------------
# Stage 2: Run the application
# -----------------------------
FROM node:20-alpine
WORKDIR /app

# Copy only necessary files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built application + prisma folder + prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# No need to run prisma generate again here

EXPOSE 3000

CMD ["node", "dist/main.js"]
