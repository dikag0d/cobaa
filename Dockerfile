# ── Stage 1: Build ──────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production ────────────────────
FROM node:20-alpine

LABEL maintainer="dika"
LABEL description="Docker + GitHub Codespaces Demo App"

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set environment
ENV NODE_ENV=production
ENV RUNNING_IN_DOCKER=true
ENV PORT=3000

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run as non-root
USER appuser

CMD ["node", "app.js"]
