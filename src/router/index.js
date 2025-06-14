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
  
  await dataStore.initialize();
  
  console.log('Navigation guard - Current user:', dataStore.loggedInUser);
  console.log('Navigation guard - To path:', to.path);
  
  if (to.meta.requiresAuth && !dataStore.loggedInUser) {
    console.log('Navigation guard - Redirecting to login');
    next('/login');
  } else if (to.path === '/login' && dataStore.loggedInUser) {
    console.log('Navigation guard - Redirecting to user home');
    next('/user-home');
  } else {
    console.log('Navigation guard - Proceeding to:', to.path);
    next();
  }
});

export default router;
