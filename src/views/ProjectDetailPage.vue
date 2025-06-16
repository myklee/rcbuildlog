<template>
  <div v-if="project" class="project-detail">
    <div class="project-header">
      <h1>{{ project.name }}</h1>
      <p class="description">{{ project.description }}</p>
    </div>

    <!-- Add New Log Entry -->
    <div class="add-log-entry">
      <button class="add-button" @click="showAddLogModal">
        <span class="button-icon">➕</span>
        Add Log Entry
      </button>
    </div>

    <!-- Log Entries -->
    <div class="log-entries">
      <LogItem
        v-for="log in dataStore.getLogs"
        :key="log.id"
        :logItem="log"
        @edit="showEditLogModal"
        @delete="confirmDeleteLog"
      />
    </div>

    <!-- Log Entry Form Modal -->
    <LogEntryForm
      :show="showLogModal"
      :projectId="projectId"
      :editingLog="editingLog"
      @close="closeLogModal"
      @saved="handleLogSaved"
    />
  </div>
  <div v-else>
    <p>Project not found.</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '../store/dataStore'
import LogItem from '../components/LogItem.vue'
import LogEntryForm from '../components/LogEntryForm.vue'

const route = useRoute()
const dataStore = useDataStore()
const projectId = computed(() => route.params.id)

const project = computed(() => {
  return dataStore.getProjects.find(p => p.id === projectId.value)
})

// Modal state
const showLogModal = ref(false)
const editingLog = ref(null)

onMounted(() => {
  if (projectId.value) {
    dataStore.fetchLogs(projectId.value)
  }
})

const showAddLogModal = () => {
  editingLog.value = null
  showLogModal.value = true
}

const showEditLogModal = (log) => {
  editingLog.value = log
  showLogModal.value = true
}

const closeLogModal = () => {
  showLogModal.value = false
  editingLog.value = null
}

const handleLogSaved = async () => {
  await dataStore.fetchLogs(projectId.value)
  closeLogModal()
}

const confirmDeleteLog = async (log) => {
  if (confirm('Are you sure you want to delete this log entry?')) {
    try {
      await dataStore.deleteLog(log.id)
      await dataStore.fetchLogs(projectId.value)
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }
}
</script>

<style scoped>
.project-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.project-header {
  margin-bottom: 2rem;
}

.project-header h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  font-size: 1.1rem;
}

.add-log-entry {
  margin-bottom: 2rem;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #2563eb;
}

.button-icon {
  font-size: 1.2rem;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
