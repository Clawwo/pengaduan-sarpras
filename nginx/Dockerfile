FROM nginx:1.25-alpine

# Install curl untuk healthcheck
RUN apk add --no-cache curl

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN mkdir -p /usr/share/nginx/html && \
    echo "OK" > /usr/share/nginx/html/health

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
