<template>
  <div class="log-item">
    <!-- Log Image -->
    <div class="log-image" v-if="logItem.type === 'image'">
      <img :src="logItem.content" :alt="logItem.description" />
    </div>

    <!-- Log Video -->
    <div class="log-video" v-if="logItem.type === 'video'">
      <video controls>
        <source :src="logItem.content" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>

    <!-- Log Document -->
    <div class="log-document" v-if="logItem.type === 'document'">
      <a :href="logItem.content" target="_blank" class="doc-link">
        <span class="doc-icon">📄</span> {{ logItem.name }}
      </a>
    </div>

    <!-- Log Content -->
    <div class="log-content">
      <div class="log-header">
        <h3 class="log-title">
          {{ logItem.type === 'text' ? logItem.title : logItem.type.charAt(0).toUpperCase() + logItem.type.slice(1) }}
        </h3>
        <span class="log-date">{{ formatDate(logItem.created_at) }}</span>
      </div>

      <p v-if="logItem.type === 'text'" class="log-text">{{ logItem.content }}</p>
      <p v-if="logItem.description" class="log-description">{{ logItem.description }}</p>

      <!-- Links -->
      <div v-if="logItem.links && logItem.links.length" class="log-links">
        <a v-for="(link, index) in logItem.links" 
           :key="index"
           :href="link.url"
           target="_blank"
           class="log-link">
          {{ link.title || link.url }}
        </a>
      </div>

      <!-- Tags -->
      <div v-if="logItem.tags && logItem.tags.length" class="log-tags">
        <span v-for="(tag, index) in logItem.tags" 
              :key="index"
              class="log-tag">
          #{{ tag }}
        </span>
      </div>

      <!-- Actions -->
      <div class="log-actions" v-if="canEditOrDelete">
        <button @click="editLog" class="edit-button">Edit</button>
        <button @click="deleteLog" class="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { useAuthStore } from '../store/authStore'

const props = defineProps({
  logItem: {
    type: Object,
    required: true
  },
  project: {
    type: Object,
    required: false
  }
})

const emit = defineEmits(['edit', 'delete'])
const authStore = useAuthStore()

const canEditOrDelete = computed(() => {
  console.log('LogItem auth check:', {
    isAuthenticated: authStore.isAuthenticated,
    userId: authStore.userId,
    hasProject: !!props.project,
    projectUserId: props.project?.user_id,
    project: props.project
  })
  return (
    authStore.isAuthenticated &&
    props.project &&
    props.project.user_id === authStore.userId
  )
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editLog = () => {
  emit('edit', props.logItem)
}

const deleteLog = () => {
  emit('delete', props.logItem)
}
</script>

<style scoped>
.log-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  background: white;
}

.log-image {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
}

.log-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.log-video {
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.log-video video {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.log-document {
  margin-bottom: 1rem;
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

.log-content {
  padding: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.log-title {
  font-size: 1.2em;
  font-weight: 600;
  margin: 0;
}

.log-date {
  color: #666;
  font-size: 0.9em;
}

.log-text {
  margin: 0 0 16px;
  white-space: pre-wrap;
}

.log-description {
  margin: 0 0 16px;
  color: #666;
  font-size: 0.95em;
}

.log-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.log-link {
  color: #0066cc;
  text-decoration: none;
  font-size: 0.9em;
}

.log-link:hover {
  text-decoration: underline;
}

.log-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.log-tag {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.9em;
  color: #495057;
}

.log-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-button, .delete-button {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.edit-button {
  background: none;
  border: 1px solid #ddd;
  color: #666;
}

.delete-button {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.edit-button:hover {
  background: #f8f9fa;
}

.delete-button:hover {
  background: #dc3545;
  color: white;
}
</style> 