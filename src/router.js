import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './components/LoginPage.vue';
import MainPage from './components/MainPage.vue';
import SchemaPage from './components/SchemaPage.vue';
import VisualizationPage from './components/VisualizationPage.vue';
import DownloadPDF from './components/DownloadPDF.vue';

const routes= [
  { path: '/', component: LoginPage },
  { path: '/login', component: LoginPage },
  { path: '/main', component: MainPage },
  { path: '/schema', component: SchemaPage },
  { path: '/visualization', component: VisualizationPage },
  { path: '/downloadPDF', component: DownloadPDF }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

