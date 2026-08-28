import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { ragService } from '../services/rag.service.js';

export const chatController = {
  /**
   * Main RAG Query API endpoint
   */
  async askQuestion(req, res) {
    try {
      const { question, conversationId, category = 'All', department = 'All' } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Question text is required' });
      }

      const userId = req.user ? req.user.id : 'guest';
      let activeConvId = conversationId;

      // Create conversation if none provided
      if (!activeConvId) {
        activeConvId = uuidv4();
        db.insert('conversations', {
          id: activeConvId,
          userId,
          title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
          category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Fetch recent conversation history context
      const prevMessages = db.find('messages', m => m.conversationId === activeConvId);

      // Save user question message
      const userMessage = {
        id: uuidv4(),
        conversationId: activeConvId,
        role: 'user',
        content: question.trim(),
        createdAt: new Date().toISOString()
      };
      db.insert('messages', userMessage);

      // Execute RAG Pipeline
      const ragResult = await ragService.executeRAG(question.trim(), {
        category,
        department,
        conversationHistory: prevMessages
      });

      // Save assistant response message
      const assistantMessage = {
        id: uuidv4(),
        conversationId: activeConvId,
        role: 'assistant',
        content: ragResult.answer,
        sources: ragResult.sources,
        confidenceScore: ragResult.confidenceScore,
        unknownFlag: ragResult.unknownFlag,
        metrics: ragResult.metrics,
        category,
        createdAt: new Date().toISOString()
      };
      db.insert('messages', assistantMessage);

      // Update conversation timestamp
      db.update('conversations', c => c.id === activeConvId, {
        updatedAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        conversationId: activeConvId,
        message: assistantMessage
      });
    } catch (err) {
      console.error('Chat query error:', err);
      return res.status(500).json({ success: false, message: `Error answering query: ${err.message}` });
    }
  },

  /**
   * Server-Sent Events (SSE) streaming RAG Query endpoint
   */
  async streamQuestion(req, res) {
    try {
      const { question, conversationId, category = 'All', department = 'All' } = req.body;

      if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const userId = req.user ? req.user.id : 'guest';
      let activeConvId = conversationId || uuidv4();

      if (!conversationId) {
        db.insert('conversations', {
          id: activeConvId,
          userId,
          title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
          category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Save user message
      const userMessage = {
        id: uuidv4(),
        conversationId: activeConvId,
        role: 'user',
        content: question.trim(),
        createdAt: new Date().toISOString()
      };
      db.insert('messages', userMessage);

      // RAG execution
      const ragResult = await ragService.executeRAG(question.trim(), {
        category,
        department
      });

      // Stream tokens with simulated natural rhythm
      const fullAnswer = ragResult.answer;
      const tokens = fullAnswer.split(/(?<=\s+)/);

      for (let i = 0; i < tokens.length; i++) {
        res.write(`data: ${JSON.stringify({ type: 'token', token: tokens[i] })}\n\n`);
        // Small delay for typing visual
        await new Promise(r => setTimeout(r, 20));
      }

      // Save assistant message
      const assistantMessage = {
        id: uuidv4(),
        conversationId: activeConvId,
        role: 'assistant',
        content: ragResult.answer,
        sources: ragResult.sources,
        confidenceScore: ragResult.confidenceScore,
        unknownFlag: ragResult.unknownFlag,
        metrics: ragResult.metrics,
        category,
        createdAt: new Date().toISOString()
      };
      db.insert('messages', assistantMessage);

      // Send final completion event with sources and confidence
      res.write(`data: ${JSON.stringify({
        type: 'done',
        message: assistantMessage,
        conversationId: activeConvId
      })}\n\n`);

      res.end();
    } catch (err) {
      console.error('Streaming error:', err);
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    }
  },

  /**
   * Get all conversations for current user
   */
  async getConversations(req, res) {
    try {
      const userId = req.user ? req.user.id : 'guest';
      const convs = db.find('conversations', c => c.userId === userId || userId === 'admin');
      convs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return res.json({
        success: true,
        conversations: convs
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error fetching conversations' });
    }
  },

  /**
   * Get message history for a specific conversation
   */
  async getConversationMessages(req, res) {
    try {
      const { id } = req.params;
      const messages = db.find('messages', m => m.conversationId === id);
      messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      // Attach any feedback submitted
      const messagesWithFeedback = messages.map(msg => {
        const feedback = db.findOne('feedback', f => f.messageId === msg.id);
        return {
          ...msg,
          feedback: feedback ? { rating: feedback.rating, reason: feedback.reason } : null
        };
      });

      return res.json({
        success: true,
        conversationId: id,
        messages: messagesWithFeedback
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
  },

  /**
   * Delete a conversation and its messages
   */
  async deleteConversation(req, res) {
    try {
      const { id } = req.params;
      db.delete('conversations', c => c.id === id);
      db.delete('messages', m => m.conversationId === id);

      return res.json({
        success: true,
        message: 'Conversation deleted'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error deleting conversation' });
    }
  },

  /**
   * Submit thumbs up / thumbs down feedback on an answer
   */
  async submitFeedback(req, res) {
    try {
      const { messageId, conversationId, rating, reason = '', comment = '' } = req.body;

      if (!messageId || !rating) {
        return res.status(400).json({ success: false, message: 'Message ID and rating are required' });
      }

      // Check if feedback already exists
      const existing = db.findOne('feedback', f => f.messageId === messageId);
      if (existing) {
        db.update('feedback', f => f.messageId === messageId, {
          rating: rating === 1 || rating === -1 ? rating : 1,
          reason,
          comment,
          updatedAt: new Date().toISOString()
        });
      } else {
        db.insert('feedback', {
          id: uuidv4(),
          messageId,
          conversationId,
          userId: req.user ? req.user.id : 'guest',
          rating: rating === 1 || rating === -1 ? rating : 1,
          reason,
          comment,
          createdAt: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        message: 'Feedback recorded successfully'
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error saving feedback' });
    }
  }
};
