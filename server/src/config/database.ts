import mongoose from 'mongoose';
import config from './index.js';

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err?.message || err);
    });
  }

  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
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
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error?.message || error);
    console.error('👉 TIP: Check that MONGODB_URI is set in Render (Environment) and that 0.0.0.0/0 is added in MongoDB Atlas Network Access.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully');
}

