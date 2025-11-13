# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument untuk API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production
RUN npm run build

# Production stage - Nginx untuk serve static files
FROM nginx:1.25-alpine

# Copy built files dari builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]