require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./config/db');
const { seedDb } = require('./config/seed');
const { generateHackerAvatar } = require('./utils/imageGenerator');

const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // For local testing flexibility, adjust in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static simulation pages and files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CyberQuest CTF API is running smoothly' });
});

// Default 404 Route for api
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// For frontend SPA routing in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error occurred' });
});

const PORT = process.env.PORT || 5000;

// Initialize db and start server
async function startServer() {
  try {
    // 1. Initialise database tables
    await initDb();
    
    // 2. Seed default badges and beginner challenges
    await seedDb();

    // 3. Generate hacker avatar EXIF image
    generateHackerAvatar();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  CYBERQUEST CTF SERVER STARTED ON PORT: ${PORT}`);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
