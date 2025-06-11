<template>
  <div v-if="project">
    <h2>{{ project.name }}</h2>
    <p>{{ project.description }}</p>
    <img :src="project.imageUrl" alt="Project image" v-if="project.imageUrl" />
  </div>
  <div v-else>
    <p>Project not found.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const route = useRoute()
const projectId = route.params.id

const project = computed(() => {
  return dataStore.getProjects.find(p => p.id === parseInt(projectId))
})
</script>
