import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Detects if the prompt is an image generation request
 */
const isImageRequest = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  // English keywords
  const englishKeywords = ['image', 'photo', 'picture', 'draw', 'generate', 'paint', 'sketch', 'illustration', 'drawing', 'painting'];
  // Hindi/Hinglish verbs/nouns
  const hindiKeywords = ['banao', 'bana', 'banaao', 'dikhao', 'dikhaye', 'kheencho', 'tasveer', 'chitra', 'karo'];
  
  const hasImageWord = englishKeywords.some(kw => lower.includes(kw)) || lower.includes('tasveer') || lower.includes('chitra');
  const hasCreateVerb = hindiKeywords.some(kw => lower.includes(kw)) || lower.includes('create') || lower.includes('make') || lower.includes('show');
  
  return hasImageWord || (lower.includes('draw ') && lower.length > 5) || (lower.includes('paint ') && lower.length > 6);
};

/**
 * Normalizes and URL-encodes Pollinations AI Markdown image URLs inside text
 */
const encodePollinationsUrls = (text) => {
  if (!text) return text;

  // Match markdown images with pollinations URL
  return text.replace(/(!\[.*?\]\()(https:\/\/image\.pollinations\.ai\/prompt\/)(.*?)(\))/g, (match, prefix, base, urlContent, closeParen) => {
    const parts = urlContent.split('?');
    const rawPrompt = parts[0];
    const queryParams = parts[1] ? `?${parts[1]}` : '?width=1024&height=1024&nologo=true';

    // Prevent double encoding
    const decodedPrompt = decodeURIComponent(rawPrompt)
      .replace(/\{URL_ENCODED_PROMPT\}/g, '') // strip brackets placeholder
      .replace(/[{}]/g, '') // remove any literal curly braces
      .trim();
    
    const encodedPrompt = encodeURIComponent(decodedPrompt);

    return `${prefix}${base}${encodedPrompt}${queryParams}${closeParen}`;
  });
};

// Markdown image instruction rule for all models
const IMAGE_INSTRUCTION = `\n\n[IMAGE GENERATION RULE]: If the user asks you to create, draw, generate, or show a picture/image/photo/painting of something, you must respond with a Markdown image syntax referencing the Pollinations AI generator:
![Image Description](https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=1024&height=1024&nologo=true)
Where {URL_ENCODED_PROMPT} is a descriptive prompt in English detailing what to draw, URL-encoded (with spaces replaced by %20, etc.). Never state that you are a text model. Always act as if you can generate it yourself using this format.`;

const IMAGE_SYSTEM_DIRECTIVE = `\n\n[SYSTEM DIRECTIVE]: The user wants to create/draw/paint/generate an image or photo. You MUST respond with a Markdown image syntax:
![Image Description](https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=1024&height=1024&nologo=true)
Replace {URL_ENCODED_PROMPT} with a detailed description of what the user wants in English, properly URL-encoded. Do not say you are a text model. Always act as if you can generate it yourself using this format.`;

/**
 * Generate response from selected model (Gemini, OpenAI, Anthropic, Groq, Pollinations fallback)
 */
export const generateChatResponse = async (
  prompt,
  historyMessages = [],
  systemInstruction = '',
  modelName = 'gemini-2.5-flash',
  temperature = 0.7,
  maxOutputTokens = 2048
) => {
  const isImg = isImageRequest(prompt);
  const adjustedPrompt = isImg ? prompt + IMAGE_SYSTEM_DIRECTIVE : prompt;
  const fullSystemInstruction = (systemInstruction || 'You are Rishav AI, a highly intelligent assistant.') + IMAGE_INSTRUCTION;

  // 1. Google Gemini Handler
  if (modelName.startsWith('gemini-')) {
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const genAI = getGenAIClient();
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: fullSystemInstruction,
        });

        const formattedHistory = historyMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: maxOutputTokens || 2048,
            temperature: temperature !== undefined ? Number(temperature) : 0.7,
          },
        });

        const result = await chat.sendMessage(adjustedPrompt);
        const response = await result.response;
        const rawText = response.text();
        return encodePollinationsUrls(rawText);
      } catch (error) {
        retries -= 1;
        console.error(`Gemini API error (Retries left: ${retries}):`, error.message);
        if (retries === 0) {
          throw new Error(`Failed to generate content from Gemini API: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  // 2. OpenAI Handler (with free Pollinations fallback)
  if (modelName === 'gpt-4o-mini' || modelName === 'gpt-4o') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const messages = [
          { role: 'system', content: fullSystemInstruction },
          ...historyMessages.map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: adjustedPrompt }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: temperature,
            max_tokens: maxOutputTokens
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';
        return encodePollinationsUrls(rawText);
      } catch (error) {
        console.warn(`OpenAI official API failed: ${error.message}. Falling back to Free API.`);
      }
    }
    // Fallback to Pollinations
    return generateFreeFallback(adjustedPrompt, historyMessages, fullSystemInstruction, 'openai', temperature, maxOutputTokens);
  }

  // 3. Anthropic Claude Handler (with free Pollinations fallback)
  if (modelName === 'claude-3-5-sonnet') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const messages = [
          ...historyMessages.map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: adjustedPrompt }
        ];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            system: fullSystemInstruction,
            messages,
            max_tokens: maxOutputTokens || 2048,
            temperature: temperature
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text || '';
        return encodePollinationsUrls(rawText);
      } catch (error) {
        console.warn(`Anthropic official API failed: ${error.message}. Falling back to Free API.`);
      }
    }
    // Fallback to Pollinations
    return generateFreeFallback(adjustedPrompt, historyMessages, fullSystemInstruction, 'openai', temperature, maxOutputTokens, ' (Free Claude Fallback)');
  }

  // 4. Meta Llama 3 / Qwen Handler (with Groq API key option or OpenRouter, falling back to Pollinations)
  if (modelName === 'llama-3.1-8b' || modelName === 'qwen-2.5-coder') {
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    // Use Groq if key is available
    if (groqKey) {
      try {
        const targetModel = modelName === 'llama-3.1-8b' ? 'llama-3.1-8b-instant' : 'qwen-2.5-coder-32b';
        const messages = [
          { role: 'system', content: fullSystemInstruction },
          ...historyMessages.map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: adjustedPrompt }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: temperature,
            max_tokens: maxOutputTokens
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.choices?.[0]?.message?.content || '';
          return encodePollinationsUrls(rawText);
        }
      } catch (error) {
        console.warn(`Groq API call failed: ${error.message}. Falling back to Free API.`);
      }
    }

    // Use OpenRouter if key is available
    if (openrouterKey) {
      try {
        const targetModel = modelName === 'llama-3.1-8b' ? 'meta-llama/llama-3-8b-instruct:free' : 'qwen/qwen-2-7b-instruct:free';
        const messages = [
          { role: 'system', content: fullSystemInstruction },
          ...historyMessages.map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
          { role: 'user', content: adjustedPrompt }
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: temperature
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.choices?.[0]?.message?.content || '';
          return encodePollinationsUrls(rawText);
        }
      } catch (error) {
        console.warn(`OpenRouter call failed: ${error.message}. Falling back to Free API.`);
      }
    }

    // Default Fallback
    return generateFreeFallback(adjustedPrompt, historyMessages, fullSystemInstruction, 'openai', temperature, maxOutputTokens);
  }

  throw new Error(`Unsupported model: ${modelName}`);
};

/**
 * Free fallback text generation handler using Pollinations AI
 */
const generateFreeFallback = async (
  prompt,
  historyMessages = [],
  systemInstruction = '',
  fallbackModel = 'openai',
  temperature,
  maxOutputTokens,
  appendNotice = ''
) => {
  try {
    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMessages.map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: fallbackModel,
        temperature,
        max_tokens: maxOutputTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Pollinations AI error status: ${response.status}`);
    }

    const rawText = await response.text();
    
    // Append small warning message if we fell back from Claude/OpenAI without keys
    const finalNotice = appendNotice ? `\n\n*(Note: Ran using Pollinations Free API fallback)*` : '';
    return encodePollinationsUrls(rawText) + finalNotice;
  } catch (error) {
    console.error('Free fallback generation failed:', error);
    throw new Error(`Both premium and free fallback LLM services failed: ${error.message}`);
  }
};

/**
 * Extract text from media (image, audio, docx, etc.) using Gemini
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
