import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'myProjectTrackerStore';

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    loggedInUser: null,
    projects: [],
    logs: [],
    isOffline: false,
    searchQuery: '',
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
  }),

  actions: {
    async initialize() {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (session) {
          this.loggedInUser = session.user
          await this.fetchProjects()
        } else {
          // Try to load state from localStorage
          this.loadState()
        }

        // Set up auth state change listener
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            this.loggedInUser = session.user
            await this.fetchProjects()
          } else if (event === 'SIGNED_OUT') {
            this.loggedInUser = null
            this.projects = []
            this.logs = []
          }
          this.saveState()
        })
      } catch (e) {
        console.error('Data store initialization error:', e)
        throw e
      }
    },

    // --- AUTH ---
    async login(email, password) {
      try {
        console.log('Attempting login...')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        console.log('Login successful, setting user:', data.user)
        this.loggedInUser = data.user
        this.isOffline = false
        await this.fetchProjects()
        this.saveState()
        
        return true
      } catch (e) {
        console.error('Login error:', e)
        return false
      }
    },

    async signup(email, password) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        this.loggedInUser = data.user;
        this.saveState();
        return true;
      } catch (e) {
        console.error('Signup error:', e);
        throw e;
      }
    },

    async logout() {
      try {
        console.log('Attempting logout...')
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        console.log('Logout successful')
        this.loggedInUser = null
        this.projects = []
        this.logs = []
        this.saveState()
        
        // Clear any stored session data
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        
        return true
      } catch (error) {
        console.error('Logout error:', error)
        return false
      }
    },

    // --- PROJECTS ---
    async fetchProjects() {
      if (!this.loggedInUser) return [];
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .eq('user_id', this.loggedInUser.id);

        // Apply sorting
        query = query.order(this.filters.sortBy, { 
          ascending: this.filters.sortOrder === 'asc' 
        });

        const { data, error } = await query;
        if (error) throw error;
        
        this.projects = data;
        this.isOffline = false;
        this.saveState();
        return data;
      } catch (e) {
        console.error('Error fetching projects:', e);
        return [];
      }
    },

    async searchProjects(query) {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', this.loggedInUser.id)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order(this.filters.sortBy, { 
            ascending: this.filters.sortOrder === 'asc' 
          });

        if (error) throw error;
        return data;
      } catch (e) {
        console.error('Error searching projects:', e);
        return [];
      }
    },

    async addProject(project) {
      if (!this.loggedInUser) return;
      try {
        // Handle image upload if present
        let imageUrl = project.imageUrl;
        if (project.imageUrl && project.imageUrl.startsWith('blob:')) {
          const response = await fetch(project.imageUrl);
          const blob = await response.blob();
          const fileName = `project-${Date.now()}.${blob.type.split('/')[1]}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(fileName, blob);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);
            
          imageUrl = publicUrl;
        }

        const { data, error } = await supabase
          .from('projects')
          .insert([{
            name: project.name,
            description: project.description,
            image_url: imageUrl,
            user_id: this.loggedInUser.id
          }])
          .select();
          
        if (error) throw error;
        this.projects.unshift(data[0]);
        this.isOffline = false;
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error adding project:', e);
        throw e;
      }
    },

    async updateProject(projectId, updates) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)
          .eq('user_id', this.loggedInUser.id)
          .select();
          
        if (error) throw error;
        
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          this.projects[index] = data[0];
        }
        
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error updating project:', e);
        throw e;
      }
    },

    async deleteProject(projectId) {
      if (!this.loggedInUser) return;
      try {
        // First, get the project to check for image
        const { data: project } = await supabase
          .from('projects')
          .select('image_url')
          .eq('id', projectId)
          .single();

        // Delete the image from storage if it exists
        if (project?.image_url) {
          const imagePath = project.image_url.split('/').pop();
          await supabase.storage
            .from('project-images')
            .remove([imagePath]);
        }

        // Delete the project
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', this.loggedInUser.id);
          
        if (error) throw error;
        
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveState();
      } catch (e) {
        console.error('Error deleting project:', e);
        throw e;
      }
    },

    // --- LOGS ---
    async fetchLogs(projectId) {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        this.logs = data;
        this.isOffline = false;
        this.saveState();
        return data;
      } catch (e) {
        console.error('Error fetching logs:', e);
        return [];
      }
    },

    async addLog(log) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('logs')
          .insert([{
            ...log,
            user_id: this.loggedInUser.id
          }])
          .select();
          
        if (error) throw error;
        this.logs.unshift(data[0]);
        this.isOffline = false;
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error adding log:', e);
        throw e;
      }
    },

    async updateLog(logId, updates) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('logs')
          .update(updates)
          .eq('id', logId)
          .eq('user_id', this.loggedInUser.id)
          .select();
          
        if (error) throw error;
        
        const index = this.logs.findIndex(l => l.id === logId);
        if (index !== -1) {
          this.logs[index] = data[0];
        }
        
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error updating log:', e);
        throw e;
      }
    },

    async deleteLog(logId) {
      if (!this.loggedInUser) return;
      try {
        const { error } = await supabase
          .from('logs')
          .delete()
          .eq('id', logId)
          .eq('user_id', this.loggedInUser.id);
          
        if (error) throw error;
        
        this.logs = this.logs.filter(l => l.id !== logId);
        this.saveState();
      } catch (e) {
        console.error('Error deleting log:', e);
        throw e;
      }
    },

    // --- UTILITY ---
    saveState() {
      try {
        const state = {
          loggedInUser: this.loggedInUser,
          projects: this.projects,
          logs: this.logs,
          isOffline: this.isOffline
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Error saving state:', e);
      }
    },

    loadState() {
      try {
        const state = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (state) {
          this.loggedInUser = state.loggedInUser;
          this.projects = state.projects;
          this.logs = state.logs;
          this.isOffline = state.isOffline;
        }
      } catch (e) {
        console.error('Error loading state:', e);
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      return this.fetchProjects();
    },

    async addImage(image) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('images')
          .insert([{
            project_id: image.project_id,
            image_url: image.image_url,
            image_description: image.image_description,
            user_id: this.loggedInUser.id
          }])
          .select();
        if (error) throw error;
        // Optionally, you could push to a local images array if you keep one
        this.isOffline = false;
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error adding image:', e);
        throw e;
      }
    },

    async addVideo(videoData) {
      if (!this.loggedInUser) return;
      try {
        console.log('Adding video to store:', videoData)
        const { data, error } = await supabase
          .from('videos')
          .insert([
            {
              project_id: videoData.project_id,
              user_id: this.loggedInUser.id,
              video_url: videoData.video_url,
              video_description: videoData.video_description
            }
          ])
          .select()
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        console.log('Video added successfully:', data)
        this.videos = [...this.videos, data[0]]
        this.saveState()
        return data[0]
      } catch (e) {
        console.error('Error adding video:', e)
        throw e
      }
    },

    async fetchImages(projectId) {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        this.images = data;
        this.saveState();
        return data;
      } catch (e) {
        console.error('Error fetching images:', e);
        return [];
      }
    },

    async fetchVideos(projectId) {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        this.videos = data;
        this.saveState();
        return data;
      } catch (e) {
        console.error('Error fetching videos:', e);
        return [];
      }
    },

    async updateImage(imageId, updates) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('images')
          .update(updates)
          .eq('id', imageId)
          .eq('user_id', this.loggedInUser.id)
          .select();
        if (error) throw error;
        const index = this.images.findIndex(img => img.id === imageId);
        if (index !== -1) {
          this.images[index] = data[0];
        }
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error updating image:', e);
        throw e;
      }
    },

    async deleteImage(imageId) {
      if (!this.loggedInUser) return;
      try {
        const { error } = await supabase
          .from('images')
          .delete()
          .eq('id', imageId)
          .eq('user_id', this.loggedInUser.id);
        if (error) throw error;
        this.images = this.images.filter(img => img.id !== imageId);
        this.saveState();
      } catch (e) {
        console.error('Error deleting image:', e);
        throw e;
      }
    },

    async updateVideo(videoId, updates) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('videos')
          .update(updates)
          .eq('id', videoId)
          .eq('user_id', this.loggedInUser.id)
          .select();
        if (error) throw error;
        const index = this.videos.findIndex(vid => vid.id === videoId);
        if (index !== -1) {
          this.videos[index] = data[0];
        }
        this.saveState();
        return data[0];
      } catch (e) {
        console.error('Error updating video:', e);
        throw e;
      }
    },

    async deleteVideo(videoId) {
      if (!this.loggedInUser) return;
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId)
          .eq('user_id', this.loggedInUser.id);
        if (error) throw error;
        this.videos = this.videos.filter(vid => vid.id !== videoId);
        this.saveState();
      } catch (e) {
        console.error('Error deleting video:', e);
        throw e;
      }
    },
  },

  getters: {
    getUser: (state) => state.loggedInUser,
    getProjects: (state) => state.projects,
    getLogs: (state) => state.logs,
    getOfflineStatus: (state) => state.isOffline
  }
});
