import mongoose from 'mongoose';

// 1. User Schema
export const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

// 2. Document Schema
export const DocumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  department: { type: String, default: 'All' },
  filePath: String,
  fileType: String,
  chunkCount: { type: Number, default: 0 },
  status: { type: String, default: 'Indexed' },
  summary: String,
  faqs: Array,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'documents' });

// 3. Vector Chunk Schema
export const ChunkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  docId: { type: String, required: true, index: true },
  docTitle: String,
  category: String,
  department: String,
  chunkIndex: Number,
  pageNumber: Number,
  content: String,
  tokenCount: Number,
  embedding: [Number]
}, { collection: 'chunks' });

// 4. Conversation Schema
export const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: String,
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'conversations' });

// 5. Message Schema
export const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conversationId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  category: String,
  confidenceScore: Number,
  sources: Array,
  feedback: Object,
  unknownFlag: Boolean,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'messages' });

// 6. Feedback Schema
export const FeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  messageId: { type: String, required: true },
  rating: { type: Number, required: true },
  reason: String,
  timestamp: { type: Date, default: Date.now }
}, { collection: 'feedback' });

// 7. Unresolved Query Schema
export const UnresolvedQuerySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  query: { type: String, required: true },
  category: String,
  confidenceScore: Number,
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  resolutionNote: String,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'unresolved_queries' });

// 8. Settings Schema
export const SettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  topK: { type: Number, default: 4 },
  similarityThreshold: { type: Number, default: 0.45 },
  embeddingModel: { type: String, default: 'text-embedding-004' },
  generativeModel: { type: String, default: 'gemini-1.5-flash' },
  systemPrompt: { type: String, default: 'You are CampusAI, the official AI College Information Assistant.' }
}, { collection: 'settings' });

export const UserModel = mongoose.model('User', UserSchema);
export const DocumentModel = mongoose.model('Document', DocumentSchema);
export const ChunkModel = mongoose.model('Chunk', ChunkSchema);
export const ConversationModel = mongoose.model('Conversation', ConversationSchema);
export const MessageModel = mongoose.model('Message', MessageSchema);
export const FeedbackModel = mongoose.model('Feedback', FeedbackSchema);
export const UnresolvedQueryModel = mongoose.model('UnresolvedQuery', UnresolvedQuerySchema);
export const SettingModel = mongoose.model('Setting', SettingSchema);
