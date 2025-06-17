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
import { useAuthStore } from '../store/authStore';

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/user-home', component: UserHomePage, meta: { requiresAuth: true } },
  { path: '/project/:id', component: ProjectDetailPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const dataStore = useDataStore();
  const authStore = useAuthStore();
  
  // Check if route requires auth
  if (to.meta.requiresAuth && !dataStore.loggedInUser) {
    next('/login');
    return;
  }
  
  // If user is logged in and trying to access login/signup, redirect to home
  if (dataStore.loggedInUser && (to.path === '/login' || to.path === '/signup')) {
    next('/user-home');
    return;
  }
  
  // Otherwise proceed
  next();
});

export default router;
