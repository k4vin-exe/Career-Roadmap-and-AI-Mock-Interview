import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config, { validateEnv } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import interviewRoutes from './routes/interviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
validateEnv();

const app = express();

// ────────────────────────────── Middleware ──────────────────────────────

// Security headers (relaxed CSP so Vite bundle, fonts, and speech audio load smoothly)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiting
app.use('/api', apiLimiter);

// ────────────────────────────── Routes ──────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Mock Interview Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Interview routes
app.use('/api/interview', interviewRoutes);

// Report routes
app.use('/api/report', reportRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// User/Dashboard routes
app.use('/api/user', userRoutes);

// Roadmap routes
app.use('/api/roadmap', roadmapRoutes);

// ────────────────────────────── Static Frontend (Production) ────────────────
if (config.nodeEnv === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // SPA fallback for non-API client routes (e.g. /setup, /interview, /dashboard)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ────────────────────────────── Error Handling ──────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ────────────────────────────── Start Server ──────────────────────────────

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}`);
      console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
