import { createRouter, createWebHistory } from 'vue-router';
// import Home from '@/views/Home.vue';
// import LoginPage from '@/views/LoginPage.vue';
import Login from '../views/Login.vue';
import UserHomePage from '../views/UserHomePage.vue';
import ProjectDetailPage from '../views/ProjectDetailPage.vue';
// import ProjectDetailPage from '@/views/ProjectDetailPage.vue';
import SignUp from '../views/SignUp.vue';
import HomePage from '../views/HomePage.vue';
import { useDataStore } from '../store/dataStore';

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/user-home', component: UserHomePage, meta: { requiresAuth: true } },
  { path: '/project/:id', component: ProjectDetailPage, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const dataStore = useDataStore();
  
  // Check if route requires auth
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    if (!dataStore.loggedInUser) {
      // Redirect to login
      next({ name: 'login' });
      return;
    }
  }

  // If user is logged in and trying to access login page, redirect to user-home
  if (to.name === 'login' && dataStore.loggedInUser) {
    next({ name: 'user-home' });
    return;
  }

  next();
});

export default router;
