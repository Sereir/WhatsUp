import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ChooseUsername from '../views/ChooseUsername.vue'
import UploadAvatar from '../views/UploadAvatar.vue'
import { useAuthStore } from '../store/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/choose-username', component: ChooseUsername, meta: { requiresAuth: true } },
  { path: '/upload-avatar', component: UploadAvatar, meta: { requiresAuth: true } }
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
    next('/choose-username')
  } else {
    next()
  }
})

export default router
