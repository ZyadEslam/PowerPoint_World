// lib/mongoose.ts (or whatever your file is called)
import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Import models to register them - use absolute paths
const registerModels = async () => {
  // Only import if not already compiled
  if (!mongoose.models.User) {
    await import("../app/models/user");
  }
  if (!mongoose.models.Product) {
    await import("../app/models/product");
  }
  if (!mongoose.models.Order) {
    await import("../app/models/order");
  }
  if (!mongoose.models.Address) {
    await import("../app/models/address");
  }
  if (!mongoose.models.HeroSection) {
    await import("../app/models/heroSection");
  }
  if (!mongoose.models.Settings) {
    await import("../app/models/settings");
  }
};

let cached = global.mongoose as
  | {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    }
  | undefined;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const cachedMongoose = cached!;

async function dbConnect(): Promise<typeof mongoose> {
  if (cachedMongoose.conn) {
    // Ensure models are registered even if connection is cached
    await registerModels();
    return cachedMongoose.conn;
  }

  if (!cachedMongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cachedMongoose.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (mongoose) => {
        await registerModels(); // Register models after connection
        return mongoose;
      });
  }

  try {
    cachedMongoose.conn = await cachedMongoose.promise;
  } catch (e) {
    cachedMongoose.promise = null;
    throw e;
  }

  return cachedMongoose.conn;
}

export default dbConnect;
