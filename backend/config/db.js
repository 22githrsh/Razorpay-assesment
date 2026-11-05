import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB connection failed: MONGO_URI is not set.");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  try {
    await mongoose.connect(uri);
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected (${host}/${name})`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
