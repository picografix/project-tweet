/*****************************************************************************
 * TWITTERLAYER.JS - This layer handles Twitter-specific logic using the
 * scraper library (agent-twitter-client). We stubbed these out in the top
 * layer as if they're perfect. Let's implement them for real now.
 *****************************************************************************/

import fs from 'fs';
import path from 'path';
import { Scraper, SearchMode } from 'agent-twitter-client';

const COOKIES_FILE = path.join(process.cwd(), 'cookies.json');
let scraperInstance = null;

/**
 * Attempt to load cookies from `cookies.json`. If that fails or invalid,
 * log in with username/password/email, then store cookies.
 */
export async function loginOrLoadCookies() {
  console.log('[TWITTER] loginOrLoadCookies called');

  const scraper = new Scraper();
  scraperInstance  = scraper; // keep a reference for future usage

  let usedCookies = false;
  if (fs.existsSync(COOKIES_FILE)) {
    try {
      const cookiesData = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
      await scraper.setCookies(cookiesData);
      const isLoggedIn = await scraper.isLoggedIn();
      if (isLoggedIn) {
        console.log('[TWITTER] Successfully logged in via cookies.json!');
        usedCookies = true;
      }
    } catch (error) {
      console.warn('[TWITTER] Failed to parse cookies.json or set cookies', error);
    }
  }

  if (!usedCookies) {
    console.log('[TWITTER] Attempting username/password/email login...');
    const {
      TWITTER_USERNAME,
      TWITTER_PASSWORD,
      TWITTER_EMAIL,
    } = process.env;
    if (!TWITTER_USERNAME || !TWITTER_PASSWORD || !TWITTER_EMAIL) {
      throw new Error('Missing TWITTER_USERNAME / TWITTER_PASSWORD / TWITTER_EMAIL in env');
    }

    await scraper.login(
      TWITTER_USERNAME,
      TWITTER_PASSWORD,
      TWITTER_EMAIL
    );
    console.log('[TWITTER] Logged in with credentials. Saving new cookies...');
    const newCookies = await scraper.getCookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(newCookies, null, 2), 'utf8');
  }
}

/**
 * Search for tweets for a given query, in top mode. Limit: how many.
 */
export async function searchTopTweets(query, limit = 10) {
  if (!scraperInstance) {
    throw new Error('[TWITTER] Must call loginOrLoadCookies first!');
  }
  console.log(`[TWITTER] Searching for top tweets: "${query}"`);
  const results = await scraperInstance.fetchSearchTweets(query, limit, SearchMode.Top);
  console.log(`[TWITTER] Found ${results.tweets.length} tweets for query "${query}"`);
  return results.tweets;
}

/**
 * Reply to a tweet with given content.
 */
export async function replyToTweet(tweetId, replyContent) {
  if (!scraperInstance) {
    throw new Error('[TWITTER] Must call loginOrLoadCookies first!');
  }
  console.log(`[TWITTER] Posting a reply to tweet id: ${tweetId}`);
  // We can do a "sendTweet" that includes the in_reply_to param
  try {
    await scraperInstance.sendQuoteTweet(replyContent, tweetId);
    console.log('[TWITTER] Reply posted successfully.');
  } catch (err) {
    console.error('[TWITTER] Error while posting reply:', err);
  }
}