// Configuration and Constants
export const CONFIG = {
    NETLIFY_FUNCTION_URL: '/.netlify/functions/generate-mom',
    MAX_HISTORY_ITEMS: 50,
    CAMERA_QUALITY: 0.8,
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        CONTACTS: 'momContacts',
        SNIPPETS: 'momSnippets',
        HISTORY: 'momMeetingHistory',
        SETTINGS: 'momSettings',
        PROMPTS: 'momPrompts'
    },
    
    // Default Settings
    DEFAULT_SETTINGS: {
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-2.0-flash-exp'
    },
    
    // Providers Configuration
    PROVIDERS: {
        gemini: {
            name: 'Google Gemini',
            apiKeyLabel: 'Gemini API Key',
            apiKeyHelp: 'Get your API key from Google AI Studio',
            modelsEndpoint: null, // Models are predefined
            defaultModels: [
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
            ]
        },
        openrouter: {
            name: 'OpenRouter',
            apiKeyLabel: 'OpenRouter API Key',
            apiKeyHelp: 'Get your API key from OpenRouter.ai',
            modelsEndpoint: 'https://openrouter.ai/api/v1/models'
        }
    }
};

// Default System Prompts for AI
export const DEFAULT_PROMPTS = {
    mom: `You are an expert administrative assistant. Your task is to generate a concise, professional, and friendly "Minutes of Meeting" (MOM) message suitable for WhatsApp.
- The user will provide raw notes, participant names, meeting details, and optionally, a personalized service snippet.
- Format the output as a single JSON object with two keys: "whatsappMessage" (a string for WhatsApp) and "actionItems" (an array of strings for the user's private to-do list).
- The "whatsappMessage" should start with "Hi [Recipient's Name]," and summarize the key discussion points, decisions, and action items for the *recipient*.
- The "actionItems" array should *only* list tasks for the *user* (the sender), derived from the notes.
- If a [USE_SNIPPET:...] tag is present, you MUST take the provided snippet content, personalize it based on the meeting notes, and weave it *naturally* into the "whatsappMessage". Do not just paste it.
- Be friendly, professional, and concise.`,
    
    sales: `You are an expert AI Sales Development Representative (SDR). Your task is to generate a persuasive, value-driven, and friendly sales follow-up message suitable for WhatsApp.
- The user will provide raw notes, participant names, meeting details, and optionally, a personalized service snippet.
- Format the output as a single JSON object with two keys: "whatsappMessage" (a string for WhatsApp) and "actionItems" (an array of strings for the user's private to-do list).
- The "whatsappMessage" should start with "Hi [Recipient's Name]," thank them for their time, and reinforce the value proposition of the user's services, connecting it to the recipient's needs discussed in the meeting.
- The "actionItems" array should *only* list sales-related next steps for the *user* (the sender), e.g., "Send proposal," "Follow up next Tuesday."
- If a [USE_SNIPPET:...] tag is present, you MUST take the provided snippet content, personalize it, and make it a core, natural part of the "whatsappMessage" to drive the sale forward.
- The message should be enthusiastic, confident, and clearly define the next step (e.g., "I'll send over that proposal by EOD").`
};

// Backward compatibility - export as SYSTEM_PROMPTS too
export const SYSTEM_PROMPTS = DEFAULT_PROMPTS;
