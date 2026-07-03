import Chat from '../models/Chat.js';
import Document from '../models/Document.js';
import Message from '../models/Message.js';
import { extractTextFromPdf, chunkText, searchDocumentChunks } from '../services/pdfService.js';
import { generateChatResponse } from '../services/geminiService.js';

// @desc    Upload PDF, extract text, chunk and store in database
// @route   POST /api/pdf/upload
// @access  Private
export const uploadPdfDocument = async (req, res) => {
  try {
    const { chatId } = req.body;
    
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'chatId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    // 1. Verify chat exists
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    // 2. Extract text from PDF buffer
    console.log(`Parsing PDF: ${req.file.originalname} (${req.file.size} bytes)...`);
    const extractedText = await extractTextFromPdf(req.file.buffer);
    
    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract text from the PDF. The document might be empty or image-only scanned.' 
      });
    }

    // 3. Chunk text
    const chunks = chunkText(extractedText);
    console.log(`Text extracted successfully. Length: ${extractedText.length} chars. Created ${chunks.length} chunks.`);

    // 4. Create document record in database
    const document = await Document.create({
      userId: req.user._id,
      chatId: chat._id,
      filename: `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      originalName: req.file.originalname,
      textLength: extractedText.length,
      chunks,
    });

    // Create a special user notification message in the chat history
    const notificationMessage = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: 'assistant',
      content: `📁 **Uploaded Document:** *${req.file.originalname}* (${Math.round(req.file.size / 1024)} KB). I have processed it and you can now ask questions about its content!`,
    });

    res.status(201).json({
      success: true,
      message: 'PDF processed and indexed successfully',
      document: {
        _id: document._id,
        originalName: document.originalName,
        textLength: document.textLength,
        chunkCount: chunks.length,
      },
      notificationMessage,
    });

  } catch (error) {
    console.error('PDF upload/processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ask a direct question about a specific document
// @route   POST /api/pdf/ask
// @access  Private
export const askDocumentQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ success: false, message: 'documentId and question are required' });
    }

    // 1. Fetch document and verify user has access
    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied' });
    }

    // Fetch chat info for model settings
    const chat = await Chat.findById(document.chatId);
    const model = chat ? chat.model : 'gemini-2.5-flash';
    const systemPrompt = chat ? chat.systemInstruction : 'You are Rishav AI, a highly intelligent assistant.';

    // 2. Perform chunk search
    const matchedChunks = searchDocumentChunks(document.chunks, question, 4);

    if (matchedChunks.length === 0) {
      return res.status(200).json({
        success: true,
        answer: 'I could not find any relevant information in the document to answer your question.',
      });
    }

    // 3. Construct prompt
    const context = matchedChunks.map(c => c.text).join('\n\n');
    const prompt = 
      `Answer the question based ONLY on the following context from document: "${document.originalName}".\n\n` +
      `Context:\n${context}\n\n` +
      `Question: ${question}\n\n` +
      `Answer:`;

    // 4. Generate AI response
    const answer = await generateChatResponse(prompt, [], systemPrompt, model);

    res.status(200).json({
      success: true,
      answer,
      sources: matchedChunks.map(c => ({ index: c.index, excerpt: c.text.substring(0, 150) + '...' })),
    });

  } catch (error) {
    console.error('Ask document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
