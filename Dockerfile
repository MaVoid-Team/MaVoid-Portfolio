# Multi-stage Dockerfile for building a Vite React app and serving with nginx
FROM node:24-alpine AS builder
WORKDIR /app

# Install deps (use package-lock if present)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --only=production=false; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Replace default nginx conf with one providing SPA fallback
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
