# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules


# Copy assets (templates) from builder
COPY --from=builder /app/dist/modules/notifications/templates ./dist/modules/notifications/templates

# Or copy from source if needed
COPY --from=builder /app/src/modules/notifications/templates ./dist/modules/notifications/templates

# Copy environment files
COPY .env.example .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]