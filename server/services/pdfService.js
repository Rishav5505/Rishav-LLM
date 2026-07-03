import pdfParse from 'pdf-parse';

/**
 * Extract plain text from PDF buffer
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Split text into chunks with overlap
 * @param {string} text - Extracted document text
 * @param {number} chunkSize - Number of characters per chunk
 * @param {number} overlap - Overlapping characters between adjacent chunks
 * @returns {Array} - Array of chunk objects { index, text }
 */
export const chunkText = (text, chunkSize = 1200, overlap = 200) => {
  if (!text) return [];
  
  const chunks = [];
  let index = 0;
  let start = 0;
  
  // Clean up excessive whitespace
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunkText = cleanedText.substring(start, end);
    
    chunks.push({
      index,
      text: chunkText,
    });
    
    index++;
    // Move starting pointer forward by difference of size and overlap
    start += (chunkSize - overlap);
  }
  
  return chunks;
};

/**
 * Retrieve the most relevant chunks using simple keyword scoring (TF-lite)
 * @param {Array} chunks - Array of chunk objects
 * @param {string} queryText - User's query
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} - The top matching chunk objects
 */
export const searchDocumentChunks = (chunks, queryText, topK = 3) => {
  if (!chunks || chunks.length === 0) return [];
  if (!queryText) return chunks.slice(0, topK);

  // Common english stop words to filter out of search terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'to', 'from', 'in', 'on', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'of', 'for', 'this', 'that', 'these', 'those',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which',
    'who', 'whom', 'how', 'why', 'where', 'when'
  ]);

  // Tokenize query: lowercase, strip punctuation, split on spaces, remove stop words
  const tokens = queryText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));

  if (tokens.length === 0) {
    // Fallback: search with full non-empty query words
    const fallbackTokens = queryText
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 1);
    if (fallbackTokens.length === 0) return chunks.slice(0, topK);
    tokens.push(...fallbackTokens);
  }

  // Score each chunk
  const scoredChunks = chunks.map((chunk) => {
    let score = 0;
    const textLower = chunk.text.toLowerCase();

    tokens.forEach((token) => {
      // Term Frequency: check exact word boundary matches
      const wordRegex = new RegExp(`\\b${token}\\b`, 'g');
      const matches = textLower.match(wordRegex);
      
      if (matches) {
        score += matches.length * 2.0; // Higher weight for whole word matches
      } else if (textLower.includes(token)) {
        score += 0.5; // Lower weight for substring occurrences
      }
    });

    return { chunk, score };
  });

  // Sort scored chunks descending
  scoredChunks.sort((a, b) => b.score - a.score);

  // Return topK chunks with score > 0. Fallback to first few if no matches.
  const positiveMatches = scoredChunks.filter(item => item.score > 0);
  
  if (positiveMatches.length > 0) {
    return positiveMatches.slice(0, topK).map(item => item.chunk);
  }
  
  return chunks.slice(0, topK);
};
