import { app } from "./app.js";
import { configDotenv } from "dotenv";
import { connectDb } from "./src/db/connectDb.js";
import Razorpay from "razorpay";
import mongoose from "mongoose";

configDotenv();

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ FIX IS HERE
const PORT = process.env.PORT || 3000;

let server;

connectDb()
  .then(() => {
    server = app.listen(PORT, "0.0.0.0", () => {
      console.log("PORT ENV =", process.env.PORT);
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed!", err);
    process.exit(1);
  });

// Graceful shutdown (this part is GOOD)
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });

    setTimeout(() => process.exit(1), 30000);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
