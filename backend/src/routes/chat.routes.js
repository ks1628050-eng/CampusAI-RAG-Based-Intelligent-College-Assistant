import express from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Main RAG question query
router.post('/query', optionalAuth, chatController.askQuestion);
router.post('/stream', optionalAuth, chatController.streamQuestion);

// Conversations management
router.get('/conversations', optionalAuth, chatController.getConversations);
router.get('/conversations/:id', optionalAuth, chatController.getConversationMessages);
router.delete('/conversations/:id', optionalAuth, chatController.deleteConversation);

// Answer feedback
router.post('/feedback', optionalAuth, chatController.submitFeedback);

export default router;
