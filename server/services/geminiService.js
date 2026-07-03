import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Note: If GEMINI_API_KEY is not set, we will fail gracefully during the request rather than crashing at boot.
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please add it to your configuration.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generate response from Gemini with conversation history (memory)
 * @param {string} prompt - Current user message
 * @param {Array} historyMessages - Array of previous database messages (last 20)
 * @param {string} systemInstruction - Bot personality system prompt
 * @param {string} modelName - Gemini model version (default: gemini-2.5-flash)
 * @returns {Promise<string>} - The AI generated text response
 */
export const generateChatResponse = async (
  prompt,
  historyMessages = [],
  systemInstruction = '',
  modelName = 'gemini-2.5-flash'
) => {
  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const genAI = getGenAIClient();
      
      // Load model with system instruction configuration
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || 'You are Rishav AI, a highly intelligent assistant.',
      });

      // Format database messages to Gemini history structure
      // Mongoose message role: user / assistant
      // Gemini history role: user / model
      const formattedHistory = historyMessages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Initialize chat session
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      // Send message and get response
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      retries -= 1;
      console.error(`Gemini API error (Retries left: ${retries}):`, error.message);
      
      if (retries === 0) {
        throw new Error(`Failed to generate content from Gemini API: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};
