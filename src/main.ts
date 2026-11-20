import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles.css'
import './profile.css'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/create', redirect: '/cards/new' },
    { path: '/dashboard', component: () => import('./views/WorkspaceView.vue') },
    { path: '/cards/new', component: () => import('./views/TemplatesView.vue') },
    { path: '/cards/:id/edit', component: () => import('./views/EditorView.vue') },
    { path: '/profiles/new', component: () => import('./views/OnboardingView.vue') },
    { path: '/profiles/:id/edit', component: () => import('./views/ProfileEditorView.vue') },
    { path: '/auth/callback', component: () => import('./views/AuthCallbackView.vue') },
    { path: '/u/:slug', component: () => import('./views/PublicProfileView.vue') },
    { path: '/templates', redirect: '/cards/new' },
    { path: '/editor', redirect: '/dashboard' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(createPinia()).use(router).mount('#app')
