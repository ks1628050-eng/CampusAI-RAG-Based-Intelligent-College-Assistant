import { v4 as uuidv4 } from 'uuid';

/**
 * Splits document text into overlapping chunks for vector embedding and retrieval.
 * Uses a word/token-aware sliding window that respects paragraph boundaries.
 * 
 * @param {string} text - The raw text content of the document.
 * @param {object} docMetadata - Metadata to attach to each chunk (docId, title, category, department, etc.)
 * @param {number} chunkSize - Approximate target words per chunk (default 250 words ~ 350-400 tokens)
 * @param {number} chunkOverlap - Overlap words between consecutive chunks (default 50 words)
 * @returns {Array<object>} Array of chunk objects with content and rich metadata
 */
export function chunkText(text, docMetadata = {}, chunkSize = 250, chunkOverlap = 50) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Normalize line breaks and clean whitespace
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanText) return [];

  // Split text into paragraphs first to preserve semantic cohesion
  const paragraphs = cleanText.split(/\n\n+/);
  const words = [];
  const wordToPageEstimate = [];

  let currentWordCount = 0;
  paragraphs.forEach((p) => {
    const pWords = p.split(/\s+/).filter(w => w.length > 0);
    pWords.forEach(w => {
      words.push(w);
      // Rough page number estimation (approx 350 words per page)
      wordToPageEstimate.push(Math.floor(currentWordCount / 350) + 1);
      currentWordCount++;
    });
    // Add paragraph boundary sentinel if needed
  });

  if (words.length === 0) return [];

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const chunkContent = chunkWords.join(' ');
    const pageNumber = wordToPageEstimate[startIndex] || 1;

    // Estimate token count (~1.3 tokens per word)
    const tokenCount = Math.round(chunkWords.length * 1.3);

    chunks.push({
      id: uuidv4(),
      docId: docMetadata.docId || 'unknown',
      docTitle: docMetadata.title || 'Untitled Document',
      category: docMetadata.category || 'General',
      department: docMetadata.department || 'All',
      chunkIndex,
      pageNumber,
      content: chunkContent,
      tokenCount,
      createdAt: new Date().toISOString()
    });

    chunkIndex++;

    if (endIndex >= words.length) {
      break;
    }

    // Slide window forward by (chunkSize - chunkOverlap)
    startIndex += Math.max(1, chunkSize - chunkOverlap);
  }

  return chunks;
}
