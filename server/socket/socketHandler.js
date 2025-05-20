import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import { awareness } from 'y-protocols/awareness.js';

// Map to store document instances
const documents = new Map();

// Get or create a Y.Doc instance for a document ID
export const getYDoc = (docId) => {
  if (!documents.has(docId)) {
    const doc = new Y.Doc();
    documents.set(docId, doc);
    
    // Initialize with empty text if needed
    doc.getText('content');
  }
  
  return documents.get(docId);
};

// Set up WebSocket connection with a client
export const handleConnection = (conn, req) => {
  const url = new URL(req.url, 'http://localhost');
  const docId = url.pathname.slice(1); // Remove leading slash
  
  if (!docId) {
    conn.close();
    return;
  }
  
  const doc = getYDoc(docId);
  
  setupWSConnection(conn, req, {
    docId,
    gc: true,
  });
  
  console.log(`Client connected to document: ${docId}`);
  
  conn.on('close', () => {
    console.log(`Client disconnected from document: ${docId}`);
  });
};

// Get active users for a document
export const getActiveUsers = (docId) => {
  const doc = documents.get(docId);
  
  if (!doc) {
    return [];
  }
  
  // This would need to be implemented using the awareness protocol
  // For demonstration purposes, we return an empty array
  return [];
};