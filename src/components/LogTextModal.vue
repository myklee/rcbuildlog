<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2 class="text-xl font-bold mb-4">Add Log Entry</h2>
      
      <div class="form-group">
        <label for="title">Title</label>
        <input 
          id="title"
          v-model="title"
          type="text"
          class="w-full p-2 border rounded"
          placeholder="Enter a title for your log entry"
          required
        />
      </div>

      <div class="form-group">
        <label for="content">Content</label>
        <textarea
          id="content"
          v-model="content"
          class="w-full p-2 border rounded"
          rows="6"
          placeholder="Write your log entry here..."
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label>Links</label>
        <div v-for="(link, index) in links" :key="index" class="link-item">
          <input
            v-model="links[index].url"
            type="url"
            class="link-input"
            placeholder="Enter URL"
          />
          <button @click="removeLink(index)" class="remove-btn">Remove</button>
        </div>
        <button @click="addLink" class="add-btn">Add Link</button>
      </div>

      <div class="form-group">
        <label>Tags</label>
        <div class="tags-container">
          <div v-for="(tag, index) in tags" :key="index" class="tag">
            {{ tag }}
            <button @click="removeTag(index)" class="text-red-500">&times;</button>
          </div>
        </div>
        <div class="tag-input-container">
          <input
            v-model="newTag"
            @keyup.enter="addTag"
            type="text"
            class="tag-input"
            placeholder="Add a tag and press Enter"
          />
        </div>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="cancel-btn">Cancel</button>
        <button 
          @click="saveLog" 
          class="save-btn"
          :disabled="isSaving || !title || !content"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useDataStore } from '../store/dataStore';

export default {
  name: 'LogTextModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    projectId: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const store = useDataStore();
    const title = ref('');
    const content = ref('');
    const links = ref([]);
    const tags = ref([]);
    const newLink = ref('');
    const newTag = ref('');
    const isSaving = ref(false);

    // Auto-save draft every 2 seconds
    let autoSaveInterval;

    onMounted(() => {
      // Restore draft if exists
      if (store.currentDraft) {
        title.value = store.currentDraft.title || '';
        content.value = store.currentDraft.content || '';
        links.value = store.currentDraft.links || [];
        tags.value = store.currentDraft.tags || [];
      }

      // Start auto-save
      autoSaveInterval = setInterval(() => {
        if (title.value || content.value || links.value.length > 0 || tags.value.length > 0) {
          store.saveDraft({
            title: title.value,
            content: content.value,
            links: links.value,
            tags: tags.value
          });
        }
      }, 2000);
    });

    // Clean up auto-save on unmount
    onUnmounted(() => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    });

    // Watch for modal close to clear draft
    watch(() => props.show, (newVal) => {
      if (!newVal) {
        store.clearDraft();
      }
    });

    function closeModal() {
      emit('close');
    }

    function addLink() {
      links.value.push({ url: '' });
    }

    function removeLink(index) {
      links.value.splice(index, 1);
    }

    function addTag() {
      if (newTag.value.trim()) {
        tags.value.push(newTag.value.trim());
        newTag.value = '';
      }
    }

    function removeTag(index) {
      tags.value.splice(index, 1);
    }

    async function saveLog() {
      if (!title.value || !content.value) return;
      
      isSaving.value = true;
      try {
        await store.addLog({
          project_id: props.projectId,
          title: title.value,
          content: content.value,
          links: links.value.filter(link => link.url.trim()),
          tags: tags.value
        });
        
        // Clear draft after successful save
        store.clearDraft();
        
        // Reset form
        title.value = '';
        content.value = '';
        links.value = [];
        tags.value = [];
        
        emit('saved');
        emit('close');
      } catch (error) {
        console.error('Error saving log:', error);
      } finally {
        isSaving.value = false;
      }
    }

    return {
      title,
      content,
      links,
      tags,
      newLink,
      newTag,
      isSaving,
      closeModal,
      addLink,
      removeLink,
      addTag,
      removeTag,
      saveLog
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.link-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.remove-btn {
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-input-container {
  margin-top: 0.5rem;
}

.tag-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #d1d5db;
}

.save-btn:hover {
  background: #2563eb;
}

.save-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style> 