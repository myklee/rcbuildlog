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
/* ...modal and form styles as before... */
</style> 