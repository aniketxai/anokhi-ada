import mongoose from 'mongoose';

let cachedConnection = globalThis.__sambxMongoConnection;
let cachedPromise = globalThis.__sambxMongoPromise;

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing');
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    mongoose.set('strictQuery', true);

    cachedPromise = mongoose
      .connect(mongoUri)
      .then(() => mongoose.connection);

    globalThis.__sambxMongoPromise = cachedPromise;
  }

  cachedConnection = await cachedPromise;
  globalThis.__sambxMongoConnection = cachedConnection;

  return cachedConnection;
}
