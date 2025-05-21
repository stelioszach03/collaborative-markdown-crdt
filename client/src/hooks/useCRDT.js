import { useCallback, useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useDocument } from '../context/DocumentContext';
import { debounce } from '../utils/crdt';

export function useCRDT(docId) {
  const { 
    ydoc, 
    provider, 
    awareness, 
    userId, 
    username, 
    userColor, // Παίρνουμε το userColor από το context
    connectToDocument 
  } = useDocument();
  
  const [ytext, setYtext] = useState(null);
  const [connected, setConnected] = useState(false);
  const [awarenessStates, setAwarenessStates] = useState(new Map());
  const [undoManager, setUndoManager] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [editDuration, setEditDuration] = useState(0);
  const providerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Connect to document
  useEffect(() => {
    if (!docId) return;
    
    const cleanup = () => {
      if (providerRef.current) {
        console.log(`Disconnecting from document: ${docId}`);
        providerRef.current.disconnect();
        providerRef.current = null;
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
    
    // Initial connection
    const connect = () => {
      cleanup(); // Clean up any existing connections
      
      try {
        const { ytext: newYtext, provider: newProvider } = connectToDocument(docId);
        if (!newYtext || !newProvider) {
          throw new Error("Failed to connect to document");
        }
        
        setYtext(newYtext);
        providerRef.current = newProvider;
        
        // Setup connection status
        const handleStatus = ({ status }) => {
          console.log(`WebSocket status: ${status}`);
          setConnected(status === 'connected');
          
          if (status === 'connected') {
            setReconnectAttempts(0); // Reset reconnect attempts on successful connection
          }
        };
        
        newProvider.on('status', handleStatus);
        setConnected(newProvider.wsconnected);
        
        // Create undo manager
        const newUndoManager = new Y.UndoManager(newYtext);
        setUndoManager(newUndoManager);
        
        // Setup awareness
        if (newProvider.awareness) {
          setAwareness(newProvider.awareness);
        }
        
        // Set initial awareness state for this user
        if (newProvider.awareness) {
          newProvider.awareness.setLocalState({
            userId,
            username,
            color: userColor, // Χρησιμοποιούμε το userColor από το context
            cursor: null,
            selection: null,
            lastUpdate: Date.now()
          });
        }
        
        // Handle connection errors
        newProvider.on('connection-error', (err) => {
          console.error('WebSocket connection error:', err);
          
          // Try to reconnect with increasing delay
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            
            reconnectTimerRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connect();
            }, delay);
          }
        });
        
        return newProvider;
      } catch (err) {
        console.error('Error in WebSocket connection:', err);
        return null;
      }
    };
    
    const newProvider = connect();
    
    return () => {
      cleanup();
      
      if (newProvider) {
        newProvider.off('status');
        newProvider.off('connection-error');
      }
      
      if (undoManager) {
        undoManager.destroy();
      }
    };
  }, [docId, connectToDocument, userId, username, userColor, reconnectAttempts]);

  // Track awareness updates
  useEffect(() => {
    if (!awareness) return;

    const updateAwareness = () => {
      const states = new Map();
      awareness.getStates().forEach((state, clientId) => {
        if (state.userId && state.userId !== userId) {
          states.set(clientId, state);
        }
      });
      setAwarenessStates(states);
    };

    updateAwareness(); // Initial state
    awareness.on('change', updateAwareness);

    return () => {
      awareness.off('change', updateAwareness);
    };
  }, [awareness, userId]);

  // Track edit duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (connected) {
        setEditDuration(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [connected]);

  // Update cursor position
  const updateCursor = useCallback((position, selection = null) => {
    if (!awareness) return;
    
    const current = awareness.getLocalState();
    if (current) {
      awareness.setLocalState({
        ...current,
        cursor: position,
        selection,
        lastUpdate: Date.now()
      });
    }
  }, [awareness]);

  // Debounced cursor update
  const debouncedUpdateCursor = useCallback(
    debounce(updateCursor, 50),
    [updateCursor]
  );

  // Insert text with metadata
  const insertText = useCallback((index, text) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: text.length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now,
      lastUpdate: now
    };
    
    ytext.insert(index, text, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Delete text with metadata
  const deleteText = useCallback((index, length) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: -length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now,
      lastUpdate: now
    };
    
    ytext.delete(index, length, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };
    
    undoManager.undo(origin);
  }, [undoManager, userId, username]);

  const redo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };
    
    undoManager.redo(origin);
  }, [undoManager, userId, username]);

  return {
    ytext,
    connected,
    awareness,
    awarenessStates,
    insertText,
    deleteText,
    updateCursor,
    debouncedUpdateCursor,
    undo,
    redo,
    editDuration,
  };
}