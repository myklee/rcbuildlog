<template>
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
    <textarea
      v-model="image.description"
      placeholder="Image description (optional)"
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

const image = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  image.value = { ...val }
})
watch(image, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      image.value.file = file
      image.value.url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
const removeImage = () => {
  image.value = { file: null, url: '', description: '' }
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
.preview-image {
  max-width: 200px;
  max-height: 200px;
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