import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '..', 'documents');

// Document model (in-memory implementation for simplicity)
export class Document {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || 'Untitled Document';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  // Load all documents
  static async findAll() {
    try {
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      const documents = JSON.parse(data);
      
      return documents.map(doc => new Document(doc));
    } catch (err) {
      if (err.code === 'ENOENT') {
        // If index file doesn't exist yet, return empty array
        return [];
      }
      
      throw err;
    }
  }
  
  // Find document by ID
  static async findById(id) {
    const documents = await Document.findAll();
    const document = documents.find(doc => doc.id === id);
    
    return document || null;
  }
  
  // Save document to storage
  async save() {
    try {
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
      
      // Update or insert document
      const index = documents.findIndex(doc => doc.id === this.id);
      
      if (index !== -1) {
        // Update
        documents[index] = this;
      } else {
        // Insert
        documents.push(this);
      }
      
      // Save updated index
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
      
      return this;
    } catch (err) {
      throw err;
    }
  }
  
  // Delete document
  async remove() {
    try {
      // Load existing documents
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      let documents = JSON.parse(data);
      
      // Filter out this document
      documents = documents.filter(doc => doc.id !== this.id);
      
      // Save updated index
      await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
      
      return true;
    } catch (err) {
      throw err;
    }
  }
}