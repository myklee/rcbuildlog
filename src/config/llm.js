// LLM Configuration
// You can modify these settings to use different LLM providers

export const LLM_CONFIG = {
  // Choose your preferred LLM provider
  // Options: 'ollama', 'localai', 'openai'
  provider: 'ollama',
  
  // Ollama configuration (local)
  // Install Ollama from https://ollama.ai/
  // Run: ollama pull llama2:7b
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama2:7b', // or 'mistral:7b', 'codellama:7b', 'llama2:13b', etc.
  },
  
  // LocalAI configuration
  // Install LocalAI from https://localai.io/
  localai: {
    baseUrl: 'http://localhost:8080',
    model: 'llama2',
  },
  
  // OpenAI configuration (fallback)
  // Requires API key in .env file: VITE_OPENAI_API_KEY=your_key_here
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
  }
}

// Available models for different providers
export const AVAILABLE_MODELS = {
  ollama: [
    'llama2:7b',
    'llama2:13b',
    'mistral:7b',
    'codellama:7b',
    'codellama:13b',
    'phi:2.7b',
    'gemma:2b',
    'gemma:7b'
  ],
  localai: [
    'llama2',
    'mistral',
    'codellama',
    'phi'
  ],
  openai: [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo'
  ]
}

// Instructions for setting up different providers
export const SETUP_INSTRUCTIONS = {
  ollama: `
    Ollama Setup:
    1. Install Ollama from https://ollama.ai/
    2. Run: ollama pull llama2:7b
    3. Start Ollama service
    4. Update the model in config/llm.js if needed
  `,
  localai: `
    LocalAI Setup:
    1. Install LocalAI from https://localai.io/
    2. Configure your models in LocalAI
    3. Start LocalAI service on port 8080
    4. Update the model in config/llm.js
  `,
  openai: `
    OpenAI Setup:
    1. Get an API key from https://platform.openai.com/
    2. Add VITE_OPENAI_API_KEY=your_key to .env file
    3. Update the model in config/llm.js if needed
  `
} 