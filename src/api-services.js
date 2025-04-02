/**
 * API Services for Genni
 * Handles API calls to different AI providers (OpenAI & Google Gemini)
 */

/**
 * Makes an API call to OpenAI
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model to use (e.g. gpt-4o-mini)
 * @param {string} systemPrompt - System prompt for the AI
 * @param {string} screenshot - Base64 encoded screenshot
 * @returns {Promise} - Promise that resolves to the API response
 */
async function callOpenAI(apiKey, model, systemPrompt, screenshot) {
  const imageContent = screenshot.startsWith('data:image/') 
    ? [{ type: "image_url", image_url: { url: screenshot } }]
    : null;

  if (!imageContent) {
    throw new Error("No valid screenshot found. Please take a new screenshot.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: imageContent }
      ],
      max_tokens: 200
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Network error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Makes an API call to Google Gemini
 * @param {string} apiKey - Google Gemini API key
 * @param {string} model - Model to use (e.g. gemini-2.0-flash)
 * @param {string} systemPrompt - System prompt for the AI
 * @param {string} screenshot - Base64 encoded screenshot
 * @returns {Promise} - Promise that resolves to the API response
 */
async function callGemini(apiKey, model, systemPrompt, screenshot) {
  // Extract the base64 data from the data URI
  let base64Image = screenshot;
  if (screenshot.includes(',')) {
    base64Image = screenshot.split(',')[1];
  }

  // Updated to use gemini-2.0-flash which supports vision capabilities
  const endpoint = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
  const url = `${endpoint}?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    generation_config: {
      max_output_tokens: 200,
      temperature: 0.7
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Extract text from the response
  if (data.candidates && data.candidates.length > 0 && 
      data.candidates[0].content && data.candidates[0].content.parts && 
      data.candidates[0].content.parts.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Unexpected response format from Gemini API");
  }
}

/**
 * Makes an API call to the selected provider
 * @param {Object} config - Configuration object with API details
 * @returns {Promise} - Promise that resolves to the API response
 */
async function generateReply(config) {
  const { provider, apiKey, model, systemPrompt, screenshot, temperature } = config;
  
  if (provider === "openai") {
    return await callOpenAI(apiKey, model, systemPrompt, screenshot);
  } else if (provider === "gemini") {
    // Always use gemini-2.0-flash for vision capabilities as the previous model is deprecated
    return await callGemini(apiKey, "gemini-2.0-flash", systemPrompt, screenshot);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export { generateReply };
