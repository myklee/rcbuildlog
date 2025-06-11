import { defineStore } from 'pinia';

const LOCAL_STORAGE_KEY = 'myProjectTrackerStore';

export const useDataStore = defineStore('dataStore', {
  state: () => {
    // Load from localStorage or fallback to default data
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If JSON parsing fails, fall back to default initial state
      }
    }
    return {
      users: [
        { 
          id: 1, 
          username: 'john', 
          password: '123', 
          projects: [
            { id: 1, name: 'Project One', description: 'A detailed description of project one',
              media: []
             },
            { id: 2, name: 'Project Two', description: 'A detailed description of project two' }
          ] 
        },
        { 
          id: 2, 
          username: 'jane', 
          password: '123', 
          projects: [
            { id: 3, name: 'Project Three', description: 'A detailed description of project three' },
            { id: 4, name: 'Project Four', description: 'A detailed description of project four' }
          ] 
        }
      ],
      loggedInUser: null,
    };
  },

  actions: {
    login(username, password) {
      const user = this.users.find(u => u.username === username && u.password === password);
      if (user) {
        this.loggedInUser = user;
        this.saveState();
      } else {
        this.loggedInUser = null;
      }
    },

    logout() {
      this.loggedInUser = null;
      this.saveState();
    },

    fetchProjects() {
      return this.loggedInUser ? this.loggedInUser.projects : [];
    },

    addProject(project) {
      if (this.loggedInUser) {
        this.loggedInUser.projects.push(project);
        this.saveState();
      }
    },

    // Save the entire store state to localStorage
    saveState() {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.$state));
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.loggedInUser,
    getUser: (state) => state.loggedInUser,
    getProjects: (state) => (state.loggedInUser ? state.loggedInUser.projects : []),
  },
});
