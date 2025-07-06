# LLM Integration Setup Guide

This guide will help you set up the AI parser feature to automatically extract RC vehicle specifications from your log entries and image descriptions.

## Overview

The AI parser uses open source language models to analyze your project content and extract technical specifications like:
- Motor/engine details
- Battery specifications
- Drivetrain components
- Suspension settings
- Electronics
- Performance data
- Custom modifications

## Setup Options

### Option 1: Ollama (Recommended - Local)

Ollama is the easiest way to run open source LLMs locally on your machine.

#### Installation
1. Visit [ollama.ai](https://ollama.ai/) and download for your platform
2. Install and start Ollama
3. Pull a model:
   ```bash
   ollama pull llama2:7b
   ```

#### Configuration
The default configuration uses Ollama with the `llama2:7b` model. You can change this in `src/config/llm.js`:

```javascript
export const LLM_CONFIG = {
  provider: 'ollama',
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama2:7b', // Change this to any model you've pulled
  }
}
```

#### Available Models
- `llama2:7b` - Good balance of speed and quality
- `llama2:13b` - Better quality, slower
- `mistral:7b` - Fast and good quality
- `codellama:7b` - Good for technical content
- `phi:2.7b` - Very fast, smaller model

### Option 2: LocalAI

LocalAI is another local LLM server with more configuration options.

#### Installation
1. Visit [localai.io](https://localai.io/) for installation instructions
2. Configure your models in LocalAI
3. Start the service on port 8080

#### Configuration
```javascript
export const LLM_CONFIG = {
  provider: 'localai',
  localai: {
    baseUrl: 'http://localhost:8080',
    model: 'llama2',
  }
}
```

### Option 3: OpenAI (Cloud)

For the best results, you can use OpenAI's models, but this requires an API key and costs money.

#### Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Create a `.env` file in your project root:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

#### Configuration
```javascript
export const LLM_CONFIG = {
  provider: 'openai',
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
  }
}
```

## Usage

1. **Open a Project**: Navigate to any of your RC build projects
2. **Click AI Parser**: Look for the "AI Parser" button with the brain icon
3. **Test Connection**: First, test that your LLM is working
4. **Parse Content**: Choose to parse individual entries or all project content
5. **Auto-Populate**: Automatically fill your build spec sheet with extracted data

## How It Works

The AI parser:

1. **Analyzes Text**: Reads through your log entries, image descriptions, and video descriptions
2. **Extracts Specs**: Identifies RC vehicle specifications and parts information
3. **Structures Data**: Organizes the information into categories (motor, battery, suspension, etc.)
4. **Merges Results**: Combines information from multiple sources, prioritizing newer entries
5. **Updates Spec Sheet**: Automatically populates your build specification sheet

## Example Input/Output

### Input (Log Entry)
```
"Just installed the new Hobbywing 3650 3200KV brushless motor with a 60A ESC. 
Running on 3S 5000mAh LiPo battery with XT60 connectors. 
The car is a 1/10 scale Traxxas Slash 4x4 with Pro-Line Badlands tires."
```

### Output (Extracted Specs)
```json
{
  "motor_engine": {
    "motor_type": "brushless",
    "motor_size": "3650",
    "motor_kv": "3200KV",
    "esc": "Hobbywing 60A",
    "esc_amp_rating": "60A",
    "battery_type": "LiPo",
    "battery_capacity": "5000mAh",
    "battery_voltage": "3S",
    "battery_connector": "XT60"
  },
  "vehicle_info": {
    "vehicle_type": "4x4",
    "scale": "1/10",
    "brand": "Traxxas",
    "model": "Slash"
  },
  "drivetrain": {
    "tire_type": "Pro-Line Badlands"
  }
}
```

## Troubleshooting

### Connection Issues
- **Ollama**: Make sure Ollama is running (`ollama serve`)
- **LocalAI**: Check that LocalAI is running on the correct port
- **OpenAI**: Verify your API key is correct and has credits

### Poor Results
- Try a larger model (e.g., `llama2:13b` instead of `llama2:7b`)
- Make sure your log entries contain technical details
- Use OpenAI for better results (but costs money)

### Performance Issues
- Use smaller models for faster processing
- Consider using cloud providers for heavy workloads
- The parser processes entries sequentially to avoid overwhelming the LLM

## Customization

You can customize the extraction prompt in `src/services/llmParser.js` to focus on specific types of information or add new categories.

## Security

- **Local Models**: All processing happens on your machine
- **OpenAI**: Data is sent to OpenAI's servers (check their privacy policy)
- **No Data Storage**: Extracted data is only used to populate your build spec sheets

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your LLM service is running
3. Test with a simple log entry first
4. Try different models if results are poor 