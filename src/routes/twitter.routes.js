// src/routes/twitter.routes.js
const express = require('express');
const router = express.Router();
const twitterController = require('../controllers/twitter.controller');

// GET last X tweets for a handle
router.get('/tweets', twitterController.getTweets);

// POST a new tweet
router.post('/tweets', twitterController.postTweet);

// GET a tweet by ID
router.get('/tweets/:id', twitterController.getTweetById);

// POST a reply to a tweet by ID
router.post('/tweets/:id/reply', twitterController.postReply);

module.exports = router;
