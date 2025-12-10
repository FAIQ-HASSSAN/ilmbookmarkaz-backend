// src/api/discount/controllers/discount.ts
import { factories } from '@strapi/strapi';
import fetch from 'node-fetch';

export default factories.createCoreController('api::discount.discount', () => ({
  async openai(ctx) {
    try {
      // Example of predefined prompts you can rotate
      const prompts = [
        "How are you?",
        // "Tell me a joke.",
        // "Give me 3 fun facts about cats.",
      ];

      // Pick a random prompt
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      // Build request for OpenRouter.ai
      const body = {
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: randomPrompt
              }
            ]
          }
        ]
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return {
        data
      }
      // Extract AI response content
    //   const aiContent = data?.choices?.[0]?.message?.content || "No response";

    //   return { prompt: randomPrompt, response: aiContent };
    } catch (err: any) {
      console.error(err);
      return ctx.internalServerError('Something went wrong');
    }
  },
}));
