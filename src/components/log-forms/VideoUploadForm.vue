<template>
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
    <textarea
      v-model="video.description"
      placeholder="Video description (optional)"
      class="desc-input"
      rows="2"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ file: null, url: '', description: '' })
  }
})
const emit = defineEmits(['update:modelValue'])

const video = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  video.value = { ...val }
})
watch(video, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      video.value.file = file
      video.value.url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
const removeVideo = () => {
  video.value = { file: null, url: '', description: '' }
}
</script>

<style scoped>
.upload-container {
  margin-top: 0.5rem;
}
.hidden { display: none; }
.upload-btn {
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.preview-container {
  margin-top: 1rem;
  position: relative;
  display: inline-block;
}
.preview-video {
  max-width: 300px;
  border-radius: 4px;
}
.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
}
.desc-input {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}
</style> 