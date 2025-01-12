// src/app.js
const express = require('express');
const cors = require('cors');
const twitterRoutes = require('./routes/twitter.routes');
const gptRoutes = require('./routes/gpt.routes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set a default handle for convenience
app.set('defaultTwitterHandle', "prodzshocker");

// Routes
app.use('/api/twitter', twitterRoutes);
app.use('/api/gpt', gptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is up and running' });
});

module.exports = app;
