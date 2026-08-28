import fs from 'fs';
import pdfParse from 'pdf-parse';

/**
 * Extracts text content from an uploaded file based on its MIME type or extension.
 * Supports PDF, Markdown, and Plain Text files.
 * 
 * @param {string} filePath - Absolute path to the file on disk
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<{ text: string, numPages: number, metadata: object }>}
 */
export async function extractDocumentText(filePath, originalName = '', mimetype = '') {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const pdfData = await pdfParse(dataBuffer);
      return {
        text: pdfData.text || '',
        numPages: pdfData.numpages || 1,
        metadata: {
          info: pdfData.info,
          version: pdfData.version
        }
      };
    } catch (err) {
      console.error('Error parsing PDF file:', err);
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  }

  // Plain text / Markdown
  if (
    mimetype.startsWith('text/') ||
    ['txt', 'md', 'markdown', 'csv', 'json'].includes(ext)
  ) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const estimatedPages = Math.max(1, Math.ceil(content.split(/\s+/).length / 350));
    return {
      text: content,
      numPages: estimatedPages,
      metadata: { ext }
    };
  }

  // Fallback try reading as utf-8 string
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      text: content,
      numPages: 1,
      metadata: { ext }
    };
  } catch (err) {
    throw new Error(`Unsupported file type: ${ext || mimetype}`);
  }
}
