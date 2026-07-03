import express from 'express';
import { uploadPdfDocument, askDocumentQuestion } from '../controllers/pdfController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPdf } from '../middleware/uploadMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Protect all PDF routes
router.use(protect);
router.use(apiLimiter);

// uploadPdf.single('file') handles single file upload, parsing multi-part form data
router.post('/upload', uploadPdf.single('file'), uploadPdfDocument);
router.post('/ask', askDocumentQuestion);

export default router;
