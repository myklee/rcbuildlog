<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add Document</h3>
      <form @submit.prevent="saveDocument">
        <div class="form-group">
          <label>Document</label>
          <div class="upload-container">
            <input
              type="file"
              @change="handleDocumentUpload"
              class="hidden"
              ref="docInput"
            />
            <button type="button" @click="$refs.docInput.click()" class="upload-btn">
              Choose Document
            </button>
            <div v-if="document.file || document.url" class="preview-container">
              <span class="file-name">{{ document.file?.name }}</span>
              <button type="button" @click="removeDocument" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Document Name</label>
          <input
            type="text"
            v-model="document.name"
            placeholder="Document name"
            class="doc-name-input"
            required
          />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="document.description"
            placeholder="Document description (optional)"
            class="desc-input"
            rows="2"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn" :disabled="!document.file || isUploading">
            {{ isUploading ? 'Uploading...' : 'Save Document' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDataStore } from '../store/dataStore'
import { supabase } from '../lib/supabase'

const props = defineProps({
  show: Boolean,
  projectId: String
})
const emit = defineEmits(['close', 'saved'])
const dataStore = useDataStore()

const document = ref({ file: null, url: '', name: '', description: '' })
const isUploading = ref(false)

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  document.value = { file: null, url: '', name: '', description: '' }
  isUploading.value = false
}

const handleDocumentUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    document.value.file = file
    document.value.name = file.name
    document.value.url = ''
  }
}

const removeDocument = () => {
  document.value = { file: null, url: '', name: '', description: '' }
}

const uploadToStorage = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${props.projectId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading document:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)

  return publicUrl
}

const saveDocument = async () => {
  if (!document.value.file) {
    alert('Please select a document.')
    return
  }

  try {
    isUploading.value = true
    const docUrl = await uploadToStorage(document.value.file)
    await dataStore.addDocument({
      project_id: props.projectId,
      document_url: docUrl,
      document_name: document.value.name,
      document_description: document.value.description
    })
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Failed to save document:', error)
    alert('Failed to save document: ' + error.message)
  } finally {
    isUploading.value = false
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

.upload-container {
  border: 2px dashed #ccc;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.hidden {
  display: none;
}

.upload-btn {
  background: #f3f4f6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.preview-container {
  margin-top: 1rem;
  position: relative;
  display: inline-block;
}

.file-name {
  font-size: 1rem;
  color: #333;
  margin-right: 1rem;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-name-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.desc-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
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