// src/routes/gpt.routes.js
const express = require('express');
const router = express.Router();
const gptController = require('../controllers/gpt.controller');

// POST generate text based on template and variables
router.post('/generate', gptController.generateText);

module.exports = router;
