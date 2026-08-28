import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { 
  UserModel, 
  DocumentModel, 
  ChunkModel, 
  ConversationModel, 
  MessageModel, 
  FeedbackModel, 
  UnresolvedQueryModel, 
  SettingModel 
} from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'campus_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB Schema
const defaultDb = {
  users: [],
  documents: [],
  chunks: [],
  conversations: [],
  messages: [],
  feedback: [],
  unresolved_queries: [],
  settings: {
    topK: 4,
    similarityThreshold: 0.45,
    embeddingModel: 'text-embedding-004',
    generativeModel: 'gemini-1.5-flash',
    systemPrompt: `You are CampusAI, the official AI College Information Assistant. Answer the student's question accurately and helpfully based ONLY on the provided college document excerpts. Always mention the source document titles. If the information is not present in the excerpts, clearly state that the college documents do not contain this information.`
  }
};

class Database {
  constructor() {
    this.filePath = DB_FILE;
    this.data = this.loadLocal();
    this.isMongoConnected = false;
    this.mongoModels = {
      users: UserModel,
      documents: DocumentModel,
      chunks: ChunkModel,
      conversations: ConversationModel,
      messages: MessageModel,
      feedback: FeedbackModel,
      unresolved_queries: UnresolvedQueryModel,
      settings: SettingModel
    };
  }

  loadLocal() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultDb, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load database file, initializing schema:', err.message);
    }
    this.saveLocal(defaultDb);
    return JSON.parse(JSON.stringify(defaultDb));
  }

  saveLocal(dataToSave = this.data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Local database write error:', err.message);
    }
  }

  /**
   * Connect to MongoDB Atlas and synchronize data
   */
  async initMongoDB(rawUri = process.env.MONGODB_URI) {
    const uri = rawUri ? rawUri.trim() : '';

    if (!uri) {
      console.log('ℹ️  MongoDB URI not configured in .env. Running on local persistent JSON database.');
      return false;
    }

    if (uri.includes('<db_password>') || uri.includes('<password>') || uri.includes('your_mongodb_uri_here')) {
      console.log('⚠️  In backend/.env, please replace <db_password> with your actual MongoDB user password.');
      console.log('🔄 Running on local storage until password is provided.');
      return false;
    }

    try {
      console.log('🍃 Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        dbName: 'campus_ai',
        serverSelectionTimeoutMS: 8000
      });
      this.isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas Cloud Database successfully!');

      // Load Atlas collections or sync initial seed
      await this.syncWithMongo();
      return true;
    } catch (err) {
      console.error('⚠️ MongoDB Atlas Connection Error:', err.message);
      console.log('🔄 Falling back to local storage while Atlas is unavailable.');
      this.isMongoConnected = false;
      return false;
    }
  }

  /**
   * Sync collections between in-memory cache and MongoDB Atlas
   */
  async syncWithMongo() {
    if (!this.isMongoConnected) return;

    try {
      const [users, docs, chunks, convs, msgs, fb, unres, settingsDoc] = await Promise.all([
        UserModel.find({}).lean(),
        DocumentModel.find({}).lean(),
        ChunkModel.find({}).lean(),
        ConversationModel.find({}).lean(),
        MessageModel.find({}).lean(),
        FeedbackModel.find({}).lean(),
        UnresolvedQueryModel.find({}).lean(),
        SettingModel.findOne({ key: 'global_settings' }).lean()
      ]);

      // If Atlas already has data, populate into memory
      if (docs.length > 0 || users.length > 0) {
        this.data.users = users || [];
        this.data.documents = docs || [];
        this.data.chunks = chunks || [];
        this.data.conversations = convs || [];
        this.data.messages = msgs || [];
        this.data.feedback = fb || [];
        this.data.unresolved_queries = unres || [];
        if (settingsDoc) {
          this.data.settings = { ...this.data.settings, ...settingsDoc };
        }
        this.saveLocal();
        console.log(`📥 Loaded ${docs.length} documents and ${chunks.length} chunks from MongoDB Atlas.`);
      } else if (this.data.documents.length > 0) {
        // If Atlas is newly initialized, push local preloaded data into Atlas!
        console.log('📤 Migrating preloaded local knowledge base into MongoDB Atlas...');
        await this.pushAllToMongo();
        console.log('✅ MongoDB Atlas migration complete!');
      }
    } catch (err) {
      console.error('Error synchronizing with MongoDB Atlas:', err.message);
    }
  }

  async pushAllToMongo() {
    if (!this.isMongoConnected) return;
    try {
      if (this.data.users.length) await UserModel.insertMany(this.data.users, { ordered: false }).catch(() => {});
      if (this.data.documents.length) await DocumentModel.insertMany(this.data.documents, { ordered: false }).catch(() => {});
      if (this.data.chunks.length) await ChunkModel.insertMany(this.data.chunks, { ordered: false }).catch(() => {});
      if (this.data.conversations.length) await ConversationModel.insertMany(this.data.conversations, { ordered: false }).catch(() => {});
      if (this.data.messages.length) await MessageModel.insertMany(this.data.messages, { ordered: false }).catch(() => {});
      if (this.data.feedback.length) await FeedbackModel.insertMany(this.data.feedback, { ordered: false }).catch(() => {});
      if (this.data.unresolved_queries.length) await UnresolvedQueryModel.insertMany(this.data.unresolved_queries, { ordered: false }).catch(() => {});
      await SettingModel.findOneAndUpdate(
        { key: 'global_settings' },
        { ...this.data.settings, key: 'global_settings' },
        { upsert: true }
      ).catch(() => {});
    } catch (err) {
      console.error('Failed to push all records to MongoDB:', err.message);
    }
  }

  save() {
    this.saveLocal();
  }

  // Table accessors
  get users() { return this.data.users; }
  get documents() { return this.data.documents; }
  get chunks() { return this.data.chunks; }
  get conversations() { return this.data.conversations; }
  get messages() { return this.data.messages; }
  get feedback() { return this.data.feedback; }
  get unresolvedQueries() { return this.data.unresolved_queries; }
  get settings() { return this.data.settings; }

  // Query helpers
  find(table, predicate) {
    return (this.data[table] || []).filter(predicate);
  }

  findOne(table, predicate) {
    return (this.data[table] || []).find(predicate);
  }

  insert(table, item) {
    if (!this.data[table]) this.data[table] = [];
    this.data[table].push(item);
    this.saveLocal();

    // Async write to MongoDB Atlas
    if (this.isMongoConnected && this.mongoModels[table]) {
      this.mongoModels[table].create(item).catch(err => {
        console.warn(`MongoDB async insert warning (${table}):`, err.message);
      });
    }

    return item;
  }

  insertMany(table, items) {
    if (!this.data[table]) this.data[table] = [];
    this.data[table].push(...items);
    this.saveLocal();

    // Async write to MongoDB Atlas
    if (this.isMongoConnected && this.mongoModels[table] && items.length > 0) {
      this.mongoModels[table].insertMany(items, { ordered: false }).catch(err => {
        console.warn(`MongoDB async insertMany warning (${table}):`, err.message);
      });
    }

    return items;
  }

  update(table, predicate, updater) {
    let updatedCount = 0;
    const modifiedItems = [];

    (this.data[table] || []).forEach(item => {
      if (predicate(item)) {
        Object.assign(item, typeof updater === 'function' ? updater(item) : updater);
        modifiedItems.push(item);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      this.saveLocal();

      // Async update in MongoDB Atlas
      if (this.isMongoConnected && this.mongoModels[table]) {
        modifiedItems.forEach(item => {
          if (item.id) {
            this.mongoModels[table].findOneAndUpdate({ id: item.id }, item, { upsert: true }).catch(() => {});
          }
        });
      }
    }

    return updatedCount;
  }

  delete(table, predicate) {
    const toDelete = (this.data[table] || []).filter(predicate);
    const initialLen = (this.data[table] || []).length;
    this.data[table] = (this.data[table] || []).filter(item => !predicate(item));
    const deletedCount = initialLen - this.data[table].length;

    if (deletedCount > 0) {
      this.saveLocal();

      // Async delete from MongoDB Atlas
      if (this.isMongoConnected && this.mongoModels[table]) {
        toDelete.forEach(item => {
          if (item.id) {
            this.mongoModels[table].deleteOne({ id: item.id }).catch(() => {});
          } else if (item.docId && table === 'chunks') {
            this.mongoModels[table].deleteMany({ docId: item.docId }).catch(() => {});
          }
        });
      }
    }

    return deletedCount;
  }
}

export const db = new Database();
