<template>
  <div class="log-item">
    <!-- Log Image -->
    <div v-if="logItem.image_url" class="log-image">
      <img :src="logItem.image_url" :alt="logItem.title" />
    </div>

    <!-- Log Content -->
    <div class="log-content">
      <div class="log-header">
        <h3 class="log-title">{{ logItem.title }}</h3>
        <span class="log-date">{{ formatDate(logItem.created_at) }}</span>
      </div>

      <p class="log-text">{{ logItem.content }}</p>

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
      <div class="log-actions">
        <button @click="editLog" class="edit-button">Edit</button>
        <button @click="deleteLog" class="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useDataStore } from '../store/dataStore'

const props = defineProps({
  logItem: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])
const dataStore = useDataStore()

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
  emit('update', props.logItem)
}

const deleteLog = async () => {
  if (confirm('Are you sure you want to delete this log entry?')) {
    try {
      await dataStore.deleteLog(props.logItem.id)
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }
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