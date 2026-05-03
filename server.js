require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Price = require('./models/Price');

const app = express();

// ─── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin:'https://order-management-system-fronted.vercel.app/',
  credentials: true
}));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/prices', require('./routes/prices'));
app.use('/api/submit', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ─── Seed Default Prices ──────────────────────────────────
const seedPrices = async () => {
  try {
    const count = await Price.countDocuments();
    if (count === 0) {
      await Price.insertMany([
        { label: 'Pizza', price: 120 },
        { label: 'Burger', price: 80 },
        { label: 'Pasta', price: 150 },
        { label: 'Sandwich', price: 60 },
        { label: 'Salad', price: 90 }
      ]);
      console.log('✅ Default prices seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding prices:', error.message);
  }
};

// ─── Database Connection & Server Start ───────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedPrices();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
