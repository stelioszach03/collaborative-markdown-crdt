import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '..', 'documents');

// Ensure documents directory exists
try {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
} catch (err) {
  console.error(`Error creating documents directory: ${err.message}`);
}

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    const documents = JSON.parse(data);
    
    res.json(documents);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If index file doesn't exist yet, return empty array
      return res.json([]);
    }
    
    console.error(`Error fetching documents: ${err.message}`);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { name } = req.body;
    
    const newDoc = {
      id: uuidv4(),
      name: name || 'Untitled Document',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Load existing documents
    let documents = [];
    try {
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // If file doesn't exist, start with empty array
    }
    
    // Add new document
    documents.push(newDoc);
    
    // Save updated index
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
    
    res.status(201).json(newDoc);
  } catch (err) {
    console.error(`Error creating document: ${err.message}`);
    res.status(500).json({ message: 'Error creating document' });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Load documents
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    const documents = JSON.parse(data);
    
    const document = documents.find(doc => doc.id === id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(`Error fetching document: ${err.message}`);
    res.status(500).json({ message: 'Error fetching document' });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Load documents
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    const documents = JSON.parse(data);
    
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document
    const updatedDoc = {
      ...documents[documentIndex],
      name: name || documents[documentIndex].name,
      updatedAt: new Date().toISOString(),
    };
    
    documents[documentIndex] = updatedDoc;
    
    // Save updated index
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
    
    res.json(updatedDoc);
  } catch (err) {
    console.error(`Error updating document: ${err.message}`);
    res.status(500).json({ message: 'Error updating document' });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Load documents
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    const documents = JSON.parse(data);
    
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Remove document
    documents.splice(documentIndex, 1);
    
    // Save updated index
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
    
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting document: ${err.message}`);
    res.status(500).json({ message: 'Error deleting document' });
  }
};