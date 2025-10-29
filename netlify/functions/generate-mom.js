exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userQuery, systemPrompt } = JSON.parse(event.body);

    // Validate input
    if (!userQuery || !systemPrompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // API key is stored securely in Netlify environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set!');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'API key not configured. Please set GEMINI_API_KEY in Netlify environment variables.' 
        })
      };
    }
    
    console.log('API key found, length:', apiKey.length);
    console.log('Using model: gemini-2.0-flash-exp');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

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
          break; // Success
        } else if (response.status === 429 || response.status >= 500) {
          // Retry on rate limit or server error
          const errorText = await response.text();
          lastError = `Attempt ${i + 1}: Status ${response.status} - ${errorText}`;
          console.error(lastError);
          
          if (i < 4) { // Don't delay after last attempt
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        } else {
          // Don't retry on other client errors (400, 401, 403, etc.)
          const errorText = await response.text();
          console.error(`Client error ${response.status}: ${errorText}`);
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
      } catch (error) {
        lastError = error.message;
        console.error(`Attempt ${i + 1} failed:`, error);
        
        if (i === 4) throw error; // Re-throw last error
        
        if (i < 4) { // Don't delay after last attempt
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    if (!response || !response.ok) {
      const errorMsg = lastError || response?.statusText || 'Unknown error';
      console.error(`All retries exhausted. Last error: ${errorMsg}`);
      throw new Error(`API call failed after 5 retries: ${errorMsg}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      try {
        const parsedResponse = JSON.parse(candidate.content.parts[0].text);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parsedResponse)
        };
      } catch (e) {
        throw new Error("AI returned invalid JSON.");
      }
    } else {
      throw new Error("AI returned no content.");
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
