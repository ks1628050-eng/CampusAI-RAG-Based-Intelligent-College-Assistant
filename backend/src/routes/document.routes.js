import express from 'express';
import { documentController } from '../controllers/document.controller.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public / Student: list documents and view chunks
router.get('/', optionalAuth, documentController.getAllDocuments);
router.get('/:id/chunks', optionalAuth, documentController.getDocumentChunks);

// Admin: Upload, delete, summarize, generate FAQs
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), documentController.uploadDocument);
router.delete('/:id', authenticateToken, requireAdmin, documentController.deleteDocument);
router.post('/:id/summarize', authenticateToken, requireAdmin, documentController.summarizeDocument);
router.post('/:id/generate-faqs', authenticateToken, requireAdmin, documentController.generateDocumentFAQs);
router.post('/compare', optionalAuth, documentController.compareDocuments);

export default router;
