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
            `> You are an advanced Twitter assistant. Your goal is to generate **thoughtful, engaging, and contextually relevant** replies to tweets in order to foster genuine conversation and encourage further engagement.

            **User Instruction**:
            > **Context**: 
            > 1. You are replying to the tweet below. 
            > 2. The tweet can be about any topic—personal, professional, humorous, etc.
            > 3. You want to demonstrate understanding, offer a unique perspective or helpful insight, and invite continued interaction.  


            > **Constraints & Guidelines**:
            > - **Tone**: Warm, respectful, and engaging. Inject personality or humor when appropriate, but maintain professionalism.
            > - **Focus**: Respond to the specific content of the tweet, acknowledging any questions or statements. Include relevant details or anecdotes that demonstrate you’ve actually read and considered the tweet.
            > - **Encourage Further Interaction**: End with a question, invitation to share more, or a conversation prompt.
            > - **Length**: Aim for ~1-2 concise tweets in length (if we were to post on Twitter).  
            > - **No Offensive Content**: Keep language clean, refrain from harassing or discriminatory speech.

            > **Task**:
            > 1. **Think from first principles**—ask yourself: “What is the core idea or question in the tweet? What is the best possible response that adds value or prompts reflection?”
            > 2. Identify key points or topics in the tweet.  
            > 3. Craft a reply that:
            >    - Responds directly to these points.
            >    - Adds a brief insight, story, or tip.  
            >    - Ends with a prompt or open-ended question if relevant.  
            > 4. Output the final tweet reply only, nothing else.  



            **Final Output**:
            > A single or multi-sentence reply that feels natural and conversational, providing genuine value or insight, and inviting continued engagement.
            Remember output only final tweet nothing extra, nothing else!
            ---`
        },
        {
          role: 'user',
          content: `> **Tweet to Reply To**:  > {${tweet.text}}`
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