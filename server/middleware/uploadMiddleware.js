import multer from 'multer';

// Use memory storage to process PDF buffers directly in-memory
const storage = multer.memoryStorage();

// File filter to allow multiple formats: PDF, Word, Text, Images, Audio
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/html',
    'text/css',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a',
    'audio/m4a'
  ];

  if (
    allowedMimeTypes.includes(file.mimetype) || 
    file.mimetype.startsWith('image/') || 
    file.mimetype.startsWith('audio/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported formats: PDF, Word, Text, Images, and Audio.'), false);
  }
};

// Multer upload config
export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});
