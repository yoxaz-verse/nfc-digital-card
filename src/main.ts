import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles.css'
import './profile.css'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import OnboardingView from './views/OnboardingView.vue'
import ProfileEditorView from './views/ProfileEditorView.vue'
import PublicProfileView from './views/PublicProfileView.vue'
import AuthCallbackView from './views/AuthCallbackView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/create', component: OnboardingView },
    { path: '/dashboard', component: ProfileEditorView },
    { path: '/auth/callback', component: AuthCallbackView },
    { path: '/u/:slug', component: PublicProfileView },
    { path: '/templates', redirect: '/create' },
    { path: '/editor', redirect: '/dashboard' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

createApp(App).use(createPinia()).use(router).mount('#app')
