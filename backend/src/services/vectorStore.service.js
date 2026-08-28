import { db } from '../config/db.js';
import { cosineSimilarity, getEmbedding } from './embedding.service.js';

const STOP_WORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
  'should', 'now', 'tell', 'give', 'please', 'know', 'find', 'like', 'want'
]);

/**
 * Tokenize text for BM25 keyword matching and term overlap (excluding stopwords)
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Computes BM25 lexical keyword score for a chunk given a query
 */
function computeBM25Score(queryTokens, chunkTokens, docCount, avgDocLength, chunkLength, tokenDocFrequencies) {
  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;

  const k1 = 1.5;
  const b = 0.75;
  let score = 0;

  queryTokens.forEach(term => {
    const docFreq = tokenDocFrequencies[term] || 0;
    if (docFreq > 0) {
      // IDF calculation
      const idf = Math.log(1 + (docCount - docFreq + 0.5) / (docFreq + 0.5));
      // Term frequency in current chunk
      const tf = chunkTokens.filter(t => t === term).length;
      if (tf > 0) {
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (chunkLength / (avgDocLength || 1)));
        score += Math.max(0, idf) * (numerator / denominator);
      }
    }
  });

  return score;
}

class VectorStoreService {
  /**
   * Ingest and index chunk objects into the persistent vector database
   */
  async indexChunks(chunks) {
    if (!chunks || chunks.length === 0) return [];
    
    // Generate embeddings if not already attached
    for (const chunk of chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        chunk.embedding = await getEmbedding(chunk.content);
      }
    }

    db.insertMany('chunks', chunks);
    return chunks;
  }

  /**
   * Removes all chunk vectors associated with a specific document ID
   */
  deleteByDocId(docId) {
    return db.delete('chunks', c => c.docId === docId);
  }

  /**
   * Retrieves all chunks for a document
   */
  getChunksByDocId(docId) {
    return db.find('chunks', c => c.docId === docId);
  }

  /**
   * Total number of indexed vector chunks in the database
   */
  getTotalChunkCount() {
    return (db.chunks || []).length;
  }

  /**
   * Hybrid Vector + BM25 Semantic Search with calibrated confidence
   * 
   * @param {string} query - The student's question or search query
   * @param {object} options - Search options { topK, category, department }
   * @returns {Promise<Array<object>>} Top matching chunks with similarity scores & citations
   */
  async hybridSearch(query, options = {}) {
    const allChunks = db.chunks || [];
    if (allChunks.length === 0) {
      return [];
    }

    const topK = options.topK || db.settings.topK || 4;
    const categoryFilter = options.category && options.category !== 'All' ? options.category : null;
    const departmentFilter = options.department && options.department !== 'All' ? options.department : null;

    // 1. Filter candidates by category/department if specified
    const candidates = allChunks.filter(c => {
      if (categoryFilter && c.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (departmentFilter && c.department.toLowerCase() !== departmentFilter.toLowerCase()) {
        return false;
      }
      return true;
    });

    if (candidates.length === 0) return [];

    // 2. Generate embedding for user query
    const queryEmbedding = await getEmbedding(query);
    const queryTokens = tokenize(query);

    // 3. Compute corpus stats for BM25
    const totalDocs = candidates.length;
    let totalLength = 0;
    const tokenDocFreq = {};

    const candidateTokensMap = new Map();
    candidates.forEach(c => {
      const tokens = tokenize(c.content);
      candidateTokensMap.set(c.id, tokens);
      totalLength += tokens.length;

      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach(t => {
        tokenDocFreq[t] = (tokenDocFreq[t] || 0) + 1;
      });
    });

    const avgLength = totalLength / (totalDocs || 1);

    // 4. Calculate Vector Cosine Similarity and BM25 scores
    let maxBm25 = 0;
    const scoredChunks = candidates.map(chunk => {
      const rawVectorSim = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0;
      const chunkTokens = candidateTokensMap.get(chunk.id) || [];
      const bm25Score = computeBM25Score(queryTokens, chunkTokens, totalDocs, avgLength, chunkTokens.length, tokenDocFreq);
      if (bm25Score > maxBm25) maxBm25 = bm25Score;

      const matchedTerms = queryTokens.filter(t => chunkTokens.includes(t));
      const termOverlapRatio = queryTokens.length > 0 ? (matchedTerms.length / queryTokens.length) : 0;

      return {
        chunk,
        rawVectorSim,
        bm25Score,
        termOverlapRatio,
        matchedTermsCount: matchedTerms.length
      };
    });

    // 5. Hybrid Score Fusion & Calibration
    const fusedResults = scoredChunks.map(item => {
      const normBm25 = maxBm25 > 0 ? (item.bm25Score / maxBm25) : 0;

      let calibratedScore = 0;
      if (item.matchedTermsCount === 0) {
        // Zero substantive term overlap -> heavily penalize false positive noise
        calibratedScore = Math.min(0.35, item.rawVectorSim * 0.4);
      } else {
        // Legitimate match -> scale with semantic vector + BM25 + overlap
        calibratedScore = (0.5 * item.rawVectorSim) + (0.35 * normBm25) + (0.15 * item.termOverlapRatio);
        calibratedScore = Math.min(0.98, calibratedScore + (item.termOverlapRatio >= 0.5 ? 0.15 : 0.05));
      }

      return {
        ...item.chunk,
        similarityScore: Math.round(calibratedScore * 100) / 100,
        vectorScore: Math.round(item.rawVectorSim * 100) / 100,
        bm25Score: Math.round(normBm25 * 100) / 100
      };
    });

    // 6. Sort descending by hybrid score and take topK
    fusedResults.sort((a, b) => b.similarityScore - a.similarityScore);
    return fusedResults.slice(0, topK);
  }
}

export const vectorStore = new VectorStoreService();
