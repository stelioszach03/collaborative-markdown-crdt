import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import morgan from 'morgan';
import * as dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, 'documents');

// Ensure documents directory exists
try {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  console.log(`Documents directory created: ${DOCUMENTS_DIR}`);
} catch (err) {
  console.error(`Error creating documents directory: ${err.message}`);
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory document storage (for demonstration)
let documents = [];

// Try to load existing documents
try {
  const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
  const indexData = await fs.readFile(indexPath, 'utf8');
  documents = JSON.parse(indexData);
  console.log(`Loaded ${documents.length} documents from index`);
} catch (err) {
  // If file doesn't exist or is invalid, start with empty array
  console.log(`Starting with empty documents index: ${err.message}`);
  documents = [];
}

// Save document index
const saveDocumentIndex = async () => {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving document index: ${err.message}`);
  }
};

// Routes
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

app.post('/api/documents', (req, res) => {
  const { name } = req.body;
  const newDoc = {
    id: uuidv4(),
    name: name || 'Untitled Document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  documents.push(newDoc);
  saveDocumentIndex();
  
  res.status(201).json(newDoc);
});

app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  res.json(document);
});

app.patch('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  const updatedDoc = {
    ...documents[documentIndex],
    name: name || documents[documentIndex].name,
    updatedAt: new Date().toISOString(),
  };
  
  documents[documentIndex] = updatedDoc;
  saveDocumentIndex();
  
  res.json(updatedDoc);
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const documentIndex = documents.findIndex(doc => doc.id === id);
  
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  documents.splice(documentIndex, 1);
  saveDocumentIndex();
  
  res.status(204).send();
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const staticPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(staticPath));
  
  // For any request that doesn't match an API route, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Document instances
const docs = new Map();

// Set up WebSocket server for Yjs
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Parse the URL to extract the document ID
  const url = new URL(req.url, `http://${req.headers.host}`);
  const docId = url.pathname.slice(1); // Remove leading slash
  
  console.log(`New WebSocket connection for document: ${docId}`);
  
  // Get or create a Y.Doc instance
  if (!docs.has(docId)) {
    const doc = new Y.Doc();
    docs.set(docId, doc);
  }
  
  const doc = docs.get(docId);
  
  // Set up awareness (for user presence)
  const awareness = new Map();
  
  // Send updates to all clients when document changes
  const broadcastUpdate = (update, origin) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) { // 1 is the OPEN state
        client.send(JSON.stringify({
          type: 'update',
          update: update.toString('base64'),
        }));
      }
    });
  };
  
  // Handle WebSocket messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'sync') {
        // Initial sync request
        const state = Y.encodeStateAsUpdate(doc);
        ws.send(JSON.stringify({
          type: 'sync',
          update: state.toString('base64'),
        }));
      } else if (data.type === 'update') {
        // Apply update to document
        const update = Buffer.from(data.update, 'base64');
        Y.applyUpdate(doc, update);
        broadcastUpdate(update, ws);
      } else if (data.type === 'awareness') {
        // Update user awareness state
        awareness.set(data.clientId, data.state);
        
        // Broadcast awareness update
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'awareness',
              updates: [{
                clientId: data.clientId,
                state: data.state,
              }],
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });
  
  // Clean up when connection closes
  ws.on('close', () => {
    console.log(`WebSocket connection closed for document: ${docId}`);
  });
  
  // Update document's updatedAt timestamp when connection is established
  const docIndex = documents.findIndex(doc => doc.id === docId);
  if (docIndex !== -1) {
    documents[docIndex].updatedAt = new Date().toISOString();
    saveDocumentIndex();
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 