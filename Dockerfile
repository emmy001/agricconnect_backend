# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy environment files
COPY .env.example .env

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]