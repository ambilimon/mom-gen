# Troubleshooting Guide

## Error: "API call failed after retries"

This error occurs when the Netlify Function cannot successfully communicate with the Gemini API. Here are the steps to diagnose and fix it:

### Step 1: Check Netlify Deployment Logs

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your **mom-gen** site
3. Click on **Deploys** tab
4. Click on the most recent deploy
5. Check the **Function logs** section

Look for these specific log messages:
- `GEMINI_API_KEY environment variable is not set!` - API key is missing
- `API key found, length: XX` - API key is configured
- `Attempt X/5: Calling Gemini API...` - Retry attempts
- `Status 400/401/403/429/500` - Specific API error codes

### Step 2: Verify API Key Configuration

**Check if the environment variable is set:**

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site → **Site settings** → **Environment variables**
3. Verify `GEMINI_API_KEY` exists and has a value

**If missing or incorrect:**
- Add/update the key with your Google AI Studio API key
- **Important:** After changing environment variables, you MUST redeploy the site for changes to take effect

**To redeploy:**
```bash
# Option 1: Trigger via CLI
netlify deploy --prod

# Option 2: Via Dashboard
Go to Deploys → Trigger deploy → Deploy site
```

### Step 3: Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| **400** | Bad Request | Check if the Gemini model name is correct (`gemini-2.0-flash-exp`) |
| **401** | Unauthorized | API key is invalid or not set |
| **403** | Forbidden | API key doesn't have permission to access this API |
| **429** | Too Many Requests | Rate limit exceeded - wait a few minutes and try again |
| **500/503** | Server Error | Gemini API is down - check [Google Cloud Status](https://status.cloud.google.com/) |

### Step 4: Test API Key Manually

Test your API key directly using curl:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
```

Replace `YOUR_API_KEY` with your actual API key.

### Step 5: Check API Quota

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Check your API key's quota and usage
3. Ensure you haven't exceeded the free tier limits

### Step 6: Verify Model Availability

The model `gemini-2.0-flash-exp` might be:
- Experimental and may be deprecated
- Not available in your region
- Requires a different API endpoint

**Alternative models to try:**
- `gemini-1.5-flash` (stable)
- `gemini-1.5-pro` (more powerful)

To change the model, edit `netlify/functions/generate-mom.js` line 36:
```javascript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
```

### Step 7: Enable Debug Mode Locally

Test the function locally with Netlify CLI:

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Create local .env file with your API key
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env

# Run Netlify dev server
netlify dev
```

Then test at: `http://localhost:8888`

### Quick Checklist

- [ ] API key is set in Netlify environment variables
- [ ] Site has been redeployed after adding/changing the API key
- [ ] API key is valid and not expired
- [ ] API quota hasn't been exceeded
- [ ] Model name is correct and available
- [ ] No active Google Cloud outages
- [ ] Function logs show detailed error messages

### Still Not Working?

Check the browser console (F12) for additional error details. The frontend also has retry logic that might provide more specific error messages.

If the error persists, check:
1. **Network connectivity** - Ensure Netlify can reach Google APIs
2. **CORS issues** - Though this should not be an issue with Netlify Functions
3. **Payload size** - Very large meeting notes might exceed API limits

### Support Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Google AI Studio](https://aistudio.google.com/)
