import React, { createContext, useState, useContext, useEffect } from 'react';
import { chatAPI, pdfAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState(2048);

  // Load chat listing when user logs in
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setDocuments([]);
    }
  }, [user]);

  // Load user's chat history list
  const loadChats = async () => {
    setChatsLoading(true);
    try {
      const response = await chatAPI.getChats();
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setChatsLoading(false);
    }
  };

  // Load details, messages, and files for a single chat session
  const loadChatDetails = async (chatId) => {
    setMessagesLoading(true);
    try {
      const response = await chatAPI.getChatDetails(chatId);
      if (response.data.success) {
        setCurrentChat(response.data.chat);
        setMessages(response.data.messages);
        setDocuments(response.data.documents);
        setSelectedModel(response.data.chat.model || 'gemini-2.5-flash');
      }
    } catch (error) {
      console.error(`Failed to load details for chat ${chatId}:`, error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Create new chat session
  const createNewChat = async (title = 'New Chat', model = 'gemini-2.5-flash') => {
    try {
      const response = await chatAPI.createChat(title, model);
      if (response.data.success) {
        const newChat = response.data.chat;
        setChats((prevChats) => [newChat, ...prevChats]);
        setCurrentChat(newChat);
        setMessages([]);
        setDocuments([]);
        setSelectedModel(model);
        return newChat;
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
      throw error;
    }
  };

  // Send message inside the current chat session
  const postMessage = async (content) => {
    if (!currentChat) return;

    const tempUserMessage = {
      _id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const tempAssistantMessage = {
      _id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      loading: true, // Mark as loading to trigger UI typing animations
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI updates
    setMessages((prevMessages) => [...prevMessages, tempUserMessage, tempAssistantMessage]);

    try {
      const response = await chatAPI.sendMessage(
        currentChat._id,
        content,
        selectedModel,
        temperature,
        maxOutputTokens
      );
      
      if (response.data.success) {
        const { userMessage, assistantMessage, chatTitle } = response.data;

        // Replace temporary messages with actual database message records
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg._id === tempUserMessage._id) return userMessage;
            if (msg._id === tempAssistantMessage._id) return assistantMessage;
            return msg;
          })
        );

        // Update active chat title if renamed automatically
        if (currentChat.title !== chatTitle) {
          setCurrentChat(prev => ({ ...prev, title: chatTitle }));
          setChats(prevChats => 
            prevChats.map(c => c._id === currentChat._id ? { ...c, title: chatTitle } : c)
          );
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update assistant message to display failure notice
      const errorMessage = error.response?.data?.message || 'Failed to get response. Please try again.';
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg._id === tempAssistantMessage._id) {
            return {
              _id: `error-${Date.now()}`,
              role: 'assistant',
              content: `❌ **Error:** ${errorMessage}`,
              error: true,
              createdAt: new Date().toISOString(),
            };
          }
          return msg;
        })
      );
    }
  };

  // Delete chat session
  const deleteChatSession = async (chatId) => {
    try {
      const response = await chatAPI.deleteChat(chatId);
      if (response.data.success) {
        setChats((prevChats) => prevChats.filter((c) => c._id !== chatId));
        
        // Reset current active chat if deleted
        if (currentChat && currentChat._id === chatId) {
          setCurrentChat(null);
          setMessages([]);
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error(`Failed to delete chat ${chatId}:`, error);
    }
  };

  // Update chat session title
  const renameChatSession = async (chatId, newTitle) => {
    try {
      const response = await chatAPI.updateTitle(chatId, newTitle);
      if (response.data.success) {
        setChats((prevChats) =>
          prevChats.map((c) => (c._id === chatId ? { ...c, title: newTitle } : c))
        );
        if (currentChat && currentChat._id === chatId) {
          setCurrentChat((prev) => ({ ...prev, title: newTitle }));
        }
      }
    } catch (error) {
      console.error(`Failed to rename chat ${chatId}:`, error);
    }
  };

  // Clear chat messages
  const clearChatSession = async (chatId) => {
    try {
      const response = await chatAPI.clearChat(chatId);
      if (response.data.success) {
        if (currentChat && currentChat._id === chatId) {
          setMessages([]);
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error(`Failed to clear messages for chat ${chatId}:`, error);
    }
  };

  // Handle PDF upload to active chat
  const uploadPdfFile = async (file) => {
    if (!currentChat) return;
    
    try {
      const response = await pdfAPI.uploadPdf(currentChat._id, file);
      
      if (response.data.success) {
        const { document, notificationMessage } = response.data;
        
        // Append newly processed PDF to documents context state
        setDocuments((prevDocs) => [...prevDocs, document]);
        
        // Append notification message to state chat
        setMessages((prevMessages) => [...prevMessages, notificationMessage]);
        
        return { success: true, filename: document.originalName };
      }
    } catch (error) {
      console.error('PDF upload failed:', error);
      const message = error.response?.data?.message || 'Failed to upload and parse PDF.';
      return { success: false, message };
    }
  };

  // Switch between models dynamically
  const changeSelectedModel = (model) => {
    setSelectedModel(model);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        documents,
        chatsLoading,
        messagesLoading,
        selectedModel,
        loadChats,
        loadChatDetails,
        createNewChat,
        postMessage,
        deleteChatSession,
        renameChatSession,
        clearChatSession,
        uploadPdfFile,
        changeSelectedModel,
        setCurrentChat,
        temperature,
        setTemperature,
        maxOutputTokens,
        setMaxOutputTokens,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
