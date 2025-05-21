FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY client/package.json ./

# Use regular npm install instead of npm ci
RUN npm install

# Copy the rest of the client code
COPY client/ ./

# Create a simple output file for debugging purposes
RUN echo "Vite and React configuration is being applied..." > debug.log
RUN ls -la >> debug.log
RUN cat package.json >> debug.log

# Build the application
RUN npm run build || (cat debug.log && exit 1)

# Production image
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create a fallback HTML file for SPA routing
RUN echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Collaborative Markdown Editor</title></head><body><div id="root"></div><script>window.location.href="/";</script></body></html>' > /usr/share/nginx/html/404.html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]