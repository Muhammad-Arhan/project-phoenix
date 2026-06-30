# ---------- Builder Stage ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund && npm cache clean --force

# Copy application files
COPY index.html .
COPY index.js .

# Build the Vite frontend
RUN npm run build


# ---------- Production Stage ----------
FROM node:18-alpine

WORKDIR /app

# Copy only the required files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/index.js ./

# Install only production dependencies
RUN npm ci --omit=dev --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm && \
    mkdir -p /app/logs && \
    chown -R node:node /app

# Run as the restricted node user
USER node

# Expose Express port
EXPOSE 5000

# Start the Express server
CMD ["node", "index.js"]