<template>
  <div>
    <h2>Welcome, {{ user.username }}!</h2>
    <h3>Your Projects</h3>
    <ul>
      <li v-for="project in projects" :key="project.id" class="mb-2">
        <img :src="project.imageUrl" alt="Project preview" class="w-16 h-16 object-cover mr-2 inline-block" v-if="project.imageUrl" />
        <router-link :to="`/project/${project.id}`">{{ project.name }}</router-link>
      </li>
    </ul>
    <button @click="logout" class="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const router = useRouter()

const user = computed(() => dataStore.getUser)
const projects = computed(() => dataStore.getProjects)

const logout = () => {
  dataStore.logout()
  router.push('/login')
}
</script>
