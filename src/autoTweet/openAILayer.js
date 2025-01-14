/*****************************************************************************
 * OPENAILAYER.JS - This layer calls the OpenAI chat completions API to
 * figure out if we should respond and to generate replies.
 *****************************************************************************/
import OpenAI from 'openai';

// For demonstration, let's assume we initialize once at top-level
const openai = new OpenAI({
  // you might set your own config here, e.g. { apiKey: process.env.OPENAI_API_KEY }
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Decide if we should reply. We pass the tweet into a specialized prompt
 * "should_I_reply_prompt" with the tweet text.
 */
export async function shouldWeReply(tweet) {
  console.log('[OPENAI] Checking if we should reply to tweet via Chat Completions...');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'developer',
          content: 'You are a decision-making assistant. Return "yes" or "no".'
        },
        {
          role: 'user',
          content: `Tweet text: "${tweet.text}"\nShould we reply to this tweet?`
        },
      ]
    });

    const answer = completion.choices[0]?.message?.content?.trim().toLowerCase();

    console.log(`[OPENAI] Model answered: "${answer}"`);
    return answer.includes('yes');
  } catch (error) {
    console.error('[OPENAI] Error calling shouldWeReply prompt:', error);
    return false;
  }
}

/**
 * Generate an actual reply to the tweet. We'll call "what_should_i_reply" prompt.
 */
export async function generateReply(tweet) {
  console.log('[OPENAI] Generating a reply...');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'developer',
          content:
            'You are a creative writing assistant. Please generate a short, relevant reply to the tweet.'
        },
        {
          role: 'user',
          content: `Tweet text: "${tweet.text}"\nWhat should be the reply?`
        },
      ]
    });

    const replyText = completion.choices[0]?.message?.content?.trim();
    console.log('[OPENAI] Generated reply:', replyText);
    return replyText;
  } catch (error) {
    console.error('[OPENAI] Error calling generateReply prompt:', error);
    return '';
  }
}