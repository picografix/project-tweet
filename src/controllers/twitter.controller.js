// src/controllers/twitter.controller.js
const twitterService = require('../services/twitter.service');

/**
 * GET /api/twitter/tweets
 * Fetch the last X tweets for a given handle.
 */
exports.getTweets = async (req, res) => {
  try {
    const handle = req.query.handle || req.app.get('defaultTwitterHandle');
    const count = req.query.count ? parseInt(req.query.count, 10) : 5;

    const tweets = await twitterService.fetchLastXTweets(handle, count);
    return res.json({ success: true, data: tweets });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/twitter/tweets
 * Post a new tweet.
 */
exports.postTweet = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Tweet text is required' });
    }

    const newTweet = await twitterService.postTweet(text);
    return res.json({ success: true, data: newTweet });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/twitter/tweets/:id/reply
 * Post a reply to a tweet by ID.
 */
exports.postReply = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const { text } = req.body;
    if (!tweetId || !text) {
      return res.status(400).json({ success: false, error: 'tweetId and text are required' });
    }

    const replyTweet = await twitterService.postReply(tweetId, text);
    return res.json({ success: true, data: replyTweet });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/twitter/tweets/:id
 * Fetch a tweet by ID (for context).
 */
exports.getTweetById = async (req, res) => {
  try {
    const tweetId = req.params.id;
    const tweet = await twitterService.fetchTweetById(tweetId);
    return res.json({ success: true, data: tweet });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
