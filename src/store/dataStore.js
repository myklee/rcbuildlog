import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export const useDataStore = defineStore('dataStore', () => {
  // State
  const loggedInUser = ref(null);
  const projects = ref([]);
  const logs = ref([]);
  const isOffline = ref(false);
  const searchQuery = ref('');
  const filters = ref({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const isInitialized = ref(false);
  const images = ref([]);
  const videos = ref([]);
  const documents = ref([]);
  const currentDraft = ref(null);

  // Actions
  async function initialize() {
    if (isInitialized.value) {
      console.log('Store already initialized, skipping...')
      return;
    }

    try {
      console.log('Initializing store...')
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      console.log('Session check:', session ? 'Found session' : 'No session')
      
      if (session) {
        console.log('Setting user from session:', session.user)
        loggedInUser.value = session.user
        console.log('Fetching projects...')
        await fetchProjects()
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
        if (event === 'SIGNED_IN' && session) {
          loggedInUser.value = session.user
          await fetchProjects()
        } else if (event === 'SIGNED_OUT') {
          loggedInUser.value = null
          projects.value = []
          logs.value = []
          images.value = []
          videos.value = []
          documents.value = []
        }
      })

      isInitialized.value = true
      console.log('Store initialization complete')
    } catch (e) {
      console.error('Data store initialization error:', e)
      throw e
    }
  }

  async function fetchProjects() {
    if (!loggedInUser.value) {
      console.log('No user, skipping project fetch')
      return [];
    }
    try {
      console.log('Fetching projects for user:', loggedInUser.value.id)
      let query = supabase
        .from('projects')
        .select('*')
        .eq('user_id', loggedInUser.value.id);

      // Apply sorting
      query = query.order(filters.value.sortBy, { 
        ascending: filters.value.sortOrder === 'asc' 
      });

      const { data, error } = await query;
      if (error) throw error;
      
      console.log('Projects fetched:', data.length)
      projects.value = data;
      isOffline.value = false;
      return data;
    } catch (e) {
      console.error('Error fetching projects:', e);
      return [];
    }
  }

  async function fetchLogs(projectId) {
    if (!loggedInUser.value) return [];
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      logs.value = data;
      isOffline.value = false;
      return data;
    } catch (e) {
      console.error('Error fetching logs:', e);
      return [];
    }
  }

  async function addLog(log) {
    if (!loggedInUser.value) return;
    try {
      console.log('Adding log:', log)
      const { data, error } = await supabase
        .from('logs')
        .insert([{
          project_id: log.project_id,
          title: log.title,
          content: log.content,
          links: log.links,
          tags: log.tags,
          user_id: loggedInUser.value.id
        }])
        .select();
        
      if (error) throw error;
      logs.value = [data[0], ...logs.value];
      return data[0];
    } catch (e) {
      console.error('Error adding log:', e);
      throw e;
    }
  }

  async function deleteLog(logId) {
    if (!loggedInUser.value) return;
    try {
      console.log('Deleting log:', logId)
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', loggedInUser.value.id);
        
      if (error) throw error;
      logs.value = logs.value.filter(log => log.id !== logId);
    } catch (e) {
      console.error('Error deleting log:', e);
      throw e;
    }
  }

  async function login(email, password) {
    try {
      console.log('Attempting login...')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      
      console.log('Login successful, setting user:', data.user)
      loggedInUser.value = data.user
      isOffline.value = false
      await fetchProjects()
      
      return true
    } catch (e) {
      console.error('Login error:', e)
      return false
    }
  }

  async function logout() {
    try {
      console.log('Attempting logout...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('Logout successful')
      loggedInUser.value = null
      projects.value = []
      logs.value = []
      
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  // Media Methods
  async function addImage(image) {
    if (!loggedInUser.value) return;
    try {
      console.log('Adding image:', image)
      const { data, error } = await supabase
        .from('images')
        .insert([{
          project_id: image.project_id,
          image_url: image.image_url,
          image_description: image.image_description,
          user_id: loggedInUser.value.id
        }])
        .select();
      if (error) throw error;
      images.value = [...images.value, data[0]];
      return data[0];
    } catch (e) {
      console.error('Error adding image:', e);
      throw e;
    }
  }

  async function fetchImages(projectId) {
    if (!loggedInUser.value) return [];
    try {
      console.log('Fetching images for project:', projectId)
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      images.value = data;
      return data;
    } catch (e) {
      console.error('Error fetching images:', e);
      return [];
    }
  }

  async function deleteImage(imageId) {
    if (!loggedInUser.value) return;
    try {
      console.log('Deleting image:', imageId)
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', loggedInUser.value.id);
      if (error) throw error;
      images.value = images.value.filter(img => img.id !== imageId);
    } catch (e) {
      console.error('Error deleting image:', e);
      throw e;
    }
  }

  async function addVideo(videoData) {
    if (!loggedInUser.value) return;
    try {
      console.log('Adding video:', videoData)
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          project_id: videoData.project_id,
          video_url: videoData.video_url,
          video_description: videoData.video_description,
          user_id: loggedInUser.value.id
        }])
        .select();
      if (error) throw error;
      videos.value = [...videos.value, data[0]];
      return data[0];
    } catch (e) {
      console.error('Error adding video:', e);
      throw e;
    }
  }

  async function fetchVideos(projectId) {
    if (!loggedInUser.value) return [];
    try {
      console.log('Fetching videos for project:', projectId)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      videos.value = data;
      return data;
    } catch (e) {
      console.error('Error fetching videos:', e);
      return [];
    }
  }

  async function deleteVideo(videoId) {
    if (!loggedInUser.value) return;
    try {
      console.log('Deleting video:', videoId)
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', loggedInUser.value.id);
      if (error) throw error;
      videos.value = videos.value.filter(vid => vid.id !== videoId);
    } catch (e) {
      console.error('Error deleting video:', e);
      throw e;
    }
  }

  async function addDocument(documentData) {
    if (!loggedInUser.value) return;
    try {
      console.log('Adding document:', documentData)
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          project_id: documentData.project_id,
          document_url: documentData.document_url,
          document_name: documentData.document_name,
          document_description: documentData.document_description,
          user_id: loggedInUser.value.id
        }])
        .select();
      if (error) throw error;
      documents.value = [...documents.value, data[0]];
      return data[0];
    } catch (e) {
      console.error('Error adding document:', e);
      throw e;
    }
  }

  async function fetchDocuments(projectId) {
    if (!loggedInUser.value) return [];
    try {
      console.log('Fetching documents for project:', projectId)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      documents.value = data;
      return data;
    } catch (e) {
      console.error('Error fetching documents:', e);
      return [];
    }
  }

  async function deleteDocument(documentId) {
    if (!loggedInUser.value) return;
    try {
      console.log('Deleting document:', documentId)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', loggedInUser.value.id);
      if (error) throw error;
      documents.value = documents.value.filter(doc => doc.id !== documentId);
    } catch (e) {
      console.error('Error deleting document:', e);
      throw e;
    }
  }

  function saveDraft(draft) {
    console.log('Saving draft:', draft);
    currentDraft.value = draft;
  }

  function clearDraft() {
    console.log('Clearing draft');
    currentDraft.value = null;
  }

  return {
    // State
    loggedInUser,
    projects,
    logs,
    isOffline,
    searchQuery,
    filters,
    isInitialized,
    images,
    videos,
    documents,
    currentDraft,
    // Actions
    initialize,
    fetchProjects,
    fetchLogs,
    addLog,
    deleteLog,
    login,
    logout,
    // Media Actions
    addImage,
    fetchImages,
    deleteImage,
    addVideo,
    fetchVideos,
    deleteVideo,
    addDocument,
    fetchDocuments,
    deleteDocument,
    // Draft Actions
    saveDraft,
    clearDraft
  }
}, {
  persist: {
    key: 'rcbuildlog-store',
    storage: localStorage,
    paths: ['filters', 'searchQuery', 'loggedInUser', 'projects'],
    beforeRestore: (context) => {
      console.log('Before restore:', context)
    },
    afterRestore: (context) => {
      console.log('After restore:', context)
      // If we have a user but no projects, fetch them
      if (context.store.loggedInUser && (!context.store.projects || context.store.projects.length === 0)) {
        console.log('User exists but no projects, fetching...')
        context.store.fetchProjects()
      }
    }
  }
})
