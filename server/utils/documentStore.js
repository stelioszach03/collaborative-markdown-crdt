import * as Y from 'yjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '..', 'documents');
const UPDATES_DIR = path.join(DOCUMENTS_DIR, 'updates');

// Ensure directories exist
try {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  await fs.mkdir(UPDATES_DIR, { recursive: true });
} catch (err) {
  console.error(`Error creating document directories: ${err.message}`);
}

// Write a document update to the filesystem
export async function writeUpdate(docId, update, metadata = {}) {
  try {
    const docDir = path.join(UPDATES_DIR, docId);
    
    // Create document directory if it doesn't exist
    try {
      await fs.mkdir(docDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const timestamp = Date.now();
    const updateFile = path.join(docDir, `${timestamp}.update`);
    const metaFile = path.join(docDir, `${timestamp}.meta.json`);
    
    // Write update
    await fs.writeFile(updateFile, update);
    
    // Write metadata
    await fs.writeFile(metaFile, JSON.stringify({
      timestamp,
      ...metadata
    }, null, 2));
    
    return timestamp;
  } catch (err) {
    console.error(`Error writing update: ${err.message}`);
    throw err;
  }
}

// Store an update with additional metadata extracted from the update
export async function storeUpdate(docId, update, origin = null) {
  try {
    // Extract information from the update if possible
    let changeSize = 0;
    let userId = 'unknown';
    let username = 'Unknown User';
    let color = '#cccccc';
    let isRevision = false;
    
    // If origin contains user information, extract it
    if (origin && typeof origin === 'object') {
      if (origin.userId) userId = origin.userId;
      if (origin.username) username = origin.username;
      if (origin.color) color = origin.color;
      if (origin.isRevision) isRevision = true;
      
      // Try to estimate change size if not provided
      if (origin.changeSize) {
        changeSize = origin.changeSize;
      } else {
        // Rough estimate based on update size
        changeSize = update.byteLength;
      }
    }
    
    // Store the update with metadata
    return await writeUpdate(docId, update, {
      userId,
      username,
      color,
      changeSize,
      isRevision,
      duration: origin?.duration || 0 // Time spent on this edit if tracked
    });
  } catch (err) {
    console.error(`Error storing update: ${err.message}`);
    // Still write the update even if metadata extraction fails
    return await writeUpdate(docId, update);
  }
}

// Load all updates for a document
export async function loadDocumentUpdates(docId) {
  try {
    const docDir = path.join(UPDATES_DIR, docId);
    
    try {
      await fs.mkdir(docDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const files = await fs.readdir(docDir);
    const updateFiles = files.filter(file => file.endsWith('.update'));
    updateFiles.sort(); // Sort by timestamp
    
    const updates = [];
    
    for (const file of updateFiles) {
      const updatePath = path.join(docDir, file);
      const update = await fs.readFile(updatePath);
      updates.push(update);
    }
    
    return updates;
  } catch (err) {
    console.error(`Error loading document updates: ${err.message}`);
    return [];
  }
}

// Merge updates into a single state
export function mergeUpdates(updates) {
  if (updates.length === 0) return null;
  return Y.mergeUpdates(updates);
}

// Apply updates to a Y.Doc
export function applyUpdatesToDoc(doc, updates) {
  for (const update of updates) {
    Y.applyUpdate(doc, update);
  }
  return doc;
}

// Create a new document in storage
export async function createDocument(name = 'Untitled Document') {
  try {
    const id = generateDocId();
    const doc = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create document metadata
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
    }
    
    documents.push(doc);
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    // Create document directory
    const docDir = path.join(UPDATES_DIR, id);
    await fs.mkdir(docDir, { recursive: true });
    
    return doc;
  } catch (err) {
    console.error(`Error creating document: ${err.message}`);
    throw err;
  }
}

// Update document metadata
export async function updateDocument(id, data) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
      throw new Error('Document not found');
    }
    
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    const updatedDoc = {
      ...documents[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    documents[index] = updatedDoc;
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    return updatedDoc;
  } catch (err) {
    console.error(`Error updating document: ${err.message}`);
    throw err;
  }
}

// Delete a document
export async function deleteDocument(id) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
      throw new Error('Document not found');
    }
    
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    // Remove from index
    documents.splice(index, 1);
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    // Remove document files
    const docDir = path.join(UPDATES_DIR, id);
    await fs.rm(docDir, { recursive: true, force: true });
    
    return true;
  } catch (err) {
    console.error(`Error deleting document: ${err.message}`);
    throw err;
  }
}

// Get all documents
export async function getAllDocuments() {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      return JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, return empty array
      return [];
    }
  } catch (err) {
    console.error(`Error getting all documents: ${err.message}`);
    return [];
  }
}

// Get a document by ID
export async function getDocumentById(id) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      const documents = JSON.parse(indexData);
      const document = documents.find(doc => doc.id === id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (err) {
      // If file doesn't exist or is invalid, or document not found
      throw new Error('Document not found');
    }
  } catch (err) {
    console.error(`Error getting document: ${err.message}`);
    throw err;
  }
}

// Generate a unique document ID
function generateDocId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}