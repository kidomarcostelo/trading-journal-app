# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:22

WORKDIR /app

# Copy the built output from builder
COPY --from=builder /app/.output ./.output

# Environment variables for Cloud Run
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the nitro server
CMD ["node", ".output/server/index.mjs"]
