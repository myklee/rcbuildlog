<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add Log Entry</h3>
      <form @submit.prevent="saveLogText">
        <div class="form-group">
          <label for="notes">Notes *</label>
          <textarea
            id="notes"
            v-model="notes"
            required
            rows="4"
            placeholder="Enter your notes here..."
          ></textarea>
        </div>
        <div class="form-group">
          <label>Links</label>
          <div v-for="(link, index) in links" :key="index" class="link-item">
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
            <div v-for="(tag, index) in tags" :key="index" class="tag">
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
import { ref } from 'vue'
import { useDataStore } from '../store/dataStore'

const props = defineProps({
  show: Boolean,
  projectId: String
})
const emit = defineEmits(['close', 'saved'])
const dataStore = useDataStore()

const notes = ref('')
const links = ref([])
const tags = ref([])
const newTag = ref('')

const closeModal = () => {
  emit('close')
  resetForm()
}
const resetForm = () => {
  notes.value = ''
  links.value = []
  tags.value = []
  newTag.value = ''
}
const addLink = () => {
  links.value.push({ url: '' })
}
const removeLink = (index) => {
  links.value.splice(index, 1)
}
const addTag = () => {
  if (newTag.value.trim()) {
    tags.value.push(newTag.value.trim())
    newTag.value = ''
  }
}
const removeTag = (index) => {
  tags.value.splice(index, 1)
}
const saveLogText = async () => {
  if (!notes.value) {
    alert('Please fill in all required fields')
    return
  }
  try {
    await dataStore.addLog({
      project_id: props.projectId,
      title: notes.value.substring(0, 100),
      content: notes.value,
      links: links.value.filter(link => link.url.trim()),
      tags: tags.value
    })
    emit('saved')
    closeModal()
  } catch (error) {
    alert('Failed to save log entry.')
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
  border-radius: 0.5rem;
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
  color: #374151;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  resize: vertical;
}

.link-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.remove-btn {
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
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
  border-radius: 0.25rem;
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
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #d1d5db;
}

.save-btn:hover {
  background: #2563eb;
}
</style> 