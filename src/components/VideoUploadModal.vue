<template>
  <div v-if="isOwner && show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add Video</h3>
      <form @submit.prevent="saveVideo">
        <div class="form-group">
          <label>Video</label>
          <div class="upload-container">
            <input
              type="file"
              accept="video/*"
              @change="handleVideoUpload"
              class="hidden"
              ref="videoInput"
            />
            <button type="button" @click="$refs.videoInput.click()" class="upload-btn">
              Choose Video
            </button>
            <div v-if="video.file || video.url" class="preview-container">
              <video :src="video.url" controls class="preview-video"></video>
              <button type="button" @click="removeVideo" class="remove-btn">×</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="video.description"
            placeholder="Video description (optional)"
            class="desc-input"
            rows="2"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn" :disabled="(!video.file && !props.editingVideo) || isUploading">
            {{ isUploading ? 'Uploading...' : 'Save Video' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '../store/dataStore'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

const props = defineProps({
  show: Boolean,
  projectId: String,
  project: Object,
  editingVideo: Object
})
const emit = defineEmits(['close', 'saved'])
const dataStore = useDataStore()
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)
const isOwner = computed(() => isAuthenticated.value && props.project && props.project.user_id === authStore.user.id)

const video = ref({ file: null, url: '', description: '' })
const isUploading = ref(false)

const resetForm = () => {
  video.value = { file: null, url: '', description: '' }
  isUploading.value = false
}

const closeModal = () => {
  emit('close')
  resetForm()
}

// Watch for editingVideo changes
watch(() => props.editingVideo, (newVideo) => {
  if (newVideo) {
    video.value = {
      file: null,
      url: newVideo.video_url,
      description: newVideo.video_description || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log('Video file selected:', file)
    const reader = new FileReader()
    reader.onload = (e) => {
      video.value.file = file
      video.value.url = e.target.result
      console.log('Video preview URL created')
    }
    reader.readAsDataURL(file)
  }
}

const removeVideo = () => {
  video.value = { file: null, url: '', description: '' }
}

const uploadToStorage = async (file) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${props.projectId}/${fileName}`

    console.log('Attempting to upload video:', {
      fileName,
      filePath,
      fileSize: file.size,
      fileType: file.type
    })

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      throw error
    }

    console.log('Video uploaded successfully:', data)

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)

    console.log('Generated public URL:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error in uploadToStorage:', error)
    throw error
  }
}

const saveVideo = async () => {
  if (!video.value.file && !props.editingVideo) {
    alert('Please select a video.')
    return
  }

  try {
    isUploading.value = true
    console.log('Starting video upload process...')
    
    let videoUrl = video.value.url
    if (video.value.file) {
      videoUrl = await uploadToStorage(video.value.file)
      console.log('Video uploaded to storage:', videoUrl)
    }

    if (props.editingVideo) {
      await dataStore.updateVideo(props.editingVideo.id, {
        video_url: videoUrl,
        video_description: video.value.description
      })
    } else {
      await dataStore.addVideo({
        project_id: props.projectId,
        video_url: videoUrl,
        video_description: video.value.description
      })
    }
    
    console.log('Video saved to database successfully')
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Failed to save video:', error)
    alert('Failed to save video: ' + (error.message || 'Unknown error'))
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

.preview-video {
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