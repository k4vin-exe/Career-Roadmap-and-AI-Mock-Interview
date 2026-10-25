import mongoose from 'mongoose';
import config from './index.js';

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

let retryTimer: NodeJS.Timeout | null = null;

function scheduleReconnect() {
  if (mongoose.connection.readyState === 1 || retryTimer) {
    return;
  }
  console.log('🔄 Scheduling MongoDB reconnect in 10 seconds...');
  retryTimer = setTimeout(async () => {
    retryTimer = null;
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Attempting MongoDB reconnect...');
      await connectDatabase();
    }
  }, 10000);
}

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err?.message || err);
    });
  }

  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Will retry...');
      scheduleReconnect();
    });
  }

  try {
    const maskedUri = config.mongodbUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔗 Connecting to MongoDB: ${maskedUri}`);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.db?.databaseName}`);
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error?.message || error);
    console.error('👉 TIP: Check that MONGODB_URI is set in Render (Environment) and that 0.0.0.0/0 is added in MongoDB Atlas Network Access.');
    scheduleReconnect();
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully');
}

