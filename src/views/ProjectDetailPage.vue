<template>
  <div v-if="project" class="project-detail">
    <div class="project-header">
      <h1>{{ project.name }}</h1>
      <p class="description">{{ project.description }}</p>
    </div>

    <div class="add-entry-buttons">
      <button class="add-button" @click="showLogTextModal = true">Add Log Entry</button>
      <button class="add-button" @click="showImageModal = true">Add Image</button>
      <button class="add-button" @click="showVideoModal = true">Add Video</button>
    </div>

    <!-- Combined Log Entries -->
    <div class="log-entries">
      <LogItem
        v-for="log in allLogs"
        :key="log.id"
        :logItem="log"
        @edit="showEditLogModal"
        @delete="confirmDeleteLog"
      />
    </div>

    <!-- Images Section -->
    <div v-if="images.length" class="media-section">
      <h2>Images</h2>
      <div class="media-list">
        <div v-for="img in images" :key="img.id" class="media-item">
          <img :src="img.image_url" alt="Project Image" class="media-img" />
          <div class="media-desc">{{ img.image_description }}</div>
          <div class="media-actions">
            <button class="edit-btn" @click="showEditImageModal(img)">Edit</button>
            <button class="delete-btn" @click="confirmDeleteImage(img)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Videos Section -->
    <div v-if="videos.length" class="media-section">
      <h2>Videos</h2>
      <div class="media-list">
        <div v-for="vid in videos" :key="vid.id" class="media-item">
          <video :src="vid.video_url" controls class="media-video"></video>
          <div class="media-desc">{{ vid.video_description }}</div>
          <div class="media-actions">
            <button class="edit-btn" @click="showEditVideoModal(vid)">Edit</button>
            <button class="delete-btn" @click="confirmDeleteVideo(vid)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <LogTextModal
      :show="showLogTextModal"
      :projectId="projectId"
      @close="showLogTextModal = false"
      @saved="handleLogSaved"
    />
    <ImageUploadModal
      :show="showImageModal"
      :projectId="projectId"
      @close="showImageModal = false"
      @saved="handleImageSaved"
    />
    <VideoUploadModal
      :show="showVideoModal"
      :projectId="projectId"
      @close="showVideoModal = false"
      @saved="handleVideoSaved"
    />
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
import LogTextModal from '../components/LogTextModal.vue'
import ImageUploadModal from '../components/ImageUploadModal.vue'
import VideoUploadModal from '../components/VideoUploadModal.vue'

const route = useRoute()
const dataStore = useDataStore()
const projectId = computed(() => route.params.id)

const project = computed(() => {
  return dataStore.getProjects.find(p => p.id === projectId.value)
})

// Modal state
const showLogTextModal = ref(false)
const showImageModal = ref(false)
const showVideoModal = ref(false)
const editingLog = ref(null)

const images = ref([])
const videos = ref([])

onMounted(async () => {
  if (projectId.value) {
    await dataStore.fetchLogs(projectId.value)
    images.value = await dataStore.fetchImages(projectId.value)
    videos.value = await dataStore.fetchVideos(projectId.value)
  }
})

const showAddLogModal = () => {
  editingLog.value = null
  showLogTextModal.value = true
}

const showEditLogModal = (log) => {
  editingLog.value = log
  showLogTextModal.value = true
}

const handleLogSaved = async () => {
  await dataStore.fetchLogs(projectId.value)
  showLogTextModal.value = false
}

const handleImageSaved = async () => {
  images.value = await dataStore.fetchImages(projectId.value)
  showImageModal.value = false
}

const handleVideoSaved = async () => {
  videos.value = await dataStore.fetchVideos(projectId.value)
  showVideoModal.value = false
}

// Convert images and videos to log entries format
const allLogs = computed(() => {
  const imageLogs = images.value.map(img => ({
    id: img.id,
    type: 'image',
    content: img.image_url,
    description: img.image_description,
    created_at: img.created_at,
    user_id: img.user_id
  }))

  const videoLogs = videos.value.map(vid => ({
    id: vid.id,
    type: 'video',
    content: vid.video_url,
    description: vid.video_description,
    created_at: vid.created_at,
    user_id: vid.user_id
  }))

  const textLogs = dataStore.getLogs.map(log => ({
    ...log,
    type: 'text'
  }))

  // Combine and sort all logs by created_at
  return [...textLogs, ...imageLogs, ...videoLogs].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )
})

const confirmDeleteLog = async (log) => {
  if (confirm('Are you sure you want to delete this entry?')) {
    try {
      if (log.type === 'text') {
        await dataStore.deleteLog(log.id)
        await dataStore.fetchLogs(projectId.value)
      } else if (log.type === 'image') {
        await dataStore.deleteImage(log.id)
        images.value = await dataStore.fetchImages(projectId.value)
      } else if (log.type === 'video') {
        await dataStore.deleteVideo(log.id)
        videos.value = await dataStore.fetchVideos(projectId.value)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }
}

const showEditImageModal = (img) => {
  // Implement if you want to support editing images
}

const confirmDeleteImage = async (img) => {
  if (confirm('Are you sure you want to delete this image?')) {
    try {
      await dataStore.deleteImage(img.id)
      images.value = await dataStore.fetchImages(projectId.value)
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }
}

const showEditVideoModal = (vid) => {
  // Implement if you want to support editing videos
}

const confirmDeleteVideo = async (vid) => {
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      await dataStore.deleteVideo(vid.id)
      videos.value = await dataStore.fetchVideos(projectId.value)
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.project-header {
  margin-bottom: 2rem;
}

.project-header h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  font-size: 1.1rem;
}

.add-entry-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.add-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #2563eb;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.media-section {
  margin-top: 2rem;
}

.media-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.media-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
}

.media-img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.media-video {
  max-width: 300px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.media-desc {
  font-size: 0.95rem;
  color: #444;
  margin-top: 0.25rem;
  text-align: center;
}

.media-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #3b82f6;
  color: white;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.edit-btn:hover {
  background-color: #2563eb;
}

.delete-btn:hover {
  background-color: #dc2626;
}
</style>
