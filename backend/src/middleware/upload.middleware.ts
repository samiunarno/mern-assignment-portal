
import { Request } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';

const storage = multer.memoryStorage();

// Filter for student submissions (strict)
const studentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filenameRegex = /^[\u4E00-\u9FFF]+\.pdf$/;
  if (file.mimetype === 'application/pdf' && filenameRegex.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file. Only .pdf files named with Chinese characters are allowed (e.g., 王小明.pdf).', 400) as any);
  }
};

export const upload = multer({
  storage,
  fileFilter: studentFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit
  },
});

// A more permissive upload for monitor assignment attachments
export const assignmentUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB limit
  },
});