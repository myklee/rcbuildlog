<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Welcome, {{ user.email }}!</h2>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Create New Project
      </button>
    </div>

    <h3 class="text-xl font-semibold mb-4">Your Projects</h3>
    
    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="project in projects" :key="project.id" 
           class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div class="aspect-video mb-3 bg-gray-100 rounded overflow-hidden">
          <img :src="project.imageUrl" alt="Project preview" 
               class="w-full h-full object-cover" 
               v-if="project.imageUrl" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>
        <router-link :to="`/project/${project.id}`" 
                    class="text-lg font-medium hover:text-blue-600">
          {{ project.name }}
        </router-link>
        <p class="text-gray-600 mt-2 line-clamp-2">{{ project.description }}</p>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Create New Project</h3>
        
        <form @submit.prevent="createProject">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Project Name</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Description</label>
            <textarea
              v-model="newProject.description"
              class="w-full px-3 py-2 border rounded"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Project Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="w-full"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>

    <button @click="logout" class="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
      Logout
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const router = useRouter()

const user = computed(() => dataStore.getUser)
const projects = computed(() => dataStore.getProjects)

const showCreateModal = ref(false)
const newProject = ref({
  name: '',
  description: '',
  imageUrl: null
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newProject.value.imageUrl = URL.createObjectURL(file)
  }
}

const createProject = async () => {
  try {
    await dataStore.addProject({
      ...newProject.value,
      user_id: user.value.id
    })
    
    // Reset form and close modal
    newProject.value = {
      name: '',
      description: '',
      imageUrl: null
    }
    showCreateModal.value = false
  } catch (error) {
    console.error('Error creating project:', error)
    // You might want to show an error message to the user
  }
}

const logout = () => {
  dataStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
