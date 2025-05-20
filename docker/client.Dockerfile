FROM node:18-alpine as build

WORKDIR /app

# Αντιγραφή μόνο των package.json και package-lock.json
COPY client/package.json client/package-lock.json* ./

# Εγκατάσταση όλων των εξαρτήσεων μαζί για να αποφευχθούν προβλήματα με διπλές εκδόσεις React
RUN npm install

# Αντιγραφή του πηγαίου κώδικα
COPY client/ ./

# Build της εφαρμογής
RUN npm run build

# Production stage
FROM nginx:alpine

# Αντιγραφή των αρχείων build
COPY --from=build /app/dist /usr/share/nginx/html

# Αντιγραφή της ρύθμισης του nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]