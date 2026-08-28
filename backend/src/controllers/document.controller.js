import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { extractDocumentText } from '../services/extractor.service.js';
import { chunkText } from '../services/chunker.service.js';
import { vectorStore } from '../services/vectorStore.service.js';
import { ragService } from '../services/rag.service.js';

export const documentController = {
  /**
   * Upload, parse, chunk, and index a document (PDF, TXT, MD)
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No document file uploaded' });
      }

      const { title, category = 'General', department = 'All' } = req.body;
      const file = req.file;
      const docId = uuidv4();
      const docTitle = title || file.originalname.replace(/\.[^/.]+$/, "");

      // 1. Extract text from uploaded document
      const { text, numPages, metadata } = await extractDocumentText(file.path, file.originalname, file.mimetype);

      if (!text || text.trim().length === 0) {
        // Remove empty file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ success: false, message: 'Uploaded document contains no readable text content' });
      }

      // 2. Split document into overlapping chunks
      const chunks = chunkText(text, {
        docId,
        title: docTitle,
        category,
        department
      }, 250, 50);

      // 3. Index chunks into vector database with embeddings
      await vectorStore.indexChunks(chunks);

      // 4. Save document record in DB
      const documentRecord = {
        id: docId,
        title: docTitle,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        fileSize: file.size,
        numPages,
        chunkCount: chunks.length,
        category,
        department,
        status: 'Indexed',
        uploadedBy: req.user ? req.user.name : 'Administrator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.insert('documents', documentRecord);

      return res.status(201).json({
        success: true,
        message: `Successfully processed and indexed "${docTitle}" into ${chunks.length} semantic chunks`,
        document: documentRecord
      });
    } catch (err) {
      console.error('Document upload error:', err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ success: false, message: `Failed to process document: ${err.message}` });
    }
  },

  /**
   * List all documents
   */
  async getAllDocuments(req, res) {
    try {
      const documents = db.documents || [];
      return res.json({
        success: true,
        total: documents.length,
        totalChunks: vectorStore.getTotalChunkCount(),
        documents
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error fetching documents' });
    }
  },

  /**
   * Get all chunks for a specific document (RAG inspection)
   */
  async getDocumentChunks(req, res) {
    try {
      const { id } = req.params;
      const document = db.findOne('documents', d => d.id === id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      const chunks = vectorStore.getChunksByDocId(id);
      return res.json({
        success: true,
        document,
        chunks
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error fetching document chunks' });
    }
  },

  /**
   * Delete a document and purge all associated vector chunks
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const document = db.findOne('documents', d => d.id === id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      // Purge vectors
      vectorStore.deleteByDocId(id);

      // Remove record
      db.delete('documents', d => d.id === id);

      // Remove physical file
      if (document.path && fs.existsSync(document.path)) {
        try {
          fs.unlinkSync(document.path);
        } catch (e) {
          console.warn('Could not remove file on disk:', e.message);
        }
      }

      return res.json({
        success: true,
        message: `Document "${document.title}" and its vector indices have been deleted`
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error deleting document' });
    }
  },

  /**
   * Auto-summarize an uploaded document
   */
  async summarizeDocument(req, res) {
    try {
      const { id } = req.params;
      const document = db.findOne('documents', d => d.id === id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      const chunks = vectorStore.getChunksByDocId(id);
      const combinedText = chunks.map(c => c.content).join('\n\n');

      const summary = await ragService.summarizeDocument(document.title, combinedText);
      db.update('documents', d => d.id === id, { summary });

      return res.json({
        success: true,
        summary
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error generating summary' });
    }
  },

  /**
   * Auto-generate student FAQs from document
   */
  async generateDocumentFAQs(req, res) {
    try {
      const { id } = req.params;
      const document = db.findOne('documents', d => d.id === id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      const chunks = vectorStore.getChunksByDocId(id);
      const combinedText = chunks.map(c => c.content).join('\n\n');

      const faqs = await ragService.generateDocumentFAQs(document.title, combinedText);
      db.update('documents', d => d.id === id, { faqs });

      return res.json({
        success: true,
        faqs
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error generating FAQs' });
    }
  },

  /**
   * Compare two institutional documents (Policy Diffing)
   */
  async compareDocuments(req, res) {
    try {
      const { docId1, docId2 } = req.body;
      if (!docId1 || !docId2) {
        return res.status(400).json({ success: false, message: 'docId1 and docId2 are required' });
      }

      const doc1 = db.findOne('documents', d => d.id === docId1);
      const doc2 = db.findOne('documents', d => d.id === docId2);

      if (!doc1 || !doc2) {
        return res.status(404).json({ success: false, message: 'One or both documents not found' });
      }

      const comparison = await ragService.compareDocuments(doc1, doc2);

      return res.json({
        success: true,
        doc1: { id: doc1.id, title: doc1.title, category: doc1.category },
        doc2: { id: doc2.id, title: doc2.title, category: doc2.category },
        comparison
      });
    } catch (err) {
      console.error('Document comparison error:', err);
      return res.status(500).json({ success: false, message: 'Error comparing documents' });
    }
  }
};
