<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-dark mb-2">WhatsUp</h1>
        <p class="text-gray-600">Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="input-field"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input v-model="remember" type="checkbox" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
            <span class="ml-2 text-sm text-gray-700">Se souvenir de moi</span>
          </label>
          
          <router-link to="/forgot" class="text-sm text-primary hover:text-secondary">
            Mot de passe oublié ?
          </router-link>
        </div>

        <button type="submit" class="btn-primary w-full">
          Se connecter
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Pas encore de compte ?
          <router-link to="/register" class="text-primary hover:text-secondary font-semibold">
            S'inscrire
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const submit = async () => {
  try {
    error.value = ''
    const res = await api.post('/api/auth/login', { email: email.value, password: password.value })
    const { token, user } = res.data.data
    auth.login(token, remember.value)
    auth.setUser(user)
    
    // Redirection selon l'état du profil
    if (!user.username) {
      router.push('/choose-username')
    } else {
      router.push('/upload-avatar')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur connexion'
  }
}
</script>
