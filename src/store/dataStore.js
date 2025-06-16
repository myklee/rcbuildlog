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

  return {
    // State
    loggedInUser,
    projects,
    logs,
    isOffline,
    searchQuery,
    filters,
    isInitialized,
    // Actions
    initialize,
    fetchProjects,
    fetchLogs,
    login,
    logout
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
