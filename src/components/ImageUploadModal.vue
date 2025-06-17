<template>
  <div v-if="isOwner && show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add Image</h3>
      <form @submit.prevent="saveImage">
        <div class="form-group">
          <label>Image</label>
          <div class="upload-container">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
              ref="imageInput"
            />
            <button type="button" @click="$refs.imageInput.click()" class="upload-btn">
              Choose Image
            </button>
            <div v-if="image.file || image.url" class="preview-container">
              <img :src="image.url" alt="Preview" class="preview-image" />
              <button type="button" @click="removeImage" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="image.description"
            placeholder="Image description (optional)"
            class="desc-input"
            rows="2"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn" :disabled="!image.file || isUploading">
            {{ isUploading ? 'Uploading...' : 'Save Image' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../store/dataStore'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const props = defineProps({
  show: Boolean,
  projectId: String,
  project: Object
})
const emit = defineEmits(['close', 'saved'])
const dataStore = useDataStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)
const isOwner = computed(() => isAuthenticated.value && props.project && props.project.user_id === authStore.user.id)

const image = ref({ file: null, url: '', description: '' })
const isUploading = ref(false)

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  image.value = { file: null, url: '', description: '' }
  isUploading.value = false
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('Image file selected:', file)
    const reader = new FileReader()
    reader.onload = (e) => {
      image.value.file = file
      image.value.url = e.target.result
      console.log('Image preview URL created')
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  image.value = { file: null, url: '', description: '' }
}

const uploadToStorage = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${props.projectId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}

const saveImage = async () => {
  if (!image.value.file) {
    alert('Please select an image.')
    return
  }

  try {
    isUploading.value = true
    console.log('Uploading image to storage...')
    
    const imageUrl = await uploadToStorage(image.value.file)
    console.log('Image uploaded to storage:', imageUrl)

    await dataStore.addImage({
      project_id: props.projectId,
      image_url: imageUrl,
      image_description: image.value.description
    })
    
    console.log('Image saved to database')
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Failed to save image:', error)
    alert('Failed to save image: ' + error.message)
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

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
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