FROM node:18-alpine

WORKDIR /app

# Αντιγραφή package.json
COPY server/package.json ./

# Εγκατάσταση εξαρτήσεων
RUN npm install

# Αντιγραφή του πηγαίου κώδικα
COPY server/ ./

# Δημιουργία καταλόγου για έγγραφα
RUN mkdir -p documents/updates

# Έκθεση της θύρας 5000
EXPOSE 5000

# Εκκίνηση του server
CMD ["npm", "start"]