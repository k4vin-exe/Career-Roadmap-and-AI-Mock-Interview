import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for Gemini-powered endpoints (expensive calls)
export const geminiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 AI calls per window
  message: {
    success: false,
    error: 'Too many AI requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
