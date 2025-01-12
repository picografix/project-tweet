const { config } = require('dotenv');
const { OpenAI } = require('openai');
config();

class GPTService {
  constructor() {
    this.openai = new OpenAI({
        apiKey: "my-api-key",
    });
  }

  /**
   * Generate text from GPT based on a prompt
   * @param {string} prompt - The prompt to send to GPT
   * @param {Object} [options] - Additional options, e.g. model, temperature, etc.
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, options = {}) {
    try {
      const response = await this.openai.createChatCompletion({
        model: options.model || 'gpt-4o', // or gpt-3.5-turbo
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 200,
      });

      const content = response.data.choices?.[0]?.message?.content;
      return content || '';
    } catch (error) {
      console.error('Error calling GPT:', error);
      throw error;
    }
  }
}

module.exports = new GPTService();
