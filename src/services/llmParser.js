import { LLM_CONFIG } from '../config/llm'
import { supabase } from '../lib/supabase'

const EXTRACTION_PROMPT = `
Extract the RC build specifications from the following text and return them as a JSON object with these categories:
vehicle_info, motor_engine, drivetrain, suspension, electronics, body_chassis, performance, modifications.
Only return valid JSON. Text:
{text}
`

class LLMParser {
  constructor() {
    this.config = LLM_CONFIG
  }

  async callOpenRouter(prompt, text) {
    const fullPrompt = prompt.replace('{text}', text)
    const response = await fetch(`${this.config.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openrouter.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RC Build Log'
      },
      body: JSON.stringify({
        model: this.config.openrouter.model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async extractSpecsFromText(text) {
    try {
      const response = await this.callOpenRouter(EXTRACTION_PROMPT, text)
      // Clean and parse JSON as before
      let jsonString = response.trim()
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
      const firstBrace = jsonString.indexOf('{')
      const lastBrace = jsonString.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1)
      }
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error extracting specs from text:', error)
      return null
    }
  }

  async parseLogEntry(logEntry) {
    if (!logEntry.content && !logEntry.image_description) return null
    const textToAnalyze = [
      logEntry.content,
      logEntry.image_description,
      logEntry.video_description
    ].filter(Boolean).join('\n\n')
    return await this.extractSpecsFromText(textToAnalyze)
  }

  async parseImageDescription(imageDescription) {
    if (!imageDescription) return null
    return await this.extractSpecsFromText(imageDescription)
  }

  async parseProjectLogs(projectId) {
    try {
      const { data: logs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (logsError) throw logsError

      const { data: images, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (imagesError) throw imagesError

      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      if (videosError) throw videosError

      const allSpecs = []
      for (const log of logs) {
        const specs = await this.parseLogEntry(log)
        if (specs) {
          allSpecs.push({
            source: 'log',
            sourceId: log.id,
            content: log.content,
            specs,
            timestamp: log.created_at
          })
        }
      }
      for (const image of images) {
        if (image.image_description) {
          const specs = await this.parseImageDescription(image.image_description)
          if (specs) {
            allSpecs.push({
              source: 'image',
              sourceId: image.id,
              content: image.image_description,
              specs,
              timestamp: image.created_at
            })
          }
        }
      }
      for (const video of videos) {
        if (video.video_description) {
          const specs = await this.parseImageDescription(video.video_description)
          if (specs) {
            allSpecs.push({
              source: 'video',
              sourceId: video.id,
              content: video.video_description,
              specs,
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
    const sortedSpecs = specsArray.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )
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
      if (extractedSpecs.length === 0) return null
      const mergedSpecs = this.mergeSpecs(extractedSpecs)
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
}

export const llmParser = new LLMParser()