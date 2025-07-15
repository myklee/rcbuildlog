// LLM Configuration for GitHub Pages Deployment
// Free cloud-based providers that work with static hosting
export const LLM_CONFIG = {
  provider: 'openrouter',
  openrouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    model: 'google/gemma-3n-e2b-it:free', // Use the Gemma model
    baseUrl: 'https://openrouter.ai/api/v1',
  }
}

// Available models for different providers
export const AVAILABLE_MODELS = {
  huggingface: [
    'microsoft/DialoGPT-medium',
    'gpt2',
    'distilgpt2',
    'microsoft/DialoGPT-small',
    'EleutherAI/gpt-neo-125M'
  ],
  openrouter: [
    'openai/gpt-3.5-turbo',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-2-7b-chat',
    'google/gemini-pro'
  ],
  replicate: [
    'meta/llama-2-7b-chat',
    'a16z-infra/llama-2-7b-chat',
    'replicate/llama-2-7b-chat'
  ],
  ollama: [
    'llama2:7b',
    'llama2:13b',
    'mistral:7b',
    'codellama:7b',
    'phi:2.7b'
  ],
  localai: [
    'llama2',
    'mistral',
    'codellama'
  ]
}

// Instructions for setting up different providers
export const SETUP_INSTRUCTIONS = {
  huggingface: `
    Hugging Face Setup (FREE - 30K requests/month):
    1. Create account at https://huggingface.co/
    2. Go to Settings → Access Tokens
    3. Create a new token
    4. Create a .env file in your project root
    5. Add: VITE_HUGGINGFACE_API_KEY=your_token_here
    6. Deploy to GitHub Pages
  `,
  openrouter: `
    OpenRouter Setup (FREE - Multiple models):
    1. Create account at https://openrouter.ai/
    2. Get API key from https://openrouter.ai/keys
    3. Create a .env file in your project root
    4. Add: VITE_OPENROUTER_API_KEY=your_key_here
    5. Deploy to GitHub Pages
  `,
  replicate: `
    Replicate Setup (FREE - Limited usage):
    1. Create account at https://replicate.com/
    2. Get API token from https://replicate.com/account/api-tokens
    3. Create a .env file in your project root
    4. Add: VITE_REPLICATE_API_KEY=your_token_here
    5. Deploy to GitHub Pages
  `,
  ollama: `
    Ollama Setup (Local Development Only):
    1. Install Ollama from https://ollama.ai/
    2. Run: ollama pull llama2:7b
    3. Start Ollama: ollama serve
    4. Change provider to 'ollama' in config/llm.js
  `,
  localai: `
    LocalAI Setup (Local Development Only):
    1. Install LocalAI from https://localai.io/
    2. Configure your models in LocalAI
    3. Start service on port 8080
    4. Change provider to 'localai' in config/llm.js
  `
} 

