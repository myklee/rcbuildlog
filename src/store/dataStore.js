import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'myProjectTrackerStore';

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    loggedInUser: null,
    projects: [],
    logs: [],
    isOffline: false,
  }),

  actions: {
    // --- AUTH ---
    async login(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.loggedInUser = data.user;
        this.isOffline = false;
        this.saveState();
        return true;
      } catch (e) {
        // Fallback to localStorage
        const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (saved && saved.loggedInUser && saved.loggedInUser.email === email) {
          this.loggedInUser = saved.loggedInUser;
          this.isOffline = true;
          return true;
        }
        return false;
      }
    },

    async signup(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // Optionally, you can auto-login after signup
      this.loggedInUser = data.user;
      this.saveState();
      return true;
    },

    async logout() {
      try {
        await supabase.auth.signOut();
      } catch {}
      this.loggedInUser = null;
      this.projects = [];
      this.logs = [];
      this.saveState();
    },

    // --- PROJECTS ---
    async fetchProjects() {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', this.loggedInUser.id);
        if (error) throw error;
        this.projects = data;
        this.isOffline = false;
        this.saveState();
        return data;
      } catch (e) {
        // Fallback to localStorage
        const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (saved && saved.projects) {
          this.projects = saved.projects;
          this.isOffline = true;
          return saved.projects;
        }
        return [];
      }
    },

    async addProject(project) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert([{ ...project, user_id: this.loggedInUser.id }])
          .select();
        if (error) throw error;
        this.projects.push(data[0]);
        this.isOffline = false;
        this.saveState();
      } catch (e) {
        // Offline: add locally
        this.projects.push({ ...project, user_id: this.loggedInUser.id, id: Date.now() });
        this.isOffline = true;
        this.saveState();
      }
    },

    // --- LOGS ---
    async fetchLogs(projectId) {
      if (!this.loggedInUser) return [];
      try {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .eq('project_id', projectId);
        if (error) throw error;
        this.logs = data;
        this.isOffline = false;
        this.saveState();
        return data;
      } catch (e) {
        // Fallback to localStorage
        const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (saved && saved.logs) {
          this.logs = saved.logs.filter(log => log.project_id === projectId);
          this.isOffline = true;
          return this.logs;
        }
        return [];
      }
    },

    async addLog(log) {
      if (!this.loggedInUser) return;
      try {
        const { data, error } = await supabase
          .from('logs')
          .insert([log])
          .select();
        if (error) throw error;
        this.logs.push(data[0]);
        this.isOffline = false;
        this.saveState();
      } catch (e) {
        // Offline: add locally
        this.logs.push({ ...log, id: Date.now() });
        this.isOffline = true;
        this.saveState();
      }
    },

    // --- LOCALSTORAGE SYNC ---
    saveState() {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        loggedInUser: this.loggedInUser,
        projects: this.projects,
        logs: this.logs,
      }));
    },

    loadState() {
      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      if (saved) {
        this.loggedInUser = saved.loggedInUser;
        this.projects = saved.projects || [];
        this.logs = saved.logs || [];
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.loggedInUser,
    getUser: (state) => state.loggedInUser,
    getProjects: (state) => state.projects,
    getLogs: (state) => state.logs,
  }
});
