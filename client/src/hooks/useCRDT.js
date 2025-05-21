import { useCallback, useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { debounce } from '../utils/crdt';
import { useDocument } from '../context/DocumentContext';

export function useCRDT(docId) {
  const { 
    ydoc, 
    provider, 
    awareness, 
    userId, 
    username, 
    userColor,
    connectToDocument 
  } = useDocument();
  
  const [ytext, setYtext] = useState(null);
  const [connected, setConnected] = useState(false);
  const [awarenessStates, setAwarenessStates] = useState(new Map());
  const [undoManager, setUndoManager] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [editDuration, setEditDuration] = useState(0);
  
  // Keep references to prevent recreating functions on rerender
  const undoManagerRef = useRef(null);
  const ytextRef = useRef(null);

  // Connect to document when docId changes
  useEffect(() => {
    if (!docId) return;
    
    try {
      const { ytext: newYtext, provider: newProvider } = connectToDocument(docId);
      
      if (!newYtext || !newProvider) {
        console.error("Failed to connect to document");
        return;
      }
      
      setYtext(newYtext);
      ytextRef.current = newYtext;
      setConnected(newProvider.wsconnected);
      
      // Create undo manager
      const newUndoManager = new Y.UndoManager(newYtext);
      setUndoManager(newUndoManager);
      undoManagerRef.current = newUndoManager;
      
      return () => {
        if (undoManagerRef.current) {
          undoManagerRef.current.destroy();
          undoManagerRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error in CRDT connection:', err);
    }
  }, [docId, connectToDocument]);

  // Update connection status when provider changes
  useEffect(() => {
    if (!provider) return;
    
    const handleStatus = ({ status }) => {
      setConnected(status === 'connected');
    };
    
    provider.on('status', handleStatus);
    setConnected(provider.wsconnected);
    
    return () => {
      provider.off('status', handleStatus);
    };
  }, [provider]);

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

  // Debounced cursor update to reduce network traffic
  const debouncedUpdateCursor = useCallback(
    debounce(updateCursor, 50),
    [updateCursor]
  );

  // Insert text with metadata
  const insertText = useCallback((index, text) => {
    if (!ytextRef.current) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      color: userColor,
      changeSize: text.length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now,
      lastUpdate: now
    };
    
    ytextRef.current.insert(index, text, origin);
  }, [userId, username, userColor, lastEditTime]);

  // Delete text with metadata
  const deleteText = useCallback((index, length) => {
    if (!ytextRef.current) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      color: userColor,
      changeSize: -length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now,
      lastUpdate: now
    };
    
    ytextRef.current.delete(index, length, origin);
  }, [userId, username, userColor, lastEditTime]);

  // Undo with metadata
  const undo = useCallback(() => {
    if (!undoManagerRef.current) return;
    
    const origin = {
      userId,
      username,
      color: userColor,
      isRevision: true,
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };
    
    undoManagerRef.current.undo(origin);
  }, [userId, username, userColor]);

  // Redo with metadata
  const redo = useCallback(() => {
    if (!undoManagerRef.current) return;
    
    const origin = {
      userId,
      username,
      color: userColor,
      isRevision: true,
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };
    
    undoManagerRef.current.redo(origin);
  }, [userId, username, userColor]);

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