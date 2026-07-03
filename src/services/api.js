import axios from 'axios';

// Base URL points to our Express Node.js server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper endpoints mapping
export const authAPI = {
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

export const chatAPI = {
  createChat: (title, model) => api.post('/chat/new', { title, model }),
  getChats: () => api.get('/chat/history'),
  getChatDetails: (id) => api.get(`/chat/history/${id}`),
  sendMessage: (chatId, content, model, temperature, maxOutputTokens) => 
    api.post('/chat/message', { chatId, content, model, temperature, maxOutputTokens }),
  deleteChat: (id) => api.delete(`/chat/${id}`),
  updateTitle: (id, title) => api.put(`/chat/${id}/title`, { title }),
  clearChat: (id) => api.post(`/chat/${id}/clear`),
  enhancePrompt: (prompt) => api.post('/chat/enhance-prompt', { prompt }),
};

export const pdfAPI = {
  uploadPdf: (chatId, file) => {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('file', file);
    return api.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  askPdf: (documentId, question) => api.post('/pdf/ask', { documentId, question }),
};

export const adminAPI = {
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (systemInstruction) => api.put('/admin/settings', { systemInstruction }),
};

export default api;
