/**
 * Utility functions for CRDT operations
 */

// Debounce function for rate-limiting operations
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Calculate position in the document from an index
export function indexToPosition(text, index) {
  if (!text || index === 0) {
    return { line: 0, ch: 0 };
  }

  const lines = text.slice(0, index).split('\n');
  return {
    line: lines.length - 1,
    ch: lines[lines.length - 1].length,
  };
}

// Calculate index from line and column position
export function positionToIndex(text, position) {
  if (!text || (position.line === 0 && position.ch === 0)) {
    return 0;
  }

  const lines = text.split('\n');
  let index = 0;
  
  for (let i = 0; i < position.line; i++) {
    index += lines[i].length + 1; // +1 for the newline character
  }
  
  return index + Math.min(position.ch, lines[position.line]?.length || 0);
}

// Get a relative position for displaying a cursor
export function getCursorCoordinates(element, position) {
  if (!element) return { top: 0, left: 0 };
  
  const lineHeight = 20; // Default line height in pixels
  const charWidth = 8; // Average character width in pixels
  
  // Calculate top position based on line number
  const top = position.line * lineHeight + 16; // 16px padding
  
  // Calculate left position based on character position
  const left = position.ch * charWidth + (element.offsetLeft || 0);
  
  return { top, left };
}

// Convert awareness states to a format suitable for visualization
export function awarenessStatesToArray(awarenessStates) {
  const result = [];
  
  awarenessStates.forEach((state, clientId) => {
    if (state.userId) {
      result.push({
        clientId,
        userId: state.userId,
        username: state.username || 'Anonymous',
        color: state.color || '#cccccc',
        cursor: state.cursor,
        selection: state.selection,
      });
    }
  });
  
  return result;
}

// Extract statistics from the document update history
export function extractHistoryStats(updates) {
  if (!updates || updates.length === 0) {
    return { 
      totalEdits: 0,
      editsByUser: {},
      editsOverTime: [],
      avgEditSize: 0
    };
  }
  
  const result = {
    totalEdits: updates.length,
    editsByUser: {},
    editsOverTime: [],
    avgEditSize: 0,
  };
  
  // Group by hour
  const hourBuckets = {};
  let totalChangeSize = 0;
  
  updates.forEach(update => {
    // Count edits by user
    if (!result.editsByUser[update.userId]) {
      result.editsByUser[update.userId] = 0;
    }
    result.editsByUser[update.userId]++;
    
    // Track changes over time
    const date = new Date(update.timestamp);
    const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    
    if (!hourBuckets[hourKey]) {
      hourBuckets[hourKey] = { 
        time: date.getTime(), 
        count: 0 
      };
    }
    
    hourBuckets[hourKey].count++;
    
    // Calculate change size
    totalChangeSize += update.changeSize || 0;
  });
  
  // Convert hour buckets to array
  result.editsOverTime = Object.values(hourBuckets).sort((a, b) => a.time - b.time);
  
  // Calculate average edit size
  result.avgEditSize = totalChangeSize / updates.length;
  
  return result;
}

// Calculate diff between two texts
export function calculateDiff(oldText, newText) {
  if (oldText === newText) return { insertions: [], deletions: [] };
  
  // Find common prefix
  let i = 0;
  while (i < oldText.length && i < newText.length && oldText[i] === newText[i]) {
    i++;
  }
  const commonPrefixLength = i;
  
  // Find common suffix
  let oldIndex = oldText.length - 1;
  let newIndex = newText.length - 1;
  while (oldIndex >= commonPrefixLength && newIndex >= commonPrefixLength && 
         oldText[oldIndex] === newText[newIndex]) {
    oldIndex--;
    newIndex--;
  }
  
  const commonSuffixLength = oldText.length - oldIndex - 1;
  
  // Calculate differences
  const deletions = oldText.length - commonPrefixLength - commonSuffixLength;
  const insertedText = newText.substring(commonPrefixLength, newText.length - commonSuffixLength);
  
  return {
    insertions: insertedText ? [{ index: commonPrefixLength, text: insertedText }] : [],
    deletions: deletions > 0 ? [{ index: commonPrefixLength, length: deletions }] : []
  };
}