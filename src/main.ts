import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles.css'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import EditorView from './views/EditorView.vue'
import TemplatesView from './views/TemplatesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/templates', component: TemplatesView },
    { path: '/editor', component: EditorView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(createPinia()).use(router).mount('#app')
