// import 'dotenv/config';
const { config } = require('dotenv');
const { Cookie } = require('tough-cookie');
// src/services/twitter.service.js
const { Scraper } = require('agent-twitter-client');
const fs = require('fs');
config();
/**
 * A service class that mirrors the same functionality as the code using `twitter-api-v2`,
 * but internally uses `agent-twitter-client` for operations on X (Twitter).
 *
 * This version relies on cookies for authentication, which should be configured beforehand.
 * If cookies are invalid, the service will log in the user and save new cookies.
 */
class TwitterService {
  constructor() {
    // Create a scraper instance
    this.scraper = new Scraper();

    // Load cookies if available
    this.cookiePath = process.env.TWITTER_COOKIE_PATH || 'cookies.json';
    this.restoreCookies();
  }

  /**
   * Restore cookies from a file.
   */
  restoreCookies() {
    try {
      if (fs.existsSync(this.cookiePath)) {
        const cookiesRaw = fs.readFileSync(this.cookiePath, 'utf8');
        const cookieArray = JSON.parse(cookiesRaw);
        const cookieObjects = cookieArray.map(json => Cookie.fromJSON(json));
        this.scraper.setCookies(cookieObjects);
        console.log('Cookies restored successfully.');
      }
    } catch (error) {
      console.error('Error restoring cookies:', error);
    }
  }

  /**
   * Save cookies to a file.
   */
  async saveCookies() {
    try {
      const cookies = await this.scraper.getCookies();
      fs.writeFileSync(this.cookiePath, JSON.stringify(cookies));
      console.log('Cookies saved successfully.');
    } catch (error) {
      console.error('Error saving cookies:', error);
    }
  }

  /**
   * Login the user and save cookies.
   */
  async login() {
    try {
      await this.scraper.login(
        process.env.TWITTER_USERNAME,
        process.env.TWITTER_PASSWORD,
        process.env.TWITTER_EMAIL,
      );
      console.log('Login successful. Saving cookies...');
      await this.saveCookies();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Ensure the scraper is authenticated, logging in if necessary.
   */
  async ensureAuthenticated() {
    try {
      this.restoreCookies();
      console.log('Authentication verified.');
    } catch (error) {
      console.warn('Authentication failed. Logging in again...');
      await this.login();
    }
  }

  /**
   * Fetch the last X tweets from a given handle
   * @param {string} handle - The Twitter handle (e.g. 'brandXYZ')
   * @param {number} [count=5] - Number of recent tweets to fetch
   * @returns {Promise<Array>} List of tweets
   */
  async fetchLastXTweets(handle, count = 5) {
    try {
      await this.ensureAuthenticated();

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
      await this.ensureAuthenticated();

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
      await this.ensureAuthenticated();

      // Pass the ID in as the 'replyToTweetId'
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
      await this.ensureAuthenticated();

      const tweet = await this.scraper.getTweetV2(tweetId);
      return tweet;
    } catch (error) {
      console.error('Error fetching tweet by ID:', error);
      throw error;
    }
  }
}

module.exports = new TwitterService();
