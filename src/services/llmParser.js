import { supabase } from '../lib/supabase'
import { LLM_CONFIG } from '../config/llm'

// RC Vehicle specification extraction prompt
const EXTRACTION_PROMPT = `You are an expert RC vehicle technician and data extractor. Analyze the following text and extract any RC vehicle specifications, parts, modifications, or technical details mentioned.

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanations, text, or markdown formatting.

Extract the information into the following JSON structure. Only include fields that are actually mentioned in the text. If a field is not mentioned, omit it entirely:

{
  "vehicle_info": {
    "vehicle_name": "string",
    "vehicle_type": "string (buggy, truggy, monster truck, crawler, etc.)",
    "scale": "string (1/8, 1/10, 1/16, etc.)",
    "brand": "string",
    "model": "string",
    "year": "string"
  },
  "motor_engine": {
    "motor_type": "string (brushless, brushed, nitro, gas, etc.)",
    "motor_size": "string (3650, 3660, etc.)",
    "motor_kv": "string",
    "esc": "string (brand/model)",
    "esc_amp_rating": "string",
    "battery_type": "string (LiPo, NiMH, etc.)",
    "battery_capacity": "string (mAh)",
    "battery_voltage": "string (2S, 3S, 4S, etc.)",
    "battery_connector": "string (XT60, Deans, etc.)"
  },
  "drivetrain": {
    "transmission_type": "string",
    "gear_ratio": "string",
    "differential_type": "string",
    "drive_type": "string (2WD, 4WD, AWD)",
    "tire_size": "string",
    "tire_type": "string",
    "wheel_size": "string",
    "wheel_offset": "string"
  },
  "suspension": {
    "suspension_type": "string",
    "shock_type": "string",
    "shock_length": "string",
    "spring_rate": "string",
    "ride_height": "string",
    "camber_angle": "string",
    "toe_angle": "string"
  },
  "electronics": {
    "receiver": "string",
    "servo_type": "string",
    "servo_torque": "string",
    "servo_speed": "string",
    "gyro": "string",
    "lights": "string",
    "sound_system": "string"
  },
  "body_chassis": {
    "body_material": "string",
    "chassis_material": "string",
    "wheelbase": "string",
    "track_width": "string",
    "ground_clearance": "string",
    "weight": "string"
  },
  "performance": {
    "top_speed": "string",
    "acceleration": "string",
    "runtime": "string",
    "range": "string"
  },
  "modifications": {
    "custom_mods": "string",
    "aftermarket_parts": "string",
    "notes": "string"
  }
}

Text to analyze:
{text}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`

class LLMParser {
  constructor() {
    this.config = LLM_CONFIG
  }

  async callLLM(prompt, text) {
    const fullPrompt = prompt.replace('{text}', text)
    
    try {
      switch (this.config.provider) {
        case 'ollama':
          return await this.callOllama(fullPrompt)
        case 'localai':
          return await this.callLocalAI(fullPrompt)
        case 'openai':
          return await this.callOpenAI(fullPrompt)
        default:
          throw new Error(`Unsupported LLM provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('LLM API call failed:', error)
      throw error
    }
  }

  async callOllama(prompt) {
    try {
      // First, check if the model is available
      const modelsResponse = await fetch(`${this.config.ollama.baseUrl}/api/tags`)
      if (!modelsResponse.ok) {
        throw new Error(`Failed to check Ollama models: ${modelsResponse.status}`)
      }
      
      const modelsData = await modelsResponse.json()
      const availableModels = modelsData.models || []
      const modelExists = availableModels.some(model => model.name === this.config.ollama.model)
      
      if (!modelExists) {
        throw new Error(`Model '${this.config.ollama.model}' is not installed. Available models: ${availableModels.map(m => m.name).join(', ')}. Run: ollama pull ${this.config.ollama.model}`)
      }

      const response = await fetch(`${this.config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.ollama.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
          }
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Model '${this.config.ollama.model}' not found. Please install it with: ollama pull ${this.config.ollama.model}`)
        }
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(`Ollama is not running. Please start Ollama or check if it's installed. Visit https://ollama.ai/ for installation instructions.`)
      }
      throw error
    }
  }

  async callLocalAI(prompt) {
    const response = await fetch(`${this.config.localai.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.localai.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`LocalAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openai.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.openai.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async extractSpecsFromText(text) {
    try {
      const response = await this.callLLM(EXTRACTION_PROMPT, text)
      
      // Debug: Log the raw response
      console.log('LLM Raw Response:', response)
      
      // Try to parse the JSON response
      let parsedData
      try {
        // Clean up the response - remove any non-JSON text
        let jsonString = response.trim()
        
        // Remove markdown code blocks if present
        const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonString = jsonMatch[1]
        }
        
        // Find the first { and last } to extract just the JSON
        const firstBrace = jsonString.indexOf('{')
        const lastBrace = jsonString.lastIndexOf('}')
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1)
        }
        
        console.log('Cleaned JSON string:', jsonString)
        
        // Try to parse the cleaned JSON
        parsedData = JSON.parse(jsonString)
        
        // Validate that we have a proper structure
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('Invalid JSON structure')
        }
        
        console.log('Successfully parsed JSON:', parsedData)
        
      } catch (parseError) {
        console.error('Failed to parse LLM response as JSON:', parseError)
        console.log('Raw response:', response)
        console.log('Attempted to parse:', jsonString)
        return null
      }

      return parsedData
    } catch (error) {
      console.error('Error extracting specs from text:', error)
      return null
    }
  }

  async parseLogEntry(logEntry) {
    if (!logEntry.content && !logEntry.image_description) {
      return null
    }

    const textToAnalyze = [
      logEntry.content,
      logEntry.image_description,
      logEntry.video_description
    ].filter(Boolean).join('\n\n')

    return await this.extractSpecsFromText(textToAnalyze)
  }

  async parseImageDescription(imageDescription) {
    if (!imageDescription) {
      return null
    }

    return await this.extractSpecsFromText(imageDescription)
  }

  async parseProjectLogs(projectId) {
    try {
      // Fetch all logs for the project
      const { data: logs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (logsError) throw logsError

      // Fetch all images for the project
      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (imagesError) throw imagesError

      // Fetch all videos for the project
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (videosError) throw videosError

      // Parse all content
      const allSpecs = []
      
      // Parse logs
      for (const log of logs) {
        const specs = await this.parseLogEntry(log)
        if (specs) {
          allSpecs.push({
            source: 'log',
            sourceId: log.id,
            content: log.content,
            specs: specs,
            timestamp: log.created_at
          })
        }
      }

      // Parse images
      for (const image of images) {
        if (image.image_description) {
          const specs = await this.parseImageDescription(image.image_description)
          if (specs) {
            allSpecs.push({
              source: 'image',
              sourceId: image.id,
              content: image.image_description,
              specs: specs,
              timestamp: image.created_at
            })
          }
        }
      }

      // Parse videos
      for (const video of videos) {
        if (video.video_description) {
          const specs = await this.parseImageDescription(video.video_description)
          if (specs) {
            allSpecs.push({
              source: 'video',
              sourceId: video.id,
              content: video.video_description,
              specs: specs,
              timestamp: video.created_at
            })
          }
        }
      }

      return allSpecs
    } catch (error) {
      console.error('Error parsing project logs:', error)
      throw error
    }
  }

  // Merge multiple spec extractions into a single comprehensive spec sheet
  mergeSpecs(specsArray) {
    const merged = {
      vehicle_info: {},
      motor_engine: {},
      drivetrain: {},
      suspension: {},
      electronics: {},
      body_chassis: {},
      performance: {},
      modifications: {}
    }

    // Sort by timestamp to prioritize newer information
    const sortedSpecs = specsArray.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )

    // Merge specs, with newer entries taking precedence
    for (const specData of sortedSpecs) {
      for (const category in specData.specs) {
        if (specData.specs[category]) {
          for (const field in specData.specs[category]) {
            if (specData.specs[category][field]) {
              merged[category][field] = specData.specs[category][field]
            }
          }
        }
      }
    }

    return merged
  }

  async autoPopulateBuildSpecs(projectId) {
    try {
      const extractedSpecs = await this.parseProjectLogs(projectId)
      
      if (extractedSpecs.length === 0) {
        return null
      }

      const mergedSpecs = this.mergeSpecs(extractedSpecs)
      
      // Update the build spec sheet with extracted data
      const { data, error } = await supabase
        .from('build_spec_sheets')
        .upsert({
          project_id: projectId,
          ...mergedSpecs.vehicle_info,
          ...mergedSpecs.motor_engine,
          ...mergedSpecs.drivetrain,
          ...mergedSpecs.suspension,
          ...mergedSpecs.electronics,
          ...mergedSpecs.body_chassis,
          ...mergedSpecs.performance,
          ...mergedSpecs.modifications
        })
        .select()

      if (error) throw error

      return {
        extractedSpecs,
        mergedSpecs,
        buildSpecSheet: data[0]
      }
    } catch (error) {
      console.error('Error auto-populating build specs:', error)
      throw error
    }
  }

  async checkAvailableModels() {
    try {
      if (this.config.provider !== 'ollama') {
        return { available: false, message: 'Model check only available for Ollama' }
      }

      const response = await fetch(`${this.config.ollama.baseUrl}/api/tags`)
      if (!response.ok) {
        return { available: false, message: `Failed to check models: ${response.status}` }
      }

      const data = await response.json()
      const models = data.models || []
      const currentModel = this.config.ollama.model
      const modelExists = models.some(model => model.name === currentModel)

      return {
        available: true,
        models: models.map(m => m.name),
        currentModel,
        modelExists,
        message: modelExists 
          ? `Model '${currentModel}' is available` 
          : `Model '${currentModel}' not found. Available: ${models.map(m => m.name).join(', ')}`
      }
    } catch (error) {
      return { 
        available: false, 
        message: `Error checking models: ${error.message}` 
      }
    }
  }
}

export const llmParser = new LLMParser() 