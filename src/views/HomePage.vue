<template>
  <div class="home-container">
    <div v-if="featuredProject" class="featured-project">
      <h1 class="title">Featured Project</h1>
      
      <div class="project-card">
        <div class="project-image">
          <img 
            :src="featuredProject.image_url" 
            :alt="featuredProject.name"
            v-if="featuredProject.image_url"
          />
          <div v-else class="no-image">
            No Image
          </div>
        </div>

        <div class="project-content">
          <h2 class="project-name">{{ featuredProject.name }}</h2>
          <p class="project-description">{{ featuredProject.description }}</p>
          
          <div class="project-meta">
            <span class="date">Created: {{ formatDate(featuredProject.created_at) }}</span>
          </div>

          <div class="project-logs" v-if="projectLogs.length > 0">
            <h3>Recent Logs</h3>
            <div class="logs-list">
              <div v-for="log in projectLogs.slice(0, 3)" :key="log.id" class="log-item">
                <div class="log-header">
                  <span class="log-title">{{ log.title }}</span>
                  <span class="log-date">{{ formatDate(log.created_at) }}</span>
                </div>
                <p class="log-content">{{ log.content }}</p>
              </div>
            </div>
          </div>

          <div class="actions">
            <router-link 
              :to="`/project/${featuredProject.id}`" 
              class="view-button"
            >
              View Full Project
            </router-link>
            <button @click="loadRandomProject" class="refresh-button">
              Show Another Project
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      Loading featured project...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../store/dataStore'
import { supabase } from '../lib/supabase'

const dataStore = useDataStore()
const featuredProject = ref(null)
const projectLogs = ref([])
const isLoading = ref(true)

const loadRandomProject = async () => {
  try {
    isLoading.value = true
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    if (projects.length > 0) {
      const randomIndex = Math.floor(Math.random() * projects.length)
      featuredProject.value = projects[randomIndex]
      await loadProjectLogs()
    }
  } catch (error) {
    console.error('Error loading random project:', error)
  } finally {
    isLoading.value = false
  }
}

const loadProjectLogs = async () => {
  if (!featuredProject.value) return

  try {
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('project_id', featuredProject.value.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) throw error
    projectLogs.value = logs
  } catch (error) {
    console.error('Error loading project logs:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  console.log('HomePage mounted')
  await loadRandomProject()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
}

.featured-project {
  max-width: 800px;
  margin: 0 auto;
}

.project-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 400px;
  background-color: #f3f4f6;
  overflow: hidden;
}

.project-image img {
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
  font-size: 1.25rem;
}

.project-content {
  padding: 2rem;
}

.project-name {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
}

.project-description {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.project-meta {
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.project-logs {
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.project-logs h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.log-title {
  font-weight: 500;
  color: #1f2937;
}

.log-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.log-content {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.view-button,
.refresh-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.view-button {
  background-color: #2563eb;
  color: white;
}

.view-button:hover {
  background-color: #1d4ed8;
}

.refresh-button {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
}

.refresh-button:hover {
  background-color: #e5e7eb;
}

.loading {
  text-align: center;
  font-size: 1.25rem;
  color: #6b7280;
  padding: 2rem;
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .project-image {
    height: 300px;
  }

  .project-content {
    padding: 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .view-button,
  .refresh-button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .view-button,
  .refresh-button {
    width: 100%;
  }
}
</style> 