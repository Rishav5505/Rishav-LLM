import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get settings - accessible to any logged in user (so the frontend can display current instruction or use it)
router.get('/settings', protect, getSystemSettings);

// Update settings - admin only
router.put('/settings', protect, admin, updateSystemSettings);

export default router;
