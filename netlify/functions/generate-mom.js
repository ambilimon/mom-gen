exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userQuery, systemPrompt, provider = 'gemini', model, apiKey } = JSON.parse(event.body);

    // Validate input
    if (!userQuery || !systemPrompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    console.log(`Provider: ${provider}, Model: ${model || 'default'}`);

    // Use user-provided API key or fall back to environment variable
    const effectiveApiKey = apiKey || (provider === 'gemini' 
      ? process.env.GEMINI_API_KEY 
      : process.env.OPENROUTER_API_KEY);
    
    if (!effectiveApiKey) {
      console.error(`${provider.toUpperCase()}_API_KEY not provided and environment variable is not set!`);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: `API key not configured for ${provider}. Please set it in settings or environment variables.` 
        })
      };
    }

    // Route to appropriate handler
    if (provider === 'gemini') {
      return await handleGeminiRequest(userQuery, systemPrompt, model || 'gemini-2.0-flash-exp', effectiveApiKey);
    } else if (provider === 'openrouter') {
      return await handleOpenRouterRequest(userQuery, systemPrompt, model, effectiveApiKey);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unsupported provider: ${provider}` })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error'
      })
    };
  }
};

// Handle Gemini API requests
async function handleGeminiRequest(userQuery, systemPrompt, model, apiKey) {
  console.log(`Calling Gemini API with model: ${model}`);
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "whatsappMessage": { "type": "STRING" },
          "actionItems": {
            "type": "ARRAY",
            "items": { "type": "STRING" }
          }
        },
        required: ["whatsappMessage", "actionItems"]
      }
    }
  };

  // Exponential backoff for retries
  let response;
  let delay = 1000;
  let lastError = null;
  
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`Attempt ${i + 1}/5: Calling Gemini API...`);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`Success on attempt ${i + 1}`);
        break;
      } else if (response.status === 429 || response.status >= 500) {
        const errorText = await response.text();
        lastError = `Attempt ${i + 1}: Status ${response.status} - ${errorText}`;
        console.error(lastError);
        
        if (i < 4) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      } else {
        const errorText = await response.text();
        console.error(`Client error ${response.status}: ${errorText}`);
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
      }
    } catch (error) {
      lastError = error.message;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i === 4) throw error;
      
      if (i < 4) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  if (!response || !response.ok) {
    const errorMsg = lastError || response?.statusText || 'Unknown error';
    console.error(`All retries exhausted. Last error: ${errorMsg}`);
    throw new Error(`Gemini API call failed after 5 retries: ${errorMsg}`);
  }

  const result = await response.json();
  const candidate = result.candidates?.[0];

  if (candidate && candidate.content?.parts?.[0]?.text) {
    try {
      const parsedResponse = JSON.parse(candidate.content.parts[0].text);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedResponse)
      };
    } catch (e) {
      throw new Error("Gemini returned invalid JSON.");
    }
  } else {
    throw new Error("Gemini returned no content.");
  }
}

// Handle OpenRouter API requests
async function handleOpenRouterRequest(userQuery, systemPrompt, model, apiKey) {
  console.log(`Calling OpenRouter API with model: ${model}`);
  
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery }
    ],
    response_format: { type: 'json_object' }
  };

  // Exponential backoff for retries
  let response;
  let delay = 1000;
  let lastError = null;
  
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`Attempt ${i + 1}/5: Calling OpenRouter API...`);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost',
          'X-Title': 'MOM Generator',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`Success on attempt ${i + 1}`);
        break;
      } else if (response.status === 429 || response.status >= 500) {
        const errorText = await response.text();
        lastError = `Attempt ${i + 1}: Status ${response.status} - ${errorText}`;
        console.error(lastError);
        
        if (i < 4) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      } else {
        const errorText = await response.text();
        console.error(`Client error ${response.status}: ${errorText}`);
        throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
      }
    } catch (error) {
      lastError = error.message;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i === 4) throw error;
      
      if (i < 4) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  if (!response || !response.ok) {
    const errorMsg = lastError || response?.statusText || 'Unknown error';
    console.error(`All retries exhausted. Last error: ${errorMsg}`);
    throw new Error(`OpenRouter API call failed after 5 retries: ${errorMsg}`);
  }

  const result = await response.json();
  const choice = result.choices?.[0];

  if (choice && choice.message?.content) {
    try {
      const parsedResponse = JSON.parse(choice.message.content);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedResponse)
      };
    } catch (e) {
      throw new Error("OpenRouter returned invalid JSON.");
    }
  } else {
    throw new Error("OpenRouter returned no content.");
  }
}
