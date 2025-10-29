# Netlify Functions Setup Instructions

## ✅ What I've Done:

1. **Created Netlify Function** (`netlify/functions/generate-mom.js`)
   - Your API key is now stored server-side, not in the browser
   - The function acts as a secure proxy between your app and Gemini API

2. **Updated `index.html`**
   - Removed the exposed API key
   - Modified to call the Netlify Function instead

3. **Updated `netlify.toml`**
   - Configured the functions directory

## 🔐 Next Steps (IMPORTANT):

### Step 1: Add Your API Key to Netlify
Go to your Netlify dashboard and add the environment variable:

1. Open: https://app.netlify.com
2. Select your site
3. Go to: **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyCzU7FPazEKDVHRD_0dxWUjawgk9irwdUE`
6. Click **Save**

### Step 2: Redeploy Your Site
After adding the environment variable:
- Push your code to GitHub (your auto-commit should handle this)
- OR manually trigger a deploy in Netlify dashboard

### Step 3: Test
Once deployed, test the "Generate & Send" button on your live site.

## 🧪 Local Testing (Optional)

To test locally before deploying:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file
echo "GEMINI_API_KEY=AIzaSyCzU7FPazEKDVHRD_0dxWUjawgk9irwdUE" > .env

# Run locally
netlify dev
```

Then open: http://localhost:8888

## 🔒 Security Benefits:

✅ API key is **never exposed** in browser  
✅ API key is stored in **Netlify environment variables**  
✅ Even if someone copies your code, they **can't use your key**  
✅ You can **rotate your key** anytime without code changes  

## 📝 How It Works:

```
Browser → Netlify Function → Gemini API
         (No API key)      (API key here)
```

Your HTML sends a request to `/.netlify/functions/generate-mom`, which then securely calls Gemini with your API key stored in environment variables.
