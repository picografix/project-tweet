// src/services/twitter.service.js
const { Scraper } = require('agent-twitter-client');

/**
 * A service class that mirrors the same functionality as the code using `twitter-api-v2`,
 * but internally uses `agent-twitter-client` for operations on X (Twitter).
 *
 * Make sure to configure environment variables or cookies for authentication.
 * (See the documentation for `agent-twitter-client` for details.)
 */
class TwitterService {
  constructor() {
    // Create a scraper instance
    this.scraper = new Scraper();
    // You might also want to log in immediately here, or call `init()` separately.
  }

  /**
   * Optionally, call this to perform a login if you're not using cookies directly.
   *
   * Example environment variables needed:
   *   TWITTER_USERNAME, TWITTER_PASSWORD,
   *   TWITTER_API_KEY, TWITTER_API_SECRET_KEY,
   *   TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
   */
  async init() {
    // For v1 (search, reading tweets)
    // If you only need read-only, you might skip v2 credentials
    await this.scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL,
      process.env.TWITTER_2FA_SECRET
    );



    // For v2 features (posting tweets, polls, advanced APIs):
    // await this.scraper.login(
    //   process.env.TWITTER_USERNAME,
    //   process.env.TWITTER_PASSWORD,
    //   process.env.TWITTER_EMAIL,
    //   process.env.TWITTER_2FA_SECRET,
    //   process.env.TWITTER_API_KEY,
    //   process.env.TWITTER_API_SECRET_KEY,
    //   process.env.TWITTER_ACCESS_TOKEN,
    //   process.env.TWITTER_ACCESS_TOKEN_SECRET
    // );
  }

  /**
   * Fetch the last X tweets from a given handle
   * @param {string} handle - The Twitter handle (e.g. 'brandXYZ')
   * @param {number} [count=5] - Number of recent tweets to fetch
   * @returns {Promise<Array>} List of tweets
   */
  async fetchLastXTweets(handle, count = 5) {
    try {
      // 1) Resolve the user ID from the handle
      const userId = await this.scraper.getUserIdByScreenName(handle);

      // 2) Create an async iterator of the user's tweets
      const tweetIterator = this.scraper.getTweetsByUserId(userId, count);

      // 3) Collect them into an array (up to `count`)
      const tweets = [];
      for await (const tweet of tweetIterator) {
        tweets.push(tweet);
      }

      return tweets;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw error;
    }
  }

  /**
   * Post a new tweet (simple text)
   * @param {string} text - The content of the tweet
   * @returns {Promise<Object>} The created tweet data
   */
  async postTweet(text) {
    try {
      // Use the v2 API for creating tweets
      const tweet = await this.scraper.sendTweetV2(text);
      return tweet;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  /**
   * Post a reply to a specific tweet
   * @param {string} tweetId - The tweet ID to reply to
   * @param {string} text - The reply content
   * @returns {Promise<Object>} The reply tweet data
   */
  async postReply(tweetId, text) {
    try {
      // pass the ID in as the 'replyToTweetId'
      const replyTweet = await this.scraper.sendTweetV2(text, tweetId);
      return replyTweet;
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  }

  /**
   * Fetch a tweet by ID
   * @param {string} tweetId - The tweet ID to fetch
   * @returns {Promise<Object|null>} The tweet data or null if not found
   */
  async fetchTweetById(tweetId) {
    try {
      const tweet = await this.scraper.getTweetV2(tweetId);
      return tweet;
    } catch (error) {
      console.error('Error fetching tweet by ID:', error);
      throw error;
    }
  }
}

module.exports = new TwitterService();
