import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config, { validateEnv } from './config/index.js';
import { connectDatabase, isDatabaseConnected } from './config/database.js';
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
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
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

// ────────────────────────────── Static Frontend ──────────────────────────────
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  console.log(`📦 Serving static client from: ${clientDist}`);
  app.use(express.static(clientDist));

  // SPA fallback for non-API client routes (compatible with Express 5)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
} else {
  console.log(`ℹ️  client/dist not found at ${clientDist}, frontend static serving skipped.`);
}

// ────────────────────────────── Error Handling ──────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ────────────────────────────── Start Server ──────────────────────────────

async function startServer(): Promise<void> {
  const host = '0.0.0.0';
  const port = config.port;

  const server = app.listen(port, host, () => {
    console.log(`\n🚀 Server listening on http://${host}:${port}`);
    console.log(`📋 Health check: http://${host}:${port}/api/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}\n`);
  });

  server.on('error', (err) => {
    console.error(`❌ HTTP Server failed to listen on ${host}:${port}:`, err);
  });

  // Connect to database in background without blocking port binding
  connectDatabase().catch((err) => {
    console.error('❌ Database connection error on startup:', err);
  });
}

startServer();

export default app;
