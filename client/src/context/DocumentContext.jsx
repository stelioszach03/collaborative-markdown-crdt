import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

const API_URL = '/api';

const DocumentContext = createContext();

export const useDocuments = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Initialize user if not already set
  useEffect(() => {
    const userId = Cookies.get('userId') || uuidv4();
    const username = Cookies.get('username') || `User_${userId.slice(0, 5)}`;
    const userColor = Cookies.get('userColor') || getRandomColor();

    // Save user data to cookies
    Cookies.set('userId', userId, { expires: 365 });
    Cookies.set('username', username, { expires: 365 });
    Cookies.set('userColor', userColor, { expires: 365 });

    setUser({
      id: userId,
      name: username,
      color: userColor
    });
  }, []);

  // Generate random pastel color for user
  const getRandomColor = () => {
    const colors = [
      '#F87171', // Red
      '#FB923C', // Orange
      '#FBBF24', // Amber
      '#A3E635', // Lime
      '#34D399', // Emerald
      '#22D3EE', // Cyan
      '#60A5FA', // Blue
      '#818CF8', // Indigo
      '#A78BFA', // Violet
      '#E879F9', // Fuchsia
      '#F472B6', // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get a document by ID
  const getDocumentById = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          navigate('/404');
          return null;
        }
        throw new Error('Failed to fetch document');
      }
      
      const document = await response.json();
      setCurrentDocument(document);
      return document;
    } catch (err) {
      console.error(`Error fetching document ${id}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new document
  const createDocument = async (name = 'Untitled Document') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
      
      const newDocument = await response.json();
      setDocuments(prev => [...prev, newDocument]);
      setCurrentDocument(newDocument);
      navigate(`/documents/${newDocument.id}`);
      return newDocument;
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (id, data) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      
      const updatedDocument = await response.json();
      
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      
      if (currentDocument?.id === id) {
        setCurrentDocument(updatedDocument);
      }
      
      return updatedDocument;
    } catch (err) {
      console.error(`Error updating document ${id}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      if (currentDocument?.id === id) {
        setCurrentDocument(null);
        navigate('/');
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting document ${id}:`, err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update username
  const updateUsername = (newUsername) => {
    if (!newUsername || newUsername.trim() === '') return;
    
    Cookies.set('username', newUsername, { expires: 365 });
    setUser(prev => ({
      ...prev,
      name: newUsername
    }));
  };

  // Update user color
  const updateUserColor = (newColor) => {
    if (!newColor) return;
    
    Cookies.set('userColor', newColor, { expires: 365 });
    setUser(prev => ({
      ...prev,
      color: newColor
    }));
  };

  // Initial fetch of documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <DocumentContext.Provider value={{
      documents,
      loading,
      error,
      currentDocument,
      user,
      fetchDocuments,
      getDocumentById,
      createDocument,
      updateDocument,
      deleteDocument,
      updateUsername,
      updateUserColor
    }}>
      {children}
    </DocumentContext.Provider>
  );
};