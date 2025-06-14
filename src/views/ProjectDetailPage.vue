<template>
  <div v-if="project" class="project-detail">
    <h2>{{ project.name }}</h2>
    <p>{{ project.description }}</p>
    
    <!-- Add New Log Entry -->
    <div class="add-log-entry">
      <button class="add-button" @click="showAddLogModal = true">
        <span class="button-icon">➕</span>
        Add Log Entry
      </button>
    </div>

    <!-- Log Entries Feed -->
    <div class="log-feed">
      <LogItem
        v-for="(log, index) in projectLogs"
        :key="index"
        :logItem="log"
        @update="updateLogEntry(index, $event)"
      />
    </div>

    <!-- Add/Edit Log Modal -->
    <div v-if="showAddLogModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editingLog ? 'Edit Log Entry' : 'Add New Log Entry' }}</h3>
        
        <!-- Image Upload -->
        <div class="form-group">
          <label for="image-upload" class="upload-label">
            <span class="upload-icon">📁</span>
            <span>Add Image</span>
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            @change="handleImageUpload"
            class="file-input"
          />
          <div v-if="newLogImage || editingLog?.image_url" class="image-preview">
            <img :src="newLogImage?.url || editingLog?.image_url" :alt="newLogImage?.description || 'Log image'" />
          </div>
        </div>

        <!-- Video Upload -->
        <div class="form-group">
          <label for="video-upload" class="upload-label">
            <span class="upload-icon">📹</span>
            <span>Add Video</span>
          </label>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            @change="handleVideoUpload"
            class="file-input"
          />
          <video v-if="newLogVideo || editingLog?.video_url" controls class="preview-video">
            <source :src="newLogVideo?.url || editingLog?.video_url" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea
            id="notes"
            v-model="newLogNotes"
            placeholder="Add your notes here..."
            class="notes-input"
          ></textarea>
        </div>

        <!-- Links -->
        <div class="form-group">
          <label>Links</label>
          <div v-for="(link, index) in newLogLinks" :key="index" class="link-input">
            <input
              type="text"
              v-model="link.url"
              placeholder="URL"
              class="link-url"
            />
            <input
              type="text"
              v-model="link.title"
              placeholder="Title (optional)"
              class="link-title"
            />
            <button @click="removeLink(index)" class="remove-button">×</button>
          </div>
          <button @click="addLink" class="add-link-button">Add Link</button>
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label>Tags</label>
          <div class="tags-input">
            <input
              type="text"
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              placeholder="Add tags (press Enter)"
              class="tag-input"
            />
            <div class="tags-list">
              <span v-for="(tag, index) in newLogTags" :key="index" class="tag">
                #{{ tag }}
                <button @click="removeTag(index)" class="remove-tag">×</button>
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button @click="saveLogEntry" class="save-button">{{ editingLog ? 'Save Changes' : 'Save Entry' }}</button>
          <button @click="showAddLogModal = false" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Project not found.</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '../store/dataStore'
import LogItem from '../components/LogItem.vue'
import { supabase } from '../lib/supabase'

const dataStore = useDataStore()
const route = useRoute()
const projectId = route.params.id

const project = computed(() => {
  return dataStore.getProjects.find(p => p.id === projectId)
})

const projectLogs = computed(() => {
  return dataStore.logs
})

// New log entry state
const showAddLogModal = ref(false)
const newLogImage = ref(null)
const newLogVideo = ref(null)
const newLogNotes = ref('')
const newLogLinks = ref([])
const newLogTags = ref([])
const newTag = ref('')
const editingLog = ref(null)

// Fetch logs when component mounts
onMounted(async () => {
  if (projectId) {
    await dataStore.fetchLogs(projectId)
  }
})

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${projectId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath)

    newLogImage.value = {
      url: publicUrl,
      description: file.name
    }
  } catch (error) {
    console.error('Error uploading image:', error)
  }
}

const handleVideoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Check if file is a video
  if (!file.type.startsWith('video/')) {
    alert('Please upload a video file')
    return
  }

  // Check file size (limit to 100MB)
  if (file.size > 100 * 1024 * 1024) {
    alert('Video file size must be less than 100MB')
    return
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${projectId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath)

    newLogVideo.value = {
      url: publicUrl,
      description: file.name
    }
  } catch (error) {
    console.error('Error uploading video:', error)
  }
}

const addLink = () => {
  newLogLinks.value.push({ url: '', title: '' })
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

const updateLogEntry = async (index, updatedLog) => {
  editingLog.value = updatedLog
  showAddLogModal.value = true
}

const saveLogEntry = async () => {
  if (!newLogNotes.value) {
    alert("Please fill in all required fields")
    return
  }

  try {
    if (editingLog.value) {
      await dataStore.updateLog(editingLog.value.id, {
        title: newLogNotes.value.substring(0, 100),
        content: newLogNotes.value,
        image_url: newLogImage.value?.url,
        video_url: newLogVideo.value?.url,
        links: newLogLinks.value.filter(link => link.url.trim()),
        tags: newLogTags.value
      })
    } else {
      await dataStore.addLog({
        project_id: projectId,
        title: newLogNotes.value.substring(0, 100),
        content: newLogNotes.value,
        image_url: newLogImage.value?.url,
        video_url: newLogVideo.value?.url,
        links: newLogLinks.value.filter(link => link.url.trim()),
        tags: newLogTags.value
      })
    }

    // Reset form
    newLogImage.value = null
    newLogVideo.value = null
    newLogNotes.value = ''
    newLogLinks.value = []
    newLogTags.value = []
    editingLog.value = null
    showAddLogModal.value = false
  } catch (error) {
    console.error('Error saving log entry:', error)
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.add-log-entry {
  margin: 20px 0;
}

.add-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #45a049;
}

.button-icon {
  margin-right: 8px;
}

.log-feed {
  margin-top: 20px;
}

/* Modal Styles */
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
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.notes-input {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.link-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.link-url, .link-title {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.link-url {
  flex: 2;
}

.link-title {
  flex: 1;
}

.remove-button {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2em;
}

.add-link-button {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  padding: 4px 8px;
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.9em;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-tag {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.save-button, .cancel-button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.cancel-button {
  background: none;
  border: 1px solid #ddd;
  color: #666;
}

.image-preview {
  margin-top: 8px;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.preview-video {
  max-width: 100%;
  max-height: 200px;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
}

@media (max-width: 768px) {
  .project-detail {
    padding: 10px;
  }

  .modal-content {
    width: 95%;
    padding: 16px;
  }
}
</style>
