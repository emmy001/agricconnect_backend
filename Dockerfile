# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (nest-cli.json asset config copies *.html/*.hbs/*.json into dist)
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application (already includes templates via nest-cli.json assets config)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy environment files
COPY .env.example .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]