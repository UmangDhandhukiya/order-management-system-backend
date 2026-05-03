require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Price = require("./models/Price");

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(express.json());

app.use(
  cors({
    origin: "https://order-management-system-fronted.vercel.app",
    credentials: true,
  })
);

// ─── Routes ────────────────────────────────────────────────
app.use("/api/prices", require("./routes/prices"));
app.use("/api/submit", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

// ─── Health Check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ─── MongoDB Connection Cache (Important for Vercel) ──────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;

    console.log("✅ Connected to MongoDB");

    await seedPrices();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

// ─── Seed Default Prices ───────────────────────────────────
const seedPrices = async () => {
  try {
    const count = await Price.countDocuments();

    if (count === 0) {
      await Price.insertMany([
        { label: "Pizza", price: 120 },
        { label: "Burger", price: 80 },
        { label: "Pasta", price: 150 },
        { label: "Sandwich", price: 60 },
        { label: "Salad", price: 90 },
      ]);

      console.log("✅ Default prices seeded successfully");
    }
  } catch (error) {
    console.error("❌ Error seeding prices:", error.message);
  }
};

// ─── Vercel Serverless Handler ─────────────────────────────
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ❌ REMOVE app.listen()
// app.listen(PORT)

// ✅ Export app for Vercel
module.exports = app;