# Stage 1: Build the app (named "builder")
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime image
FROM node:20-slim
WORKDIR /app

# Install minimal Python + botocore (for EFS IAM auth)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3-minimal python3-pip && \
    pip3 install --no-cache-dir --break-system-packages botocore && \
    rm -rf /var/lib/apt/lists/*

# Copy app files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["node", "dist/main.js"]
