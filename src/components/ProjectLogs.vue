<template>
  <div class="space-y-4">
    <!-- Add New Log Button -->
    <button
      @click="showAddLogModal = true"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add New Log
    </button>

    <!-- Logs List -->
    <div class="space-y-4">
      <div v-for="log in logs" :key="log.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-medium">{{ log.title }}</h3>
          <div class="flex gap-2">
            <button
              @click="editLog(log)"
              class="text-gray-500 hover:text-blue-600"
              title="Edit"
            >
              ✏️
            </button>
            <button
              @click="confirmDeleteLog(log)"
              class="text-gray-500 hover:text-red-600"
              title="Delete"
            >
              🗑
            </button>
          </div>
        </div>
        <p class="text-gray-600 whitespace-pre-wrap">{{ log.content }}</p>
        <p class="text-sm text-gray-400 mt-2">
          {{ formatDate(log.created_at) }}
        </p>
      </div>
    </div>

    <!-- Add/Edit Log Modal -->
    <div v-if="showAddLogModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">{{ editingLog ? 'Edit Log' : 'Add New Log' }}</h3>
        
        <form @submit.prevent="saveLog">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Title</label>
            <input
              v-model="logForm.title"
              type="text"
              class="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Content</label>
            <textarea
              v-model="logForm.content"
              class="w-full px-3 py-2 border rounded"
              rows="5"
              required
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeLogModal"
              class="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {{ editingLog ? 'Save Changes' : 'Add Log' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Delete Log</h3>
        <p class="mb-4">Are you sure you want to delete this log? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            @click="deleteLog"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../store/dataStore'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const dataStore = useDataStore()

// State
const logs = ref([])
const showAddLogModal = ref(false)
const showDeleteModal = ref(false)
const editingLog = ref(null)
const logToDelete = ref(null)

const logForm = ref({
  title: '',
  content: ''
})

// Load logs when component mounts
onMounted(async () => {
  await fetchLogs()
})

// Methods
const fetchLogs = async () => {
  logs.value = await dataStore.fetchLogs(props.projectId)
}

const editLog = (log) => {
  editingLog.value = log
  logForm.value = {
    title: log.title,
    content: log.content
  }
  showAddLogModal.value = true
}

const closeLogModal = () => {
  showAddLogModal.value = false
  editingLog.value = null
  logForm.value = {
    title: '',
    content: ''
  }
}

const saveLog = async () => {
  try {
    if (editingLog.value) {
      await dataStore.updateLog(editingLog.value.id, {
        title: logForm.value.title,
        content: logForm.value.content
      })
    } else {
      await dataStore.addLog({
        project_id: props.projectId,
        title: logForm.value.title,
        content: logForm.value.content
      })
    }
    await fetchLogs()
    closeLogModal()
  } catch (error) {
    console.error('Error saving log:', error)
  }
}

const confirmDeleteLog = (log) => {
  logToDelete.value = log
  showDeleteModal.value = true
}

const deleteLog = async () => {
  if (!logToDelete.value) return
  
  try {
    await dataStore.deleteLog(logToDelete.value.id)
    await fetchLogs()
    showDeleteModal.value = false
    logToDelete.value = null
  } catch (error) {
    console.error('Error deleting log:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 