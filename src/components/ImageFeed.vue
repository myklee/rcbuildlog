<template>
  <div class="image-feed">
    <div class="feed-grid">
      <div v-for="(image, index) in images" :key="index" class="feed-item">
        <div class="image-container">
          <img :src="image.url" :alt="image.description || 'Project image'" />
          <div class="image-overlay">
            <span class="image-date">{{ formatDate(image.uploadDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.image-feed {
  width: 100%;
  padding: 20px;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.feed-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feed-item:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feed-item:hover .image-overlay {
  opacity: 1;
}

.image-date {
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}
</style> 