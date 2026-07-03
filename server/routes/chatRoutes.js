import express from 'express';
import {
  createChat,
  getChats,
  getChatById,
  sendMessage,
  deleteChat,
  updateChatTitle,
  clearChatMessages,
  enhancePrompt
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All chat routes are protected with JWT auth and rate limited
router.use(protect);
router.use(apiLimiter);

router.post('/new', createChat);
router.post('/message', sendMessage);
router.post('/enhance-prompt', enhancePrompt);
router.get('/history', getChats);
router.get('/history/:id', getChatById);
router.delete('/:id', deleteChat);
router.put('/:id/title', updateChatTitle);
router.post('/:id/clear', clearChatMessages);

export default router;
