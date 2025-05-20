import * as Y from 'yjs';

// Create a new Y.Doc
export const createYDoc = () => {
  return new Y.Doc();
};

// Get the text from a Y.Doc
export const getYText = (ydoc, name = 'content') => {
  return ydoc.getText(name);
};

// Apply an update to a Y.Doc
export const applyUpdate = (ydoc, update) => {
  Y.applyUpdate(ydoc, update);
};

// Encode state as an update message that can be sent to other peers
export const encodeStateAsUpdate = (ydoc) => {
  return Y.encodeStateAsUpdate(ydoc);
};

// Create a Y.UndoManager for a type
export const createUndoManager = (ytext, options = {}) => {
  return new Y.UndoManager(ytext, options);
};

// Helper function to merge document updates from multiple sources
export const mergeUpdates = (updates) => {
  return Y.mergeUpdates(updates);
};

// Convert Yjs delta to plain text
export const deltaToPlainText = (delta) => {
  let text = '';
  
  delta.forEach(op => {
    if (op.insert) {
      text += op.insert;
    }
  });
  
  return text;
};

// Extract document statistics
export const extractDocStats = (text) => {
  if (!text) {
    return {
      chars: 0,
      words: 0,
      lines: 0,
      headings: 0,
      lists: 0,
      codeBlocks: 0
    };
  }
  
  const lines = text.split('\n');
  const words = text.split(/\s+/).filter(Boolean).length;
  const headings = (text.match(/^#+\s+/gm) || []).length;
  const lists = (text.match(/^[\s]*[-*+]\s+/gm) || []).length + 
                (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  
  return {
    chars: text.length,
    words,
    lines: lines.length,
    headings,
    lists,
    codeBlocks
  };
};