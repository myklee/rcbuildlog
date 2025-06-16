<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>{{ editingLog ? 'Edit Log Entry' : 'Add New Log Entry' }}</h3>
      <form @submit.prevent="saveLogEntry">
        <div class="form-group">
          <label for="notes">Notes *</label>
          <textarea
            id="notes"
            v-model="newLogNotes"
            required
            rows="4"
            placeholder="Enter your notes here..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Image</label>
          <div class="upload-container">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
              ref="imageInput"
            />
            <button type="button" @click="$refs.imageInput.click()" class="upload-btn">
              Choose Image
            </button>
            <div v-if="newLogImage" class="preview-container">
              <img :src="newLogImage.url" alt="Preview" class="preview-image" />
              <button type="button" @click="removeImage" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Video</label>
          <div class="upload-container">
            <input
              type="file"
              accept="video/*"
              @change="handleVideoUpload"
              class="hidden"
              ref="videoInput"
            />
            <button type="button" @click="$refs.videoInput.click()" class="upload-btn">
              Choose Video
            </button>
            <div v-if="newLogVideo" class="preview-container">
              <video :src="newLogVideo.url" controls class="preview-video"></video>
              <button type="button" @click="removeVideo" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Links</label>
          <div v-for="(link, index) in newLogLinks" :key="index" class="link-item">
            <input
              type="text"
              v-model="link.url"
              placeholder="Enter URL"
              class="link-input"
            />
            <button type="button" @click="removeLink(index)" class="remove-btn">×</button>
          </div>
          <button type="button" @click="addLink" class="add-btn">Add Link</button>
        </div>

        <div class="form-group">
          <label>Tags</label>
          <div class="tags-container">
            <div v-for="(tag, index) in newLogTags" :key="index" class="tag">
              {{ tag }}
              <button type="button" @click="removeTag(index)" class="remove-btn">×</button>
            </div>
          </div>
          <div class="tag-input-container">
            <input
              type="text"
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              placeholder="Add a tag and press Enter"
              class="tag-input"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn">Save Entry</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDataStore } from '../store/dataStore'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  editingLog: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const dataStore = useDataStore()

// Form state
const newLogImage = ref(null)
const newLogVideo = ref(null)
const newLogNotes = ref('')
const newLogLinks = ref([])
const newLogTags = ref([])
const newTag = ref('')

// Initialize form if editing
onMounted(() => {
  if (props.editingLog) {
    newLogNotes.value = props.editingLog.content
    newLogImage.value = props.editingLog.image_url ? { url: props.editingLog.image_url } : null
    newLogVideo.value = props.editingLog.video_url ? { url: props.editingLog.video_url } : null
    newLogLinks.value = props.editingLog.links || []
    newLogTags.value = props.editingLog.tags || []
  }
})

// Watch for changes in editingLog prop
watch(() => props.editingLog, (newLog) => {
  if (newLog) {
    newLogNotes.value = newLog.content
    newLogImage.value = newLog.image_url ? { url: newLog.image_url } : null
    newLogVideo.value = newLog.video_url ? { url: newLog.video_url } : null
    newLogLinks.value = newLog.links || []
    newLogTags.value = newLog.tags || []
  } else {
    resetForm()
  }
})

const closeModal = () => {
  emit('close')
}

const resetForm = () => {
  newLogImage.value = null
  newLogVideo.value = null
  newLogNotes.value = ''
  newLogLinks.value = []
  newLogTags.value = []
  newTag.value = ''
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newLogImage.value = {
        file,
        url: e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newLogVideo.value = {
        file,
        url: e.target.result
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  newLogImage.value = null
}

const removeVideo = () => {
  newLogVideo.value = null
}

const addLink = () => {
  newLogLinks.value.push({ url: '' })
}

const removeLink = (index) => {
  newLogLinks.value.splice(index, 1)
}

const addTag = () => {
  if (newTag.value.trim()) {
    newLogTags.value.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (index) => {
  newLogTags.value.splice(index, 1)
}

const saveLogEntry = async () => {
  if (!newLogNotes.value) {
    alert("Please fill in all required fields")
    return
  }

  try {
    const logData = {
      project_id: props.projectId,
      title: newLogNotes.value.substring(0, 100),
      content: newLogNotes.value,
      image_url: newLogImage.value?.url,
      video_url: newLogVideo.value?.url,
      links: newLogLinks.value.filter(link => link.url.trim()),
      tags: newLogTags.value
    }

    if (props.editingLog) {
      await dataStore.updateLog(props.editingLog.id, logData)
    } else {
      await dataStore.addLog(logData)
    }

    emit('saved')
    resetForm()
  } catch (error) {
    console.error('Error saving log entry:', error)
    alert('Failed to save log entry. Please try again.')
  }
}
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
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.upload-container {
  margin-top: 0.5rem;
}

.hidden {
  display: none;
}

.upload-btn {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.preview-container {
  margin-top: 1rem;
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
}

.preview-video {
  max-width: 300px;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-btn {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  margin-top: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-input-container {
  margin-top: 0.5rem;
}

.tag-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.save-btn:hover {
  background: #2563eb;
}
</style> 