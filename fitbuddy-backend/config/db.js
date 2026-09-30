const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/fitbuddy";
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Warning:", err.message);
    console.log("ℹ️  To connect to MongoDB, ensure local MongoDB service is running (mongod) or update MONGO_URI in .env with a MongoDB Atlas connection string.");
  }
};

module.exports = connectDB;