import * as Y from 'yjs';

/**
 * Create a new Yjs document
 * @returns {Y.Doc} A new Yjs document
 */
export const createYDoc = () => {
  return new Y.Doc();
};

/**
 * Get a Y.Text instance from a Y.Doc
 * @param {Y.Doc} ydoc - The Yjs document
 * @param {string} name - The name of the text (default: 'content')
 * @returns {Y.Text} The Y.Text instance
 */
export const getYText = (ydoc, name = 'content') => {
  return ydoc.getText(name);
};

/**
 * Apply an update to a Y.Doc
 * @param {Y.Doc} ydoc - The Yjs document
 * @param {Uint8Array} update - The update to apply
 */
export const applyUpdate = (ydoc, update) => {
  Y.applyUpdate(ydoc, update);
};

/**
 * Encode a Y.Doc state as an update
 * @param {Y.Doc} ydoc - The Yjs document
 * @returns {Uint8Array} The encoded update
 */
export const encodeStateAsUpdate = (ydoc) => {
  return Y.encodeStateAsUpdate(ydoc);
};

/**
 * Create a UndoManager for a Y.Text
 * @param {Y.Text} ytext - The Y.Text instance
 * @param {Object} options - Options for the UndoManager
 * @returns {Y.UndoManager} The UndoManager
 */
export const createUndoManager = (ytext, options = {}) => {
  return new Y.UndoManager(ytext, options);
};

/**
 * Merge multiple updates into a single update
 * @param {Array<Uint8Array>} updates - The updates to merge
 * @returns {Uint8Array} The merged update
 */
export const mergeUpdates = (updates) => {
  return Y.mergeUpdates(updates);
};

/**
 * Convert a Yjs delta to plain text
 * @param {Array} delta - The Yjs delta
 * @returns {string} The plain text
 */
export const deltaToPlainText = (delta) => {
  let text = '';
  delta.forEach(op => {
    if (op.insert) {
      text += op.insert;
    }
  });
  return text;
};

/**
 * Extract statistics from a text
 * @param {string} text - The text to analyze
 * @returns {Object} The statistics
 */
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