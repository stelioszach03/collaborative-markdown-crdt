FROM node:18-alpine

WORKDIR /app

# Copy only package.json first
COPY server/package.json ./

# Install dependencies
RUN npm install

# Install additional dependencies
RUN npm install y-websocket y-protocols

# Copy source code
COPY server/ ./

# Create documents directory
RUN mkdir -p documents/updates

EXPOSE 5000

CMD ["npm", "start"]