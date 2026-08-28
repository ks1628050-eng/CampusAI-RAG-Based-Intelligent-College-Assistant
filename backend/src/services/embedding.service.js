import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Vector dimension for fallback local semantic dense vectors
const EMBEDDING_DIM = 256;

/**
 * Calculates dot product of two vectors
 */
export function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] || 0) * (b[i] || 0);
  }
  return sum;
}

/**
 * Calculates cosine similarity between two numerical vectors
 * Result ranges from -1.0 to 1.0 (clamped to 0.0 to 1.0 for normalized text vectors)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const valA = vecA[i] || 0;
    const valB = vecB[i] || 0;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

/**
 * Built-in zero-dependency deterministic dense semantic vectorizer.
 * Generates an L2-normalized dense embedding vector based on term frequencies,
 * subword n-grams, and semantic positional weights.
 */
export function generateLocalSemanticEmbedding(text) {
  const vector = new Float32Array(EMBEDDING_DIM);
  if (!text || typeof text !== 'string') return Array.from(vector);

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(t => t.length > 0);

  if (tokens.length === 0) return Array.from(vector);

  tokens.forEach((token, pos) => {
    // Hash token to primary vector indices
    let h1 = 5381;
    let h2 = 0;
    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i);
      h1 = ((h1 << 5) + h1) ^ charCode;
      h2 = ((h2 << 7) - h2) + charCode;
    }

    const idx1 = Math.abs(h1) % EMBEDDING_DIM;
    const idx2 = Math.abs(h2) % EMBEDDING_DIM;
    const idx3 = Math.abs((h1 ^ h2)) % EMBEDDING_DIM;

    // Term significance weight (longer words and early topic words get slightly higher weight)
    const lengthWeight = Math.min(2.0, Math.log2(token.length + 1));
    const posWeight = 1.0 / (1.0 + 0.001 * pos);
    const weight = lengthWeight * posWeight;

    vector[idx1] += weight;
    vector[idx2] += weight * 0.7;
    vector[idx3] += weight * 0.5;

    // Character 3-grams for morphological similarity
    if (token.length >= 3) {
      for (let i = 0; i <= token.length - 3; i++) {
        const tri = token.substring(i, i + 3);
        let triHash = 0;
        for (let j = 0; j < 3; j++) triHash = (triHash * 31 + tri.charCodeAt(j)) >>> 0;
        const triIdx = triHash % EMBEDDING_DIM;
        vector[triIdx] += 0.3;
      }
    }
  });

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return Array.from(vector);
}

/**
 * Generates vector embedding for text using Google Gemini text-embedding-004 if API key is provided,
 * otherwise seamlessly falls back to the deterministic local semantic vector engine.
 * 
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Dense numerical embedding vector
 */
export async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text.slice(0, 4000));
      if (result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('Gemini embedding API call failed, falling back to local semantic engine:', err.message);
    }
  }

  // Local fallback
  return generateLocalSemanticEmbedding(text);
}

/**
 * Batch generate embeddings for multiple chunks
 */
export async function getBatchEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    const emb = await getEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
}
