<template>
  <div v-if="isAuthenticated && show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Create New Project</h3>
      <form @submit.prevent="createProject">
        <div class="form-group">
          <label>Project Name</label>
          <input
            v-model="project.name"
            type="text"
            placeholder="Enter project name"
            class="input-field"
            required
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="project.description"
            placeholder="Enter project description"
            class="input-field"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Tags</label>
          <div class="tags-input">
            <div class="tags-list">
              <span v-for="(tag, index) in project.tags" :key="index" class="tag">
                {{ tag }}
                <button type="button" @click="removeTag(index)" class="remove-tag">×</button>
              </span>
            </div>
            <input
              v-model="newTag"
              type="text"
              placeholder="Add a tag"
              class="tag-input"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
            />
          </div>
          <small class="help-text">Press Enter or comma to add a tag</small>
        </div>

        <div class="form-group">
          <label>
            <input
              type="checkbox"
              v-model="project.is_private"
            />
            Make this project private (only visible to you)
          </label>
          <small class="help-text">Private projects will only be visible to you</small>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Project' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'saved'])
const store = useDataStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)

const project = ref({
  name: '',
  description: '',
  tags: [],
  is_private: false
})
const newTag = ref('')
const isCreating = ref(false)

const closeModal = () => {
  project.value = {
    name: '',
    description: '',
    tags: [],
    is_private: false
  }
  newTag.value = ''
  emit('close')
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !project.value.tags.includes(tag)) {
    project.value.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (index) => {
  project.value.tags.splice(index, 1)
}

const createProject = async () => {
  if (!project.value.name) {
    alert('Please enter a project name')
    return
  }

  try {
    isCreating.value = true
    await store.addProject(project.value)
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Failed to create project:', error)
    alert('Failed to create project: ' + error.message)
  } finally {
    isCreating.value = false
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
  max-width: 500px;
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

.input-field {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

textarea.input-field {
  resize: vertical;
}

.tags-input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  background: white;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 1.25rem;
  line-height: 1;
}

.remove-tag:hover {
  color: #ef4444;
}

.tag-input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem;
  font-size: 0.875rem;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}
</style> 