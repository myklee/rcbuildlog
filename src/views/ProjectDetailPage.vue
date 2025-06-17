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

    <div class="add-entry-buttons" v-if="isOwner">
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
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.userId">
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
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.userId">
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
          <div class="media-actions" v-if="isAuthenticated && project && project.user_id === authStore.userId">
            <button class="delete-btn" @click="confirmDeleteDocument(doc)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals: Only show if authenticated -->
    <LogTextModal
      v-if="isOwner"
      :show="showLogTextModal"
      :projectId="projectId"
      :project="project"
      @close="showLogTextModal = false"
      @saved="handleLogSaved"
    />
    <ImageUploadModal
      v-if="isOwner"
      :show="showImageModal"
      :projectId="projectId"
      :project="project"
      @close="showImageModal = false"
      @saved="handleImageSaved"
    />
    <VideoUploadModal
      v-if="isOwner"
      :show="showVideoModal"
      :projectId="projectId"
      :project="project"
      @close="showVideoModal = false"
      @saved="handleVideoSaved"
    />
    <DocumentUploadModal
      v-if="isOwner"
      :show="showDocumentModal"
      :projectId="projectId"
      :project="project"
      @close="showDocumentModal = false"
      @saved="handleDocumentSaved"
    />
    <EditProjectModal
      v-if="isOwner && showEditModal"
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
import { useDataStore } from '../store/dataStore'
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

// Stores
const authStore = useAuthStore()
const dataStore = useDataStore()

// Auth
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isOwner = computed(() => {
  console.log('Auth check:', {
    isAuthenticated: authStore.isAuthenticated,
    userId: authStore.userId,
    projectUserId: project.value?.user_id,
    project: project.value
  })
  return authStore.isAuthenticated && project.value && project.value.user_id === authStore.userId
})

// Modal state
const showLogTextModal = ref(false)
const showImageModal = ref(false)
const showVideoModal = ref(false)
const showDocumentModal = ref(false)
const editingLog = ref(null)
const showEditModal = ref(false)

// Handlers
async function handleLogSaved() {
  await refreshAllContent()
  showLogTextModal.value = false
}

async function handleImageSaved() {
  await refreshAllContent()
  showImageModal.value = false
}

async function handleVideoSaved() {
  await refreshAllContent()
  showVideoModal.value = false
}

async function handleDocumentSaved() {
  await refreshAllContent()
  showDocumentModal.value = false
}

async function handleProjectUpdated() {
  await refreshProject()
  showEditModal.value = false
}

// Refresh functions
async function refreshProject() {
  const { data: projectData, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId.value)
    .single()
  if (projectData) {
    project.value = projectData
  }
}

async function refreshAllContent() {
  const [logsData, imagesData, videosData, documentsData] = await Promise.all([
    supabase.from('logs').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('images').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('videos').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('project_id', projectId.value).order('created_at', { ascending: false }),
  ])

  // Update individual arrays
  allLogs.value = [
    ...(logsData.data || []).map(log => ({
      ...log,
      type: 'text'
    })),
    ...(imagesData.data || []).map(img => ({
      ...img,
      type: 'image',
      content: img.image_url,
      description: img.image_description
    })),
    ...(videosData.data || []).map(vid => ({
      ...vid,
      type: 'video',
      content: vid.video_url,
      description: vid.video_description
    })),
    ...(documentsData.data || []).map(doc => ({
      ...doc,
      type: 'document',
      content: doc.document_url,
      name: doc.document_name,
      description: doc.document_description
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  images.value = imagesData.data || []
  videos.value = videosData.data || []
  documents.value = documentsData.data || []
}

async function refreshLogs() {
  await refreshAllContent()
}

async function refreshImages() {
  await refreshAllContent()
}

async function refreshVideos() {
  await refreshAllContent()
}

async function refreshDocuments() {
  await refreshAllContent()
}

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

  // Fetch all content
  await refreshAllContent()
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

const confirmDeleteLog = async (log) => {
  if (confirm('Are you sure you want to delete this log entry?')) {
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', log.id)
      
      if (error) throw error
      
      // Remove from allLogs
      allLogs.value = allLogs.value.filter(l => l.id !== log.id)
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('Failed to delete log entry')
    }
  }
}

const showEditImageModal = (img) => {
  // Implement if you want to support editing images
}

const confirmDeleteImage = async (image) => {
  if (confirm('Are you sure you want to delete this image?')) {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id)
      
      if (error) throw error
      
      // Remove from images and allLogs
      images.value = images.value.filter(img => img.id !== image.id)
      allLogs.value = allLogs.value.filter(log => log.id !== image.id)
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }
}

const showEditVideoModal = (vid) => {
  // Implement if you want to support editing videos
}

const confirmDeleteVideo = async (video) => {
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id)
      
      if (error) throw error
      
      // Remove from videos and allLogs
      videos.value = videos.value.filter(vid => vid.id !== video.id)
      allLogs.value = allLogs.value.filter(log => log.id !== video.id)
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Failed to delete video')
    }
  }
}

const confirmDeleteDocument = async (document) => {
  if (confirm('Are you sure you want to delete this document?')) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)
      
      if (error) throw error
      
      // Remove from documents and allLogs
      documents.value = documents.value.filter(doc => doc.id !== document.id)
      allLogs.value = allLogs.value.filter(log => log.id !== document.id)
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
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
