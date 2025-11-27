import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ChooseUsername from '../views/ChooseUsername.vue'
import UploadAvatar from '../views/UploadAvatar.vue'
import Chat from '../views/Chat.vue'
import Contacts from '../views/Contacts.vue'
import CreateGroup from '../views/CreateGroup.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/choose-username', component: ChooseUsername, meta: { requiresAuth: true } },
  { path: '/upload-avatar', component: UploadAvatar, meta: { requiresAuth: true } },
  { path: '/chat', component: Chat, meta: { requiresAuth: true } },
  { path: '/contacts', component: Contacts, meta: { requiresAuth: true } },
  { path: '/create-group', component: CreateGroup, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && authStore.token) {
    next('/chat')
  } else {
    next()
  }
})

export default router
