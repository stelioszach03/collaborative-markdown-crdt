import {
  createDocument as createDocumentInStore,
  getAllDocuments as getAllDocumentsFromStore,
  getDocumentById as getDocumentByIdFromStore,
  updateDocument as updateDocumentInStore,
  deleteDocument as deleteDocumentFromStore
} from '../utils/documentStore.js';

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await getAllDocumentsFromStore();
    res.json(documents);
  } catch (err) {
    console.error(`Error fetching documents: ${err.message}`);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { name } = req.body;
    const newDoc = await createDocumentInStore(name);
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
    const document = await getDocumentByIdFromStore(id);
    res.json(document);
  } catch (err) {
    console.error(`Error fetching document: ${err.message}`);
    res.status(404).json({ message: 'Document not found' });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const updatedDoc = await updateDocumentInStore(id, { name });
    res.json(updatedDoc);
  } catch (err) {
    console.error(`Error updating document: ${err.message}`);
    
    if (err.message === 'Document not found') {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(500).json({ message: 'Error updating document' });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDocumentFromStore(id);
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting document: ${err.message}`);
    
    if (err.message === 'Document not found') {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(500).json({ message: 'Error deleting document' });
  }
};