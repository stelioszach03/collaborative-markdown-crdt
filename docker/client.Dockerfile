FROM node:18-alpine as build

WORKDIR /app

# Αντιγραφή μόνο των package.json και package-lock.json
COPY client/package.json ./

# Εγκατάσταση των εξαρτήσεων
RUN npm install

# Προσθήκη των missing dependencies
RUN npm install --save @chakra-ui/icons

# Αντιγραφή του πηγαίου κώδικα
COPY client/ ./

# Διόρθωση του commonPrefixLength
RUN sed -i 's/const commonPrefixLength = 0;/let commonPrefixLength = 0;/g' src/components/Editor/Editor.jsx

# Εμφάνιση των αρχείων για διαγνωστικούς λόγους
RUN find . -type f -name "*.jsx" | xargs grep -l "commonPrefixLength"

# Build της εφαρμογής με παράκαμψη των σφαλμάτων αν είναι δυνατόν
RUN npm run build || (cat /root/.npm/_logs/*-debug.log && exit 1)

# Production stage
FROM nginx:alpine

# Αντιγραφή των αρχείων build
COPY --from=build /app/dist /usr/share/nginx/html

# Αντιγραφή της ρύθμισης του nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]  