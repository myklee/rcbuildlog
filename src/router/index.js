import { createRouter, createWebHistory } from 'vue-router';
// import Home from '@/views/Home.vue';
// import LoginPage from '@/views/LoginPage.vue';
import Login from '../views/Login.vue';
// import UserHomePage from '@/views/UserHomePage.vue';
import UserHomePage from '../views/UserHomePage.vue';
import ProjectDetailPage from '../views/ProjectDetailPage.vue';
// import ProjectDetailPage from '@/views/ProjectDetailPage.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/user-home', component: UserHomePage },
  { path: '/project/:id', component: ProjectDetailPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
