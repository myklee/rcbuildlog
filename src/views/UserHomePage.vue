<template>
  <div class="container">
    <div v-if="isLoading" class="loading">
      Loading your projects...
    </div>
    <template v-else-if="user">
      <!-- Top Header with Logout -->
      <div class="top-header">
        <h2>Welcome, {{ user.email }}!</h2>
        <button @click="logout" class="logout-button">
          Logout
        </button>
      </div>

      <div class="header">
        <button @click="showCreateModal = true" class="create-button">
          Create New Project
        </button>
      </div>

      <!-- Project Management Controls -->
      <div class="controls">
        <!-- Search -->
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="search-input"
            @input="handleSearch"
          />
        </div>

        <!-- Sort Controls -->
        <div class="sort-controls">
          <select
            v-model="filters.sortBy"
            class="sort-select"
            @change="handleSortChange"
          >
            <option value="created_at">Date</option>
            <option value="name">Name</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="sort-button"
          >
            {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <h3 class="section-title">Your Projects</h3>
      
      <!-- Projects Grid -->
      <div class="projects-grid">
        <div v-for="project in displayedProjects" :key="project.id" 
             class="project-card">
          <div class="project-image">
            <img :src="project.image_url" alt="Project preview" 
                 class="project-img" 
                 v-if="project.image_url" />
            <div v-else class="no-image">
              No Image
            </div>
          </div>
          <div class="project-header">
            <div class="project-title-container">
              <router-link :to="`/project/${project.id}`" 
                          class="project-title">
                {{ project.name }}
              </router-link>
              <span v-if="project.is_private" class="private-label">Private</span>
            </div>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <p class="project-date">
            {{ formatDate(project.created_at) }}
          </p>
        </div>
      </div>

      <!-- Create Project Modal -->
      <CreateProjectModal
        :show="showCreateModal"
        @close="showCreateModal = false"
        @saved="handleProjectCreated"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'
import CreateProjectModal from '../components/CreateProjectModal.vue'

const dataStore = useDataStore()
const router = useRouter()

const user = computed(() => dataStore.loggedInUser)
const projects = computed(() => dataStore.projects)
const isLoading = ref(true)

// Search and filter state
const searchQuery = ref(dataStore.searchQuery)
const filters = ref(dataStore.filters)

// Initialize data
onMounted(() => {
  console.log('UserHomePage mounted')
  console.log('User:', dataStore.loggedInUser)
  console.log('Projects:', dataStore.projects)
  isLoading.value = false
})

// Computed property for displayed projects
const displayedProjects = computed(() => {
  let filtered = projects.value || [];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  }
  
  return filtered;
})

// Modal state
const showCreateModal = ref(false)

const newProject = ref({
  name: '',
  description: '',
  imageUrl: null
})

// Handlers
const handleSearch = async () => {
  dataStore.searchQuery = searchQuery.value
  await dataStore.fetchProjects()
}

const handleSortChange = async () => {
  dataStore.filters = filters.value
  await dataStore.fetchProjects()
}

const toggleSortOrder = async () => {
  filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
  dataStore.filters = filters.value
  await dataStore.fetchProjects()
}

const handleProjectCreated = async () => {
  await dataStore.fetchProjects()
  showCreateModal.value = false
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const logout = async () => {
  try {
    const success = await dataStore.logout()
    if (success) {
      console.log('Logout successful, redirecting to login')
      router.push('/login')
    } else {
      console.error('Logout failed')
      // Optionally show an error message to the user
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Optionally show an error message to the user
  }
}

// Watch for user changes
watch(user, (newUser) => {
  if (!newUser) {
    router.push('/login')
  }
})

watch(() => filters.value, async () => {
  await dataStore.setFilters(filters.value)
}, { deep: true })
</script>

<style scoped>
.container {
  padding: 1rem;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.logout-button {
  background-color: var(--color-danger);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-colors);
}

.logout-button:hover {
  background-color: var(--color-danger-dark);
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1.5rem;
}

.create-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}

.create-button:hover {
  background-color: #45a049;
}

.controls {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-container {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.sort-controls {
  display: flex;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.sort-button {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  background: white;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.project-card {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: box-shadow 0.3s;
}

.project-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-image {
  aspect-ratio: 16/9;
  margin-bottom: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  overflow: hidden;
}

.project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.project-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.private-label {
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.project-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: inherit;
  text-decoration: none;
  flex: 1;
}

.project-title:hover {
  color: #2563eb;
}

.project-description {
  color: #4b5563;
  margin: 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-date {
  font-size: 0.875rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
