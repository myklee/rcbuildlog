<template>
  <div class="container">
    <div v-if="isLoading" class="loading">
      Loading your projects...
    </div>
    <template v-else>
      <div class="header">
        <h2>Welcome, {{ user.email }}!</h2>
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
            <router-link :to="`/project/${project.id}`" 
                        class="project-title">
              {{ project.name }}
            </router-link>
            <button
              @click="confirmDelete(project)"
              class="delete-button"
              title="Delete"
            >
              🗑
            </button>
          </div>
          <p class="project-description">{{ project.description }}</p>
          <p class="project-date">
            {{ formatDate(project.created_at) }}
          </p>
        </div>
      </div>

      <!-- Create Project Modal -->
      <div v-if="showCreateModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Create New Project</h3>
          
          <form @submit.prevent="createProject">
            <div class="form-group">
              <label class="form-label">Project Name</label>
              <input
                v-model="newProject.name"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="newProject.description"
                class="form-textarea"
                rows="3"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Project Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="form-file"
              />
            </div>

            <div class="modal-actions">
              <button
                type="button"
                @click="showCreateModal = false"
                class="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="submit-button"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Delete Project</h3>
          <p class="modal-message">Are you sure you want to delete "{{ projectToDelete?.name }}"? This action cannot be undone.</p>
          <div class="modal-actions">
            <button
              @click="showDeleteModal = false"
              class="cancel-button"
            >
              Cancel
            </button>
            <button
              @click="deleteProject"
              class="delete-confirm-button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <button @click="logout" class="logout-button">
        Logout
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../store/dataStore'

const dataStore = useDataStore()
const router = useRouter()

const user = computed(() => dataStore.getUser)
const projects = computed(() => dataStore.getProjects)
const isLoading = ref(true)

// Search and filter state
const searchQuery = ref('')
const filters = ref({
  sortBy: 'created_at',
  sortOrder: 'desc'
})

// Computed property for displayed projects
const displayedProjects = computed(() => {
  let filtered = projects.value;
  
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
const showDeleteModal = ref(false)
const projectToDelete = ref(null)

const newProject = ref({
  name: '',
  description: '',
  imageUrl: null
})

// Handlers
const handleSearch = async () => {
  if (searchQuery.value) {
    await dataStore.searchProjects(searchQuery.value);
  } else {
    await dataStore.fetchProjects();
  }
}

const handleSortChange = async () => {
  await dataStore.setFilters(filters.value);
}

const toggleSortOrder = async () => {
  filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc';
  await dataStore.setFilters(filters.value);
}

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
  }
}

const confirmDelete = (project) => {
  projectToDelete.value = project
  showDeleteModal.value = true
}

const deleteProject = async () => {
  if (!projectToDelete.value) return
  
  try {
    await dataStore.deleteProject(projectToDelete.value.id)
    showDeleteModal.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const logout = () => {
  dataStore.logout()
  router.push('/login')
}

// Initialize
onMounted(async () => {
  try {
    isLoading.value = true
    // First ensure auth is initialized
    await dataStore.initializeAuth()
    
    // Then fetch projects if user is logged in
    if (dataStore.loggedInUser) {
      await dataStore.fetchProjects()
    } else {
      // If no user is logged in, redirect to login
      router.push('/login')
    }
  } catch (error) {
    console.error('Error loading user home:', error)
  } finally {
    isLoading.value = false
  }
})

watch(() => filters.value, async () => {
  await dataStore.setFilters(filters.value)
}, { deep: true })
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
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
}

.project-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: inherit;
  text-decoration: none;
}

.project-title:hover {
  color: #2563eb;
}

.delete-button {
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
}

.delete-button:hover {
  color: #dc2626;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 28rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.form-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  background: white;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
}

.delete-confirm-button {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
}

.logout-button {
  margin-top: 2rem;
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }

  .modal-content {
    width: 95%;
    padding: 1rem;
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
