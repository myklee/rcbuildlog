<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>AI Build Spec Parser</h3>
        <button @click="closeModal" class="close-btn">
          <Icon name="close" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="parser-status">
          <div class="status-section">
            <h4>LLM Configuration</h4>
            <div class="config-info">
              <p><strong>Provider:</strong> {{ llmConfig.provider }}</p>
              <p v-if="llmConfig.provider === 'ollama'">
                <strong>Model:</strong> {{ llmConfig.ollama.model }}
              </p>
              <p v-if="llmConfig.provider === 'localai'">
                <strong>Model:</strong> {{ llmConfig.localai.model }}
              </p>
              <p v-if="llmConfig.provider === 'openai'">
                <strong>Model:</strong> {{ llmConfig.openai.model }}
              </p>
            </div>
          </div>

          <div class="status-section">
            <h4>Project Content</h4>
            <div class="content-summary">
              <p><strong>Log Entries:</strong> {{ contentStats.logs }} entries</p>
              <p><strong>Images:</strong> {{ contentStats.images }} images</p>
              <p><strong>Videos:</strong> {{ contentStats.videos }} videos</p>
              <p><strong>Total Items:</strong> {{ contentStats.total }} items</p>
            </div>
          </div>
        </div>

        <div class="parser-actions">
          <button 
            @click="testConnection" 
            :disabled="isProcessing"
            class="action-btn test-btn"
          >
            {{ isProcessing ? 'Testing...' : 'Test LLM Connection' }}
          </button>
          
          <button 
            @click="showSetupGuide = true"
            class="action-btn setup-btn"
          >
            Setup Guide
          </button>
          
          <button 
            @click="checkModels"
            :disabled="isProcessing"
            class="action-btn check-btn"
          >
            {{ isProcessing ? 'Checking...' : 'Check Models' }}
          </button>
          
          <button 
            @click="parseSingleEntry" 
            :disabled="isProcessing || !selectedEntry"
            class="action-btn parse-btn"
          >
            {{ isProcessing ? 'Parsing...' : 'Parse Selected Entry' }}
          </button>
          
          <button 
            @click="parseAllContent" 
            :disabled="isProcessing"
            class="action-btn parse-all-btn"
          >
            {{ isProcessing ? 'Parsing All Content...' : 'Parse All Project Content' }}
          </button>
          
          <button 
            @click="autoPopulateSpecs" 
            :disabled="isProcessing"
            class="action-btn auto-populate-btn"
          >
            {{ isProcessing ? 'Auto-Populating...' : 'Auto-Populate Build Specs' }}
          </button>
        </div>

        <div v-if="selectedEntry" class="entry-selector">
          <h4>Select Entry to Parse</h4>
          <select v-model="selectedEntry" class="entry-select">
            <option value="">Choose an entry...</option>
            <optgroup label="Log Entries">
              <option 
                v-for="log in logs" 
                :key="`log-${log.id}`" 
                :value="{ type: 'log', data: log }"
              >
                {{ log.title || log.content?.substring(0, 50) }}...
              </option>
            </optgroup>
            <optgroup label="Images">
              <option 
                v-for="image in images" 
                :key="`image-${image.id}`" 
                :value="{ type: 'image', data: image }"
              >
                {{ image.image_description || 'Image' }}...
              </option>
            </optgroup>
            <optgroup label="Videos">
              <option 
                v-for="video in videos" 
                :key="`video-${video.id}`" 
                :value="{ type: 'video', data: video }"
              >
                {{ video.video_description || 'Video' }}...
              </option>
            </optgroup>
          </select>
        </div>

        <div v-if="parsingResults.length > 0" class="parsing-results">
          <h4>Parsing Results</h4>
          <div class="results-list">
            <div 
              v-for="(result, index) in parsingResults" 
              :key="index"
              class="result-item"
            >
              <div class="result-header">
                <span class="result-source">{{ result.source }}</span>
                <span class="result-timestamp">{{ formatDate(result.timestamp) }}</span>
              </div>
              <div class="result-content">
                <p class="result-text">{{ result.content.substring(0, 100) }}...</p>
              </div>
              <div class="result-specs">
                <details>
                  <summary>Extracted Specs</summary>
                  <pre class="specs-json">{{ JSON.stringify(result.specs, null, 2) }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          <h4>Error</h4>
          <p>{{ error }}</p>
        </div>

        <div v-if="successMessage" class="success-message">
          <h4>Success</h4>
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Setup Guide Modal -->
    <div v-if="showSetupGuide" class="modal-overlay setup-guide-overlay" @click="showSetupGuide = false">
      <div class="modal-content setup-guide-content" @click.stop>
        <div class="modal-header">
          <h3>LLM Setup Guide</h3>
          <button @click="showSetupGuide = false" class="close-btn">
            <Icon name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="setup-section">
            <h4>Option 1: Ollama (Recommended - Local)</h4>
            <ol>
              <li>Visit <a href="https://ollama.ai/" target="_blank">ollama.ai</a> and download for your platform</li>
              <li>Install and start Ollama</li>
              <li>Open terminal/command prompt and run:</li>
              <li><code>ollama pull llama2:7b</code></li>
              <li>Start Ollama service: <code>ollama serve</code></li>
            </ol>
          </div>

          <div class="setup-section">
            <h4>Option 2: OpenAI (Cloud - Requires API Key)</h4>
            <ol>
              <li>Get an API key from <a href="https://platform.openai.com/" target="_blank">OpenAI Platform</a></li>
              <li>Create a <code>.env</code> file in your project root</li>
              <li>Add: <code>VITE_OPENAI_API_KEY=your_api_key_here</code></li>
              <li>Change provider to 'openai' in <code>src/config/llm.js</code></li>
            </ol>
          </div>

          <div class="setup-section">
            <h4>Option 3: LocalAI</h4>
            <ol>
              <li>Visit <a href="https://localai.io/" target="_blank">localai.io</a> for installation</li>
              <li>Configure your models in LocalAI</li>
              <li>Start service on port 8080</li>
              <li>Change provider to 'localai' in <code>src/config/llm.js</code></li>
            </ol>
          </div>

          <div class="setup-section">
            <h4>Configuration</h4>
            <p>Edit <code>src/config/llm.js</code> to change the provider or model:</p>
            <pre><code>export const LLM_CONFIG = {
  provider: 'ollama', // or 'openai', 'localai'
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama2:7b'
  }
}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { llmParser } from '../services/llmParser'
import { supabase } from '../lib/supabase'
import Icon from './Icon.vue'

const props = defineProps({
  show: Boolean,
  projectId: String
})

const emit = defineEmits(['close', 'specs-updated'])

// State
const isProcessing = ref(false)
const error = ref('')
const successMessage = ref('')
const selectedEntry = ref('')
const parsingResults = ref([])
const logs = ref([])
const images = ref([])
const videos = ref([])
const showSetupGuide = ref(false)

// LLM Configuration
const llmConfig = computed(() => ({
  provider: 'ollama', // This should come from a config or settings
  ollama: { model: 'llama2:7b' },
  localai: { model: 'llama2' },
  openai: { model: 'gpt-3.5-turbo' }
}))

// Content statistics
const contentStats = computed(() => ({
  logs: logs.value.length,
  images: images.value.length,
  videos: videos.value.length,
  total: logs.value.length + images.value.length + videos.value.length
}))

// Methods
const closeModal = () => {
  emit('close')
  resetState()
}

const resetState = () => {
  error.value = ''
  successMessage.value = ''
  selectedEntry.value = ''
  parsingResults.value = []
  isProcessing.value = false
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchProjectContent = async () => {
  try {
    const [logsData, imagesData, videosData] = await Promise.all([
      supabase.from('logs').select('*').eq('project_id', props.projectId).order('created_at', { ascending: false }),
      supabase.from('images').select('*').eq('project_id', props.projectId).order('created_at', { ascending: false }),
      supabase.from('videos').select('*').eq('project_id', props.projectId).order('created_at', { ascending: false })
    ])

    logs.value = logsData.data || []
    images.value = imagesData.data || []
    videos.value = videosData.data || []
  } catch (err) {
    console.error('Error fetching project content:', err)
    error.value = 'Failed to fetch project content'
  }
}

const testConnection = async () => {
  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const testText = "My RC car has a 3650 brushless motor with 3200KV, running on 3S LiPo battery."
    const result = await llmParser.extractSpecsFromText(testText)
    
    if (result) {
      successMessage.value = 'LLM connection successful! Test extraction completed.'
      console.log('Test extraction result:', result)
    } else {
      error.value = 'LLM connection failed - no valid response received'
    }
  } catch (err) {
    console.error('LLM connection test failed:', err)
    error.value = `LLM connection failed: ${err.message}`
    
    // Provide specific guidance based on the error
    if (err.message.includes('Ollama is not running')) {
      error.value += '\n\nTo fix this:\n1. Install Ollama from https://ollama.ai/\n2. Start Ollama: ollama serve\n3. Pull a model: ollama pull llama2:7b'
    } else if (err.message.includes('LocalAI')) {
      error.value += '\n\nTo fix this:\n1. Install LocalAI from https://localai.io/\n2. Start LocalAI service\n3. Configure your models'
    } else if (err.message.includes('OpenAI')) {
      error.value += '\n\nTo fix this:\n1. Get an API key from https://platform.openai.com/\n2. Add VITE_OPENAI_API_KEY=your_key to .env file'
    } else if (err.message.includes('not installed') || err.message.includes('not found')) {
      error.value += '\n\nTo fix this:\n1. Run: ollama pull llama2:7b\n2. Or change the model in src/config/llm.js'
    }
  } finally {
    isProcessing.value = false
  }
}

const checkModels = async () => {
  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await llmParser.checkAvailableModels()
    
    if (result.available) {
      if (result.modelExists) {
        successMessage.value = `✅ ${result.message}\n\nAvailable models: ${result.models.join(', ')}`
      } else {
        error.value = `❌ ${result.message}\n\nTo install the current model: ollama pull ${result.currentModel}`
      }
    } else {
      error.value = `❌ ${result.message}`
    }
  } catch (err) {
    console.error('Model check failed:', err)
    error.value = `Model check failed: ${err.message}`
  } finally {
    isProcessing.value = false
  }
}

const parseSingleEntry = async () => {
  if (!selectedEntry.value) return

  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const entry = selectedEntry.value
    let result

    if (entry.type === 'log') {
      result = await llmParser.parseLogEntry(entry.data)
    } else if (entry.type === 'image') {
      result = await llmParser.parseImageDescription(entry.data.image_description)
    } else if (entry.type === 'video') {
      result = await llmParser.parseImageDescription(entry.data.video_description)
    }

    if (result) {
      parsingResults.value = [{
        source: `${entry.type} - ${entry.data.id}`,
        sourceId: entry.data.id,
        content: entry.type === 'log' ? entry.data.content : 
                entry.type === 'image' ? entry.data.image_description : 
                entry.data.video_description,
        specs: result,
        timestamp: entry.data.created_at
      }]
      successMessage.value = 'Entry parsed successfully!'
    } else {
      error.value = 'No specifications found in the selected entry'
    }
  } catch (err) {
    console.error('Error parsing single entry:', err)
    error.value = `Parsing failed: ${err.message}`
  } finally {
    isProcessing.value = false
  }
}

const parseAllContent = async () => {
  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const results = await llmParser.parseProjectLogs(props.projectId)
    parsingResults.value = results
    successMessage.value = `Parsed ${results.length} entries successfully!`
  } catch (err) {
    console.error('Error parsing all content:', err)
    error.value = `Parsing failed: ${err.message}`
  } finally {
    isProcessing.value = false
  }
}

const autoPopulateSpecs = async () => {
  isProcessing.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await llmParser.autoPopulateBuildSpecs(props.projectId)
    
    if (result) {
      successMessage.value = `Auto-populated build specs with ${result.extractedSpecs.length} parsed entries!`
      emit('specs-updated', result.buildSpecSheet)
    } else {
      error.value = 'No content found to parse for build specs'
    }
  } catch (err) {
    console.error('Error auto-populating specs:', err)
    error.value = `Auto-population failed: ${err.message}`
  } finally {
    isProcessing.value = false
  }
}

// Watch for modal show/hide
watch(() => props.show, (newVal) => {
  if (newVal && props.projectId) {
    fetchProjectContent()
  }
})

onMounted(() => {
  if (props.show && props.projectId) {
    fetchProjectContent()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.parser-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-section {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
}

.status-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.config-info p, .content-summary p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.parser-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-btn {
  background: #f3f4f6;
  color: #374151;
}

.test-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.parse-btn {
  background: #dbeafe;
  color: #1e40af;
}

.parse-btn:hover:not(:disabled) {
  background: #bfdbfe;
}

.parse-all-btn {
  background: #d1fae5;
  color: #065f46;
}

.parse-all-btn:hover:not(:disabled) {
  background: #a7f3d0;
}

.auto-populate-btn {
  background: #fef3c7;
  color: #92400e;
}

.auto-populate-btn:hover:not(:disabled) {
  background: #fde68a;
}

.setup-btn {
  background: #e0e7ff;
  color: #3730a3;
}

.setup-btn:hover:not(:disabled) {
  background: #c7d2fe;
}

.check-btn {
  background: #f0f9ff;
  color: #0369a1;
}

.check-btn:hover:not(:disabled) {
  background: #e0f2fe;
}

.entry-selector {
  margin-bottom: 2rem;
}

.entry-selector h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.entry-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.parsing-results {
  margin-top: 2rem;
}

.parsing-results h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.result-source {
  font-weight: 600;
  color: #374151;
}

.result-timestamp {
  font-size: 0.875rem;
  color: #6b7280;
}

.result-content {
  margin-bottom: 0.75rem;
}

.result-text {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.result-specs details {
  font-size: 0.875rem;
}

.result-specs summary {
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.specs-json {
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-message, .success-message {
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.error-message h4, .success-message h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.error-message p, .success-message p {
  margin: 0;
  font-size: 0.875rem;
}

/* Setup Guide Modal */
.setup-guide-overlay {
  z-index: 1100;
}

.setup-guide-content {
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}

.setup-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.setup-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.setup-section ol {
  margin: 0;
  padding-left: 1.5rem;
}

.setup-section li {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.setup-section a {
  color: #3b82f6;
  text-decoration: none;
}

.setup-section a:hover {
  text-decoration: underline;
}

.setup-section code {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.setup-section pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.setup-section pre code {
  background: none;
  padding: 0;
  color: inherit;
}
</style> 