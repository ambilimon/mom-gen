// API communication utilities
import { CONFIG } from '../config.js';
import { getSettings } from './storage.js';

/**
 * Call the Netlify function to generate MOM
 * @param {string} userQuery - The user's meeting data
 * @param {string} systemPrompt - The system prompt for AI
 * @returns {Promise<Object>} AI response with whatsappMessage and actionItems
 */
export async function callGeminiAPI(userQuery, systemPrompt) {
    const settings = getSettings();
    const functionUrl = CONFIG.NETLIFY_FUNCTION_URL;

    const payload = {
        userQuery: userQuery,
        systemPrompt: systemPrompt,
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey
    };

    // Exponential backoff for retries
    let response;
    let delay = 1000;
    
    for (let i = 0; i < 5; i++) {
        try {
            response = await fetch(functionUrl, {
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
                const errorData = await response.json();
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
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
    return result;
}

/**
 * Fetch available models from OpenRouter
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<Array>} List of available models
 */
export async function fetchOpenRouterModels(apiKey) {
    const endpoint = CONFIG.PROVIDERS.openrouter.modelsEndpoint;
    
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Filter and format models
        return data.data
            .filter(model => !model.id.includes('free') && model.context_length >= 8000)
            .map(model => ({
                id: model.id,
                name: model.name,
                context: model.context_length
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        throw error;
    }
}

/**
 * Get models for the current provider
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key (required for OpenRouter)
 * @returns {Promise<Array>} List of available models
 */
export async function getModelsForProvider(provider, apiKey) {
    const providerConfig = CONFIG.PROVIDERS[provider];
    
    if (!providerConfig) {
        throw new Error(`Unknown provider: ${provider}`);
    }

    // For Gemini, return predefined models
    if (provider === 'gemini') {
        return Promise.resolve(providerConfig.defaultModels);
    }

    // For OpenRouter, fetch models from API
    if (provider === 'openrouter') {
        if (!apiKey) {
            throw new Error('API key required to fetch models');
        }
        return fetchOpenRouterModels(apiKey);
    }

    return Promise.resolve([]);
}
