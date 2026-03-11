const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

// ─── CORS Configuration ───────────────────────────────────────────
// Allow requests from ALL common local dev origins so that
// CORS errors never appear during development.
const allowedOrigins = [
  'http://localhost:5173',   // Vite default
  'http://localhost:5174',   // Vite fallback port
  'http://localhost:3000',   // CRA / other dev server
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    // In production, you might want to specify your Vercel URL here, 
    // but for now, we'll allow all for easier deployment.
    // Replace with individual origins for better security later.
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────
// Quick endpoint to verify the backend is alive
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ─── Global Error Handler ─────────────────────────────────────────
// Catches unhandled errors so the server never crashes silently
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
