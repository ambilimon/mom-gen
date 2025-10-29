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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

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
    
    for (let i = 0; i < 5; i++) {
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success
        } else if (response.status === 429 || response.status >= 500) {
          // Retry on rate limit or server error
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          // Don't retry on other client errors
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${errorText}`);
        }
      } catch (error) {
        if (i === 4) throw error; // Re-throw last error
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    if (!response.ok) {
      throw new Error(`API call failed after retries: ${response.statusText}`);
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
