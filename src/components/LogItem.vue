<template>
  <div class="log-item">
    <div class="log-header">
      <span class="log-date">{{ formatDate(logItem.date) }}</span>
      <div class="log-actions">
        <button class="action-button" @click="toggleEdit" v-if="!isEditing">
          <span class="action-icon">✏️</span>
        </button>
        <button class="action-button" @click="saveEdit" v-if="isEditing">
          <span class="action-icon">💾</span>
        </button>
      </div>
    </div>

    <div class="log-content">
      <!-- Image Section -->
      <div class="log-image" v-if="logItem.image">
        <img :src="logItem.image.url" :alt="logItem.image.description" />
      </div>

      <!-- Notes Section -->
      <div class="log-notes" :class="{ 'editing': isEditing }">
        <textarea
          v-if="isEditing"
          v-model="editedNotes"
          placeholder="Add your notes here..."
          class="notes-input"
        ></textarea>
        <p v-else>{{ logItem.notes || 'No notes added' }}</p>
      </div>

      <!-- Links Section -->
      <div class="log-links" v-if="logItem.links && logItem.links.length">
        <h4>Related Links</h4>
        <ul>
          <li v-for="(link, index) in logItem.links" :key="index">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">
              {{ link.title || link.url }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Tags Section -->
      <div class="log-tags" v-if="logItem.tags && logItem.tags.length">
        <span v-for="(tag, index) in logItem.tags" :key="index" class="tag">
          #{{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  logItem: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

const isEditing = ref(false)
const editedNotes = ref(props.logItem.notes || '')

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleEdit = () => {
  isEditing.value = true
  editedNotes.value = props.logItem.notes || ''
}

const saveEdit = () => {
  emit('update', {
    ...props.logItem,
    notes: editedNotes.value
  })
  isEditing.value = false
}
</script>

<style scoped>
.log-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.log-date {
  color: #666;
  font-size: 0.9em;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #eee;
}

.log-content {
  padding: 16px;
}

.log-image {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.log-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.log-notes {
  margin-bottom: 16px;
}

.notes-input {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.log-links {
  margin-bottom: 16px;
}

.log-links h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.log-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.log-links li {
  margin-bottom: 4px;
}

.log-links a {
  color: #0066cc;
  text-decoration: none;
}

.log-links a:hover {
  text-decoration: underline;
}

.log-tags {
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
}

@media (max-width: 768px) {
  .log-item {
    margin: 10px;
  }
}
</style> 