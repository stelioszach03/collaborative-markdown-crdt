import {
  getEditHistory,
  getCollaborationStats,
  getDocumentAnalytics,
  getActiveUsers,
} from '../socket/socketHandler.js';

// Get edit history for a document
export const getEditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;
    
    const history = await getEditHistory(id, period);
    
    res.json(history);
  } catch (err) {
    console.error(`Error fetching edit history: ${err.message}`);
    res.status(500).json({ message: 'Error fetching edit history' });
  }
};

// Get collaboration stats for a document
export const getCollaborationStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await getCollaborationStats(id);
    
    res.json(stats);
  } catch (err) {
    console.error(`Error fetching collaboration stats: ${err.message}`);
    res.status(500).json({ message: 'Error fetching collaboration stats' });
  }
};

// Get document analytics
export const getDocumentAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = await getDocumentAnalytics(id);
    
    res.json(analytics);
  } catch (err) {
    console.error(`Error fetching document analytics: ${err.message}`);
    res.status(500).json({ message: 'Error fetching document analytics' });
  }
};

// Get active users for a document
export const getActiveUsers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await getActiveUsers(id);
    
    res.json(users);
  } catch (err) {
    console.error(`Error fetching active users: ${err.message}`);
    res.status(500).json({ message: 'Error fetching active users' });
  }
};