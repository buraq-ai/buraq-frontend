# ============================================================
# Stage 1: Build
# Compile the Angular app into static files
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json .

# Install dependencies (npm ci is faster and more reliable for CI/CD)
RUN npm ci --silent

# Copy source code and build for production
COPY . .
RUN npm run build -- --configuration production

# ============================================================
# Stage 2: Runtime
# Serve static files with nginx
# ============================================================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for Angular HTML5 routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular files from builder stage
# Path matches dist/buraq-frontend/browser from angular.json
COPY --from=builder /app/dist/buraq-frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]