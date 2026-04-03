const mongoose = require("mongoose");

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,  // Give up selecting server after 10s
  socketTimeoutMS: 45000,           // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000,          // Give up initial connection after 10s
  maxPoolSize: 10,                  // Maintain up to 10 socket connections
  minPoolSize: 1,                   // Keep at least 1 connection alive
  heartbeatFrequencyMS: 10000,      // Check server health every 10s
  retryWrites: true,
  retryReads: true,
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
    console.log("✅ MongoDB Atlas connected");

    // Log when connection is lost
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    // Log successful reconnections
    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully");
    });

    // Log any connection errors
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

  } catch (error) {
    console.error("❌ MongoDB initial connection failed:", error.message);
    // Retry after 5 seconds instead of crashing
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;