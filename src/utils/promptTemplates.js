// src/utils/promptTemplates.js

const promptTemplates = {
    rewrite: `
  Rewrite the following tweet with improved clarity and style:
  Original Tweet: "<original>"
  Tone: <tone>
  Style: <style>
  Ensure you maintain the essence of the original.
  `,
    draft: `
  Draft a new tweet about "<topic>" in a <tone> tone. 
  Try to keep it within <length> characters if possible.
  `,
    engage: `
  Given this context: "<context>"
  Generate a highly engaging tweet with a <tone> tone. 
  Include relevant hashtags if they fit naturally.
  `,
  };
  
  /**
   * Get a template by name and replace placeholders
   * @param {string} templateName
   * @param {Object} variables
   * @returns {string} The final prompt to send to GPT
   */
  function getPrompt(templateName, variables = {}) {
    const template = promptTemplates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found.`);
    }
  
    let finalPrompt = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`<${key}>`, 'g');
      finalPrompt = finalPrompt.replace(placeholder, value);
    }
    return finalPrompt;
  }
  
  module.exports = {
    getPrompt,
    promptTemplates,
  };
  