import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    databaseType: db.isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Local Persistent Store',
    mongoConnected: db.isMongoConnected,
    vectorStoreChunks: (db.chunks || []).length,
    documentsCount: (db.documents || []).length,
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({
    name: 'CampusAI - RAG College Chatbot API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: ['/api/auth', '/api/documents', '/api/chat', '/api/analytics']
  });
});

// Serve frontend production build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize and auto-seed if clean database
async function startServer() {
  // Connect to MongoDB Atlas if MONGODB_URI is provided
  await db.initMongoDB();

  if (!db.documents || db.documents.length === 0) {
    console.log('Database empty on first boot. Seeding preloaded college documents...');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🎓 CampusAI RAG Backend running on http://localhost:${PORT}`);
    console.log(`🗄️  Database Engine: ${db.isMongoConnected ? '🍃 MongoDB Atlas (Cloud)' : '📁 Local Persistent Store'}`);
    console.log(`📊 Vector DB chunks indexed: ${(db.chunks || []).length}`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
