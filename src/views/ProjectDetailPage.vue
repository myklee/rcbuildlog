<template>
  <div v-if="isLoading" class="text-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    <p class="mt-4 text-gray-600">Loading project...</p>
  </div>
  <div v-else-if="error" class="text-center py-8">
    <p class="text-red-500">{{ error }}</p>
    <button
      @click="$router.push('/')"
      class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Back to Projects
    </button>
  </div>
  <div v-else-if="project" class="project-detail">
    <div class="project-header">
      <div class="project-info">
        <h1>{{ project.name }}</h1>
        <p class="description">{{ project.description }}</p>
        <div v-if="project.tags && project.tags.length" class="tags-list">
          <span v-for="tag in project.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
      <div class="project-actions" v-if="isAuthenticated">
        <button class="edit-btn" @click="showEditModal = true">Edit Project</button>
      </div>
    </div>

    <div class="add-entry-buttons" v-if="isAuthenticated">
      <button class="add-button" @click="showLogTextModal = true">Add Log Entry</button>
      <button class="add-button" @click="showImageModal = true">Add Image</button>
      <button class="add-button" @click="showVideoModal = true">Add Video</button>
      <button class="add-button" @click="showDocumentModal = true">Add Document</button>
    </div>

    <!-- Combined Log Entries -->
    <div class="log-entries">
      <LogItem
        v-for="log in allLogs"
        :key="log.id"
        :logItem="log"
        :project="project"
        v-bind="isAuthenticated ? { onEdit: showEditLogModal, onDelete: confirmDeleteLog } : {}"
      />
    </div>

    <!-- Images Section -->
    <div v-if="images.length" class="media-section">
      <h2>Images</h2>
      <div class="media-list">
        <div v-for="img in images" :key="img.id" class="media-item">
          <img :src="img.image_url" alt="Project Image" class="media-img" />
          <div class="media-desc">{{ img.image_description }}</div>
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.user.id">
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
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.user.id">
            <button class="edit-btn" @click="showEditVideoModal(vid)">Edit</button>
            <button class="delete-btn" @click="confirmDeleteVideo(vid)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Documents Section -->
    <div v-if="documents.length" class="media-section">
      <h2>Documents</h2>
      <div class="media-list">
        <div v-for="doc in documents" :key="doc.id" class="media-item">
          <a :href="doc.document_url" target="_blank" class="doc-link">
            <span class="doc-icon">📄</span> {{ doc.document_name }}
          </a>
          <div class="media-desc">{{ doc.document_description }}</div>
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.user.id">
            <button class="delete-btn" @click="confirmDeleteDocument(doc)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals: Only show if authenticated -->
    <LogTextModal
      v-if="isAuthenticated"
      :show="showLogTextModal"
      :projectId="projectId"
      @close="showLogTextModal = false"
      @saved="handleLogSaved"
    />
    <ImageUploadModal
      v-if="isAuthenticated"
      :show="showImageModal"
      :projectId="projectId"
      @close="showImageModal = false"
      @saved="handleImageSaved"
    />
    <VideoUploadModal
      v-if="isAuthenticated"
      :show="showVideoModal"
      :projectId="projectId"
      @close="showVideoModal = false"
      @saved="handleVideoSaved"
    />
    <DocumentUploadModal
      v-if="isAuthenticated"
      :show="showDocumentModal"
      :projectId="projectId"
      @close="showDocumentModal = false"
      @saved="handleDocumentSaved"
    />
    <EditProjectModal
      v-if="isAuthenticated && showEditModal"
      :show="showEditModal"
      :project="project"
      @close="showEditModal = false"
      @saved="handleProjectUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import LogItem from '../components/LogItem.vue'
import LogTextModal from '../components/LogTextModal.vue'
import ImageUploadModal from '../components/ImageUploadModal.vue'
import VideoUploadModal from '../components/VideoUploadModal.vue'
import DocumentUploadModal from '../components/DocumentUploadModal.vue'
import EditProjectModal from '../components/EditProjectModal.vue'

const route = useRoute()
const projectId = computed(() => route.params.id)
const project = ref(null)
const isLoading = ref(true)
const error = ref(null)

const allLogs = ref([])
const images = ref([])
const videos = ref([])
const documents = ref([])

// Auth
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)

// Modal state
const showLogTextModal = ref(false)
const showImageModal = ref(false)
const showVideoModal = ref(false)
const showDocumentModal = ref(false)
const editingLog = ref(null)
const showEditModal = ref(false)

onMounted(async () => {
  isLoading.value = true
  error.value = null

  // Fetch project
  const { data: projectData, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId.value)
    .single()
  if (projectData) {
    project.value = projectData
  } else {
    error.value = fetchError?.message || 'Project not found.'
    isLoading.value = false
    return
  }

  // Fetch all logs/media
  const [logsData, imagesData, videosData, documentsData] = await Promise.all([
    supabase.from('logs').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('images').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('videos').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
  ])

  // Combine all content into allLogs
  allLogs.value = [
    ...(logsData.data || []).map(log => ({
      ...log,
      type: 'text'
    })),
    ...(imagesData.data || []).map(image => ({
      id: image.id,
      project_id: image.project_id,
      user_id: image.user_id,
      title: image.title || 'Image',
      content: image.image_url || image.url,
      description: image.image_description || image.description || '',
      created_at: image.created_at,
      updated_at: image.updated_at,
      type: 'image'
    })),
    ...(videosData.data || []).map(video => ({
      id: video.id,
      project_id: video.project_id,
      user_id: video.user_id,
      title: video.title || 'Video',
      content: video.video_url || video.url,
      description: video.video_description || video.description || '',
      created_at: video.created_at,
      updated_at: video.updated_at,
      type: 'video'
    })),
    ...(documentsData.data || []).map(doc => ({
      id: doc.id,
      project_id: doc.project_id,
      user_id: doc.user_id,
      title: doc.title || doc.document_name || 'Document',
      content: doc.document_url || doc.url,
      description: doc.document_description || doc.description || '',
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      type: 'document',
      name: doc.document_name || doc.title || 'Document'
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  images.value = imagesData.data || []
  videos.value = videosData.data || []
  documents.value = documentsData.data || []

  isLoading.value = false
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

const handleDocumentSaved = async () => {
  documents.value = await dataStore.fetchDocuments(projectId.value)
  showDocumentModal.value = false
}

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

const confirmDeleteDocument = async (doc) => {
  if (confirm('Are you sure you want to delete this document?')) {
    try {
      await dataStore.deleteDocument(doc.id)
      documents.value = await dataStore.fetchDocuments(projectId.value)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }
}

// Add project update handler
const handleProjectUpdated = async () => {
  await dataStore.fetchProjects() // Refresh projects list
  showEditModal.value = false
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.project-info {
  flex: 1;
}

.project-actions {
  margin-left: 1rem;
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

.doc-link {
  font-size: 1.1rem;
  color: #2563eb;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.doc-link:hover {
  text-decoration: underline;
}

.doc-icon {
  font-size: 1.5rem;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.edit-btn:hover {
  background: #2563eb;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
