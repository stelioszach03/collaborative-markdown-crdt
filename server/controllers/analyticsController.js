import * as Y from 'yjs';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPDATES_DIR = path.join(__dirname, '..', 'documents', 'updates');

// Get edit history for a document
export const getEditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;
    
    // Implementation based on reading update files
    const updatesDir = path.join(UPDATES_DIR, id);
    const now = new Date();
    let cutoff;
    
    // Determine time period cutoff
    switch (period) {
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Read update files
    try {
      const files = await fs.readdir(updatesDir);
      const updates = [];
      
      for (const file of files) {
        if (file.endsWith('.update')) {
          // Extract timestamp from filename (e.g., 1621234567890.update)
          const timestamp = parseInt(file.split('.')[0]);
          const updateTime = new Date(timestamp);
          
          if (updateTime >= cutoff) {
            const metaPath = path.join(updatesDir, file.replace('.update', '.meta.json'));
            try {
              const metaData = await fs.readFile(metaPath, 'utf8');
              const metadata = JSON.parse(metaData);
              updates.push({
                timestamp: updateTime,
                formattedTime: formatTime(updateTime, period),
                ...metadata
              });
            } catch (err) {
              // If metadata doesn't exist, add minimal info
              updates.push({
                timestamp: updateTime,
                formattedTime: formatTime(updateTime, period),
                userId: 'unknown',
                changeSize: 0
              });
            }
          }
        }
      }
      
      // Process updates for chart format
      const result = processUpdateHistory(updates, period);
      res.json(result);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Directory doesn't exist, return empty array
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(`Error fetching edit history: ${err.message}`);
    res.status(500).json({ message: 'Error fetching edit history' });
  }
};

// Helper function to format time
function formatTime(date, period) {
  if (period === '24h') {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

// Helper function to process updates for chart
function processUpdateHistory(updates, period) {
  // Group updates by time period
  const groupedUpdates = new Map();
  
  for (const update of updates) {
    const key = update.formattedTime;
    
    if (!groupedUpdates.has(key)) {
      groupedUpdates.set(key, {
        timestamp: update.timestamp,
        formattedTime: key,
        edits: 0,
        characters: 0
      });
    }
    
    const group = groupedUpdates.get(key);
    group.edits += 1;
    group.characters += update.changeSize || 0;
  }
  
  // Convert to array and sort by timestamp
  const result = Array.from(groupedUpdates.values());
  result.sort((a, b) => a.timestamp - b.timestamp);
  
  return result;
}

// Get collaboration stats for a document
export const getCollaborationStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatesDir = path.join(UPDATES_DIR, id);
    
    try {
      const files = await fs.readdir(updatesDir);
      const userStats = new Map();
      
      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          try {
            const metaPath = path.join(updatesDir, file);
            const data = await fs.readFile(metaPath, 'utf8');
            const metadata = JSON.parse(data);
            
            if (!userStats.has(metadata.userId)) {
              userStats.set(metadata.userId, {
                userId: metadata.userId,
                username: metadata.username || 'Unknown User',
                color: metadata.color || '#cccccc',
                edits: 0
              });
            }
            
            const stats = userStats.get(metadata.userId);
            stats.edits += 1;
          } catch (err) {
            console.error(`Error processing metadata file: ${err.message}`);
          }
        }
      }
      
      res.json(Array.from(userStats.values()));
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Directory doesn't exist, return empty array
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(`Error fetching collaboration stats: ${err.message}`);
    res.status(500).json({ message: 'Error fetching collaboration stats' });
  }
};

// Get document analytics
export const getDocumentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create a new Y.Doc to load document state
    const doc = new Y.Doc();
    const text = doc.getText('content');
    
    // Try to load document updates
    const updatesDir = path.join(UPDATES_DIR, id);
    
    try {
      const files = await fs.readdir(updatesDir);
      const updateFiles = files.filter(f => f.endsWith('.update'));
      const metaFiles = files.filter(f => f.endsWith('.meta.json'));
      
      // Apply updates to the doc to get current state
      for (const file of updateFiles) {
        const updatePath = path.join(updatesDir, file);
        const update = await fs.readFile(updatePath);
        Y.applyUpdate(doc, update);
      }
      
      // Extract document text
      const docText = text.toString();
      
      // Calculate stats
      const totalEdits = metaFiles.length;
      const collaborators = new Set();
      let timeSpent = 0;
      let revisions = 0;
      
      // Calculate stats from metadata
      for (const file of metaFiles) {
        try {
          const metaPath = path.join(updatesDir, file);
          const data = await fs.readFile(metaPath, 'utf8');
          const metadata = JSON.parse(data);
          
          if (metadata.userId) {
            collaborators.add(metadata.userId);
          }
          
          timeSpent += metadata.duration || 0;
          
          if (metadata.isRevision) {
            revisions += 1;
          }
        } catch (err) {
          console.error(`Error processing metadata: ${err.message}`);
        }
      }
      
      // Calculate trends (compare with previous period)
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEdits = metaFiles.filter(file => {
        const timestamp = parseInt(file.split('.')[0]);
        return timestamp > dayAgo.getTime();
      }).length;
      
      const olderEdits = metaFiles.filter(file => {
        const timestamp = parseInt(file.split('.')[0]);
        return timestamp <= dayAgo.getTime() && timestamp > dayAgo.getTime() - 24 * 60 * 60 * 1000;
      }).length;
      
      const editsTrend = olderEdits === 0 ? 0 : Math.round(((recentEdits - olderEdits) / olderEdits) * 100);
      
      // Document content stats
      const wordCount = docText.split(/\s+/).filter(Boolean).length;
      const characterCount = docText.length;
      const headingCount = (docText.match(/^#+\s+/gm) || []).length;
      const listItemCount = (docText.match(/^[\s]*[-*+]\s+/gm) || []).length + (docText.match(/^[\s]*\d+\.\s+/gm) || []).length;
      
      res.json({
        totalEdits,
        editsTrend,
        collaborators: collaborators.size,
        collaboratorsTrend: 0, // Calculate if needed
        timeSpent: Math.round(timeSpent / 60), // Convert to minutes
        timeSpentTrend: 0, // Calculate if needed
        revisions,
        revisionsTrend: 0, // Calculate if needed
        lastSaved: new Date(),
        wordCount,
        characterCount,
        headingCount,
        listItemCount
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Directory doesn't exist, return default stats
        res.json({
          totalEdits: 0,
          editsTrend: 0,
          collaborators: 0,
          collaboratorsTrend: 0,
          timeSpent: 0,
          timeSpentTrend: 0,
          revisions: 0,
          revisionsTrend: 0,
          lastSaved: new Date(),
          wordCount: 0,
          characterCount: 0,
          headingCount: 0,
          listItemCount: 0
        });
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(`Error fetching document analytics: ${err.message}`);
    res.status(500).json({ message: 'Error fetching document analytics' });
  }
};

// Get active users for a document
export const getActiveUsers = async (req, res) => {
  // Without direct access to the y-websocket awareness states, we return an empty array
  // In a real implementation, you would need to track connections somewhere
  res.json([]);
};