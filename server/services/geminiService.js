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
  modelName = 'gemini-2.5-flash',
  temperature,
  maxOutputTokens
) => {
  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const genAI = getGenAIClient();
      
      // Configure special system instruction rules for image generation requests
      const imageInstruction = `\n\n[IMAGE GENERATION RULE]: If the user asks you to create, draw, generate, or show a picture/image/photo/painting of something, you must respond with a Markdown image syntax referencing the Pollinations AI generator:
![Image Description](https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=1024&height=1024&nologo=true)
Where {URL_ENCODED_PROMPT} is a descriptive prompt in English detailing what to draw, URL-encoded (with spaces replaced by %20, etc.). Never state that you are a text model. Always act as if you can generate it yourself using this format.`;

      // Load model with system instruction configuration
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: (systemInstruction || 'You are Rishav AI, a highly intelligent assistant.') + imageInstruction,
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
          maxOutputTokens: maxOutputTokens || 2048,
          temperature: temperature !== undefined ? Number(temperature) : 0.7,
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

/**
 * Extract text from media (image, audio, docx, etc.) using Gemini
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File mimetype
 * @param {string} prompt - Instruction for extraction
 * @returns {Promise<string>} - Extracted text / transcript
 */
export const extractTextWithGemini = async (buffer, mimeType, prompt) => {
  try {
    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const filePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([
      filePart,
      prompt
    ]);

    const response = await result.response;
    return response.text() || '';
  } catch (error) {
    console.error('Gemini file processing error:', error);
    throw new Error(`Rishav AI failed to extract file content: ${error.message}`);
  }
};
