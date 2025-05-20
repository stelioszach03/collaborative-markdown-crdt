import express from 'express';
import * as documentController from '../controllers/documentController.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Document CRUD routes
router.get('/documents', documentController.getAllDocuments);
router.post('/documents', documentController.createDocument);
router.get('/documents/:id', documentController.getDocumentById);
router.patch('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

// Analytics routes
router.get('/documents/:id/history', analyticsController.getEditHistory);
router.get('/documents/:id/collaboration', analyticsController.getCollaborationStats);
router.get('/documents/:id/analytics', analyticsController.getDocumentAnalytics);
router.get('/documents/:id/active-users', analyticsController.getActiveUsers);

export default router;