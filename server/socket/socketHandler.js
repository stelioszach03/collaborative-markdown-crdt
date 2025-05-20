import * as Y from 'yjs';
import pkg from 'y-websocket';
const { WebsocketProvider } = pkg;
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { writeUpdate, storeUpdate } from '../utils/documentStore.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPDATES_DIR = path.join(__dirname, '..', 'documents', 'updates');

// Create updates directory if it doesn't exist
try {
  await fs.mkdir(UPDATES_DIR, { recursive: true });
  console.log(`Updates directory created: ${UPDATES_DIR}`);
} catch (err) {
  console.error(`Error creating updates directory: ${err.message}`);
}

// Map to store document instances and their awareness states
const docs = new Map();
const awarenessList = new Map();

// Get or create a Y.Doc instance for a document ID
export const getYDoc = (docId) => {
  if (!docs.has(docId)) {
    const doc = new Y.Doc();
    docs.set(docId, doc);
    
    // Initialize text for new document
    doc.getText('content');
    
    // Set up awareness
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenessList.set(docId, awareness);
    
    // Save document updates
    doc.on('update', (update, origin) => {
      // Store update for document history
      storeUpdate(docId, update, origin);
    });
    
    // Try to load existing document state
    loadDocumentUpdates(docId, doc);
  }
  
  return { 
    doc: docs.get(docId), 
    awareness: awarenessList.get(docId)
  };
};

// Load document updates from storage
async function loadDocumentUpdates(docId, doc) {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    
    try {
      await fs.mkdir(updatesDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const updateFiles = await fs.readdir(updatesDir);
    updateFiles.sort(); // Sort by timestamp
    
    // Apply updates in order
    for (const file of updateFiles) {
      if (file.endsWith('.update')) {
        const update = await fs.readFile(path.join(updatesDir, file));
        Y.applyUpdate(doc, update);
      }
    }
    
    console.log(`Loaded ${updateFiles.length} updates for document ${docId}`);
  } catch (err) {
    console.error(`Error loading document updates: ${err.message}`);
  }
}

// Handle WebSocket connection with a client
export const handleConnection = (conn, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const docId = url.pathname.slice(1); // Remove leading slash
  
  if (!docId) {
    conn.close();
    return;
  }
  
  const { doc, awareness } = getYDoc(docId);
  
  // Custom WebSocket handling implementation
  conn.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'sync') {
        // Handle sync messages
        const encoder = new Y.DSEncoder();
        const stateVector = parsedMessage.stateVector ? Y.decodeStateVector(parsedMessage.stateVector) : Y.encodeStateVector(doc);
        const update = Y.encodeStateAsUpdate(doc, stateVector);
        
        conn.send(JSON.stringify({
          type: 'sync',
          update: update.toString('base64')
        }));
      } else if (parsedMessage.type === 'update') {
        // Apply update to document
        const update = Buffer.from(parsedMessage.update, 'base64');
        Y.applyUpdate(doc, update);
        
        // Broadcast update to all clients except sender
        broadcastUpdate(docId, update, conn);
      } else if (parsedMessage.type === 'awareness') {
        // Update awareness state
        if (parsedMessage.states) {
          awarenessProtocol.applyAwarenessUpdate(
            awareness, 
            parsedMessage.states
          );
        }
      }
    } catch (err) {
      console.error(`Error handling message: ${err.message}`);
    }
  });
  
  // Initial sync
  const encoder = new Y.DSEncoder();
  const update = Y.encodeStateAsUpdate(doc);
  
  conn.send(JSON.stringify({
    type: 'sync',
    update: update.toString('base64')
  }));
  
  // Send current awareness states
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    conn.send(JSON.stringify({
      type: 'awareness',
      states: awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
    }));
  }
  
  conn.on('close', () => {
    console.log(`Client disconnected from document: ${docId}`);
  });
  
  console.log(`Client connected to document: ${docId}`);
};

// Broadcast update to all clients for a document
function broadcastUpdate(docId, update, excludeConn) {
  // Implementation details would depend on how connections are stored
  // This is a placeholder
}

// Get active users for a document
export const getActiveUsers = (docId) => {
  const awareness = awarenessList.get(docId);
  
  if (!awareness) {
    return [];
  }
  
  const users = [];
  awareness.getStates().forEach((state, clientId) => {
    if (state.user) {
      users.push({
        clientId,
        userId: state.user.id,
        username: state.user.name,
        color: state.user.color
      });
    }
  });
  
  return users;
};

// Get edit history for a document
export const getEditHistory = async (docId, period = '24h') => {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    const now = new Date();
    let cutoff;
    
    // Determine time period cutoff
    switch (period) {
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Read update files
    const files = await fs.readdir(updatesDir);
    const updates = [];
    
    for (const file of files) {
      if (file.endsWith('.update')) {
        // Extract timestamp from filename (e.g., 1621234567890.update)
        const timestamp = parseInt(file.split('.')[0]);
        const updateTime = new Date(timestamp);
        
        if (updateTime >= cutoff) {
          const metadata = await getUpdateMetadata(docId, file);
          updates.push({
            timestamp: updateTime,
            formattedTime: formatTime(updateTime, period),
            ...metadata
          });
        }
      }
    }
    
    // Process updates data
    return processUpdateHistory(updates, period);
  } catch (err) {
    console.error(`Error getting edit history: ${err.message}`);
    return [];
  }
};

// Helper function to read update metadata
async function getUpdateMetadata(docId, filename) {
  try {
    const metaFile = filename.replace('.update', '.meta.json');
    const metaPath = path.join(UPDATES_DIR, docId, metaFile);
    
    const data = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { userId: 'unknown', changeSize: 0 };
  }
}

// Format timestamp based on period
function formatTime(date, period) {
  if (period === '24h') {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

// Process update history to return chart-friendly data
function processUpdateHistory(updates, period) {
  // Group updates by time period
  const groupedUpdates = new Map();
  
  for (const update of updates) {
    const key = update.formattedTime;
    
    if (!groupedUpdates.has(key)) {
      groupedUpdates.set(key, {
        timestamp: update.timestamp,
        formattedTime: key,
        edits: 0,
        characters: 0
      });
    }
    
    const group = groupedUpdates.get(key);
    group.edits += 1;
    group.characters += update.changeSize || 0;
  }
  
  // Convert to array and sort by timestamp
  const result = Array.from(groupedUpdates.values());
  result.sort((a, b) => a.timestamp - b.timestamp);
  
  return result;
}

// Get collaboration stats for a document
export const getCollaborationStats = async (docId) => {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    const files = await fs.readdir(updatesDir);
    
    // Process metadata to get collaboration stats
    const userStats = new Map();
    
    for (const file of files) {
      if (file.endsWith('.meta.json')) {
        const metaPath = path.join(updatesDir, file);
        const data = await fs.readFile(metaPath, 'utf8');
        const metadata = JSON.parse(data);
        
        if (!userStats.has(metadata.userId)) {
          userStats.set(metadata.userId, {
            userId: metadata.userId,
            username: metadata.username || 'Unknown User',
            color: metadata.color || '#cccccc',
            edits: 0
          });
        }
        
        const stats = userStats.get(metadata.userId);
        stats.edits += 1;
      }
    }
    
    return Array.from(userStats.values());
  } catch (err) {
    console.error(`Error getting collaboration stats: ${err.message}`);
    return [];
  }
};

// Get document analytics
export const getDocumentAnalytics = async (docId) => {
  try {
    const { doc } = getYDoc(docId);
    const text = doc.getText('content').toString();
    
    // Get update history for trends
    const updatesDir = path.join(UPDATES_DIR, docId);
    const files = await fs.readdir(updatesDir);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    
    // Basic stats
    const totalEdits = metaFiles.length;
    const collaborators = new Set();
    let timeSpent = 0;
    let revisions = 0;
    
    // Calculate stats from metadata
    for (const file of metaFiles) {
      const metaPath = path.join(updatesDir, file);
      const data = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(data);
      
      collaborators.add(metadata.userId);
      timeSpent += metadata.duration || 0;
      
      if (metadata.isRevision) {
        revisions += 1;
      }
    }
    
    // Calculate trends (compare with previous period)
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEdits = metaFiles.filter(file => {
      const timestamp = parseInt(file.split('.')[0]);
      return timestamp > dayAgo.getTime();
    }).length;
    
    const olderEdits = metaFiles.filter(file => {
      const timestamp = parseInt(file.split('.')[0]);
      return timestamp <= dayAgo.getTime() && timestamp > dayAgo.getTime() - 24 * 60 * 60 * 1000;
    }).length;
    
    const editsTrend = olderEdits === 0 ? 100 : ((recentEdits - olderEdits) / olderEdits) * 100;
    
    // Document content stats
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const characterCount = text.length;
    const headingCount = (text.match(/^#+\s+/gm) || []).length;
    const listItemCount = (text.match(/^[\s]*[-*+]\s+/gm) || []).length + (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
    
    return {
      totalEdits,
      editsTrend: Math.round(editsTrend),
      collaborators: collaborators.size,
      collaboratorsTrend: 0, // Calculate if needed
      timeSpent: Math.round(timeSpent / 60), // Convert to minutes
      timeSpentTrend: 0, // Calculate if needed
      revisions,
      revisionsTrend: 0, // Calculate if needed
      lastSaved: new Date(),
      wordCount,
      characterCount,
      headingCount,
      listItemCount
    };
  } catch (err) {
    console.error(`Error getting document analytics: ${err.message}`);
    return {
      totalEdits: 0,
      editsTrend: 0,
      collaborators: 0,
      collaboratorsTrend: 0,
      timeSpent: 0,
      timeSpentTrend: 0,
      revisions: 0,
      revisionsTrend: 0,
      lastSaved: new Date(),
      wordCount: 0,
      characterCount: 0,
      headingCount: 0,
      listItemCount: 0
    };
  }
};