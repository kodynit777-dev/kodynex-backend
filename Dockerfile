# -----------------------------
# Stage 1: Build the application
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source code
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

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma client
RUN npx prisma generate

EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
