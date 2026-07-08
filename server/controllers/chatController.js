import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Document from '../models/Document.js';
import Setting from '../models/Setting.js';
import { generateChatResponse } from '../services/llmService.js';
import { searchDocumentChunks } from '../services/pdfService.js';

// Default system instruction fallback
const DEFAULT_SYSTEM_PROMPT = 
  'You are Rishav AI, a highly intelligent assistant. ' +
  'You are helpful, friendly, accurate, and concise. ' +
  'You assist in coding, interview preparation, learning, productivity, and daily tasks. ' +
  'Always respond clearly.';

// @desc    Create a new chat session
// @route   POST /api/chat/new
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { title, model } = req.body;
    
    // Fetch default system prompt from settings database or use fallback
    let systemInstruction = DEFAULT_SYSTEM_PROMPT;
    const dbPromptSetting = await Setting.findOne({ key: 'systemInstruction' });
    if (dbPromptSetting) {
      systemInstruction = dbPromptSetting.value;
    }

    const chat = await Chat.create({
      userId: req.user._id,
      title: title || 'New Chat',
      model: model || 'gemini-2.5-flash',
      systemInstruction,
    });

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all chat sessions for the logged in user
// @route   GET /api/chat/history
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single chat session with its messages
// @route   GET /api/chat/history/:id
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    const documents = await Document.find({ chatId: chat._id }).select('filename originalName textLength createdAt');

    res.status(200).json({
      success: true,
      chat,
      messages,
      documents,
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post a user message, query Gemini (RAG-augmented if PDFs exist), and save both user & assistant messages
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, model: modelOverride, temperature, maxOutputTokens } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ success: false, message: 'chatId and message content are required' });
    }

    // 1. Verify chat exists and belongs to user
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    // Update model if provided
    if (modelOverride && chat.model !== modelOverride) {
      chat.model = modelOverride;
      await chat.save();
    }

    // 2. Fetch last 20 messages for context
    const historyMessages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Reverse to chronological order (Gemini expects oldest first)
    historyMessages.reverse();

    // 3. Search document context if PDF files are attached to this chat
    const documents = await Document.find({ chatId: chat._id });
    let pdfContextText = '';
    let geminiPrompt = content;

    if (documents.length > 0) {
      // Gather all chunks across all documents in this chat
      const allChunks = [];
      documents.forEach(doc => {
        if (doc.chunks && doc.chunks.length > 0) {
          doc.chunks.forEach(c => {
            allChunks.push({
              text: c.text,
              filename: doc.originalName,
              chunkIndex: c.index
            });
          });
        }
      });

      if (allChunks.length > 0) {
        // Search chunks relevant to user question
        const matchedChunks = searchDocumentChunks(allChunks, content, 4);
        
        if (matchedChunks.length > 0) {
          pdfContextText = matchedChunks
            .map(c => `[Source: ${c.filename}]\n${c.text}`)
            .join('\n\n');

          // Augment prompt
          geminiPrompt = 
            `You have access to the following context extracted from uploaded PDF documents. ` +
            `Use this context to answer the user's question as accurately and concisely as possible.\n\n` +
            `--- CONTEXT START ---\n` +
            `${pdfContextText}\n` +
            `--- CONTEXT END ---\n\n` +
            `User Question: ${content}\n\n` +
            `Instructions: Base your response primarily on the document context provided above. ` +
            `If the context does not contain the answer, you can use your general knowledge, but clearly state that the answer is not explicitly mentioned in the documents.`;
        }
      }
    }

    // 4. Generate AI response from Gemini
    const systemPrompt = chat.systemInstruction || DEFAULT_SYSTEM_PROMPT;
    const aiResponseContent = await generateChatResponse(
      geminiPrompt,
      historyMessages,
      systemPrompt,
      chat.model,
      temperature,
      maxOutputTokens
    );

    // 5. Store user message in DB (store original clean prompt, but log the pdfContext sent if any)
    const userMessageObj = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: 'user',
      content,
      pdfContext: pdfContextText || undefined,
    });

    // 6. Store assistant message in DB
    const assistantMessageObj = await Message.create({
      userId: req.user._id,
      chatId: chat._id,
      role: 'assistant',
      content: aiResponseContent,
    });

    // 7. Auto-rename title if it's currently 'New Chat'
    if (chat.title === 'New Chat') {
      const truncatedTitle = content.trim().substring(0, 30) + (content.length > 30 ? '...' : '');
      chat.title = truncatedTitle;
    }
    
    // Update chat updatedAt time to sort it to the top of listings
    chat.updatedAt = new Date();
    await chat.save();

    res.status(200).json({
      success: true,
      userMessage: userMessageObj,
      assistantMessage: assistantMessageObj,
      chatTitle: chat.title,
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a chat session, its messages, and its documents
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    // Delete all associated messages
    await Message.deleteMany({ chatId: chat._id });

    // Delete all associated documents
    await Document.deleteMany({ chatId: chat._id });

    // Delete the chat session itself
    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat session and all related records deleted successfully',
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a chat session title
// @route   PUT /api/chat/:id/title
// @access  Private
export const updateChatTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    chat.title = title.trim();
    await chat.save();

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error('Update chat title error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all messages in a chat session
// @route   POST /api/chat/:id/clear
// @access  Private
export const clearChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }

    // Delete messages
    await Message.deleteMany({ chatId: chat._id });
    
    // Also delete documents (PDFs) associated since history is cleared
    await Document.deleteMany({ chatId: chat._id });

    res.status(200).json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enhance user prompt using Gemini
// @route   POST /api/chat/enhance-prompt
// @access  Private
export const enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const enhancementInstruction = 
      'You are a Prompt Engineering expert. ' +
      'Take the user prompt provided and rewrite it to be highly detailed, clear, professional, and optimized for an AI assistant. ' +
      'Provide ONLY the enhanced prompt. Do not add any introduction, explanations, quotes, or markdown formats.';

    const enhanced = await generateChatResponse(
      prompt,
      [],
      enhancementInstruction,
      'gemini-2.5-flash',
      0.3, // lower temperature for prompt focus
      1024
    );

    res.status(200).json({
      success: true,
      enhancedPrompt: enhanced.trim()
    });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
