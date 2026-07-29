import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db';

export async function connectTestDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
}

export async function clearTestDB(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

export async function disconnectTestDB(): Promise<void> {
  await disconnectDB();
}
