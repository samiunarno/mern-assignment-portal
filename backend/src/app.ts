

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { AppError } from './utils/AppError';
import { globalErrorHandler } from './middleware/error.middleware';
import apiRouter from './routes';

const app = express();

// --- GLOBAL MIDDLEWARE ---

// Security HTTP headers
app.use(helmet());

// Enable CORS with dynamic origin for Vercel
const allowedOrigins = ['http://localhost:5173'];
if (process.env.NODE_ENV === 'production') {
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow Vercel preview URLs
    if (origin && /--[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
      if (!allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
      }
    }
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for production
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));


// --- ROUTES ---
// Add a logging middleware to confirm API requests are being received by the backend
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API REQUEST] ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  next();
}, apiRouter);

// --- 404 HANDLER ---
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith('/api')) {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  } else {
    // This is not an API route, so it's not a 404 from the backend's perspective.
    // Let the frontend handle it. In Vercel, this will be rewritten to index.html.
    next();
  }
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use(globalErrorHandler);

export default app;