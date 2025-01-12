// src/controllers/gpt.controller.js
const gptService = require('../services/gpt.service');
const { getPrompt } = require('../utils/promptTemplates');

/**
 * POST /api/gpt/generate
 * Generate text based on a selected template and placeholders.
 * Body example:
 * {
 *   "templateName": "rewrite",
 *   "variables": { "original": "Some tweet", "tone": "friendly", "style": "casual" },
 *   "model": "gpt-4"
 * }
 */
exports.generateText = async (req, res) => {
  try {
    const { templateName, variables, model } = req.body;
    if (!templateName) {
      return res.status(400).json({ success: false, error: 'templateName is required' });
    }

    // Build the final prompt from the template
    const prompt = getPrompt(templateName, variables);

    // Call GPT
    const generated = await gptService.generateText(prompt, { model });
    return res.json({ success: true, data: generated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
