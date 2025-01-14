/*****************************************************************************
 * MAIN.JS - The top layer of the logic
 *****************************************************************************/

import { loginOrLoadCookies, searchTopTweets, replyToTweet } from './twitterLayer.js';
import { shouldWeReply, generateReply } from './openAILayer.js';
import { alreadyRepliedStore } from './alreadyRepliedStore.js';
import { config } from 'dotenv';
config("/Users/gsoni/Documents/Work/personal/project-tweet/.env");
/**
 * This is the main function that ties everything together.
 * It assumes that each sub-layer below is already perfect for its needs.
 * In reality, they're just stubs or partial stubs that we will implement later.
 */
async function mainLoop() {
  console.log('[MAIN] Starting main loop...');

  // Attempt to log in using existing cookies or fallback to password-based login
  console.log('[MAIN] Logging in to Twitter...');
  await loginOrLoadCookies();

  // Our search queries
  const queries = [
    'ai agents',
    'ai',
    'coding',
    'llms',
    'coding using llms',
    'openai',
    'chatgpt',
  ];

  while (true) {
    console.log('\n[MAIN] ===== New iteration of fetching and replying =====\n');

    for (const query of queries) {
      console.log(`[MAIN] Searching top tweets for query: "${query}"`);
      const tweets = await searchTopTweets(query, 10); // get top 10 tweets

      for (const tweet of tweets) {
        // Skip if we've replied before
        if (alreadyRepliedStore.has(tweet.id)) {
          console.log(`[MAIN] Already replied to tweet id: ${tweet.id} - skipping`);
          continue;
        }

        console.log(`[MAIN] Checking if we should reply to tweet id: ${tweet.id}`);

        const weShouldReply = await shouldWeReply(tweet);
        if (!weShouldReply) {
          console.log(`[MAIN] We should NOT reply to tweet id: ${tweet.id}`);
          continue;
        }

        console.log(`[MAIN] We SHOULD reply to tweet id: ${tweet.id}`);

        const replyContent = await generateReply(tweet);
        if (!replyContent) {
          console.warn('[MAIN] Could not generate a reply for this tweet.');
          continue;
        }

        console.log(`[MAIN] Attempting to post reply: "${replyContent}"`);

        // Actually post the reply
        await replyToTweet(tweet.id, replyContent);

        // Mark it as replied so we don’t do it again
        alreadyRepliedStore.add(tweet.id);
        console.log(`[MAIN] Persisting tweet id: ${tweet.id} to local store.`);
        alreadyRepliedStore.persist();
      }
    }

    // Sleep or wait a bit before next iteration (just for example)
    console.log('[MAIN] Sleeping for 60 seconds before next iteration...');
    await new Promise((r) => setTimeout(r, 60_000));
  }
}

// Start the main loop
mainLoop().catch((err) => {
  console.error('[MAIN] Fatal error in mainLoop:', err);
});