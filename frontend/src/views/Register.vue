<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-dark mb-2">WhatsUp</h1>
        <p class="text-gray-600">Créez votre compte</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
            <input v-model="firstName" required class="input-field" placeholder="Jean" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <input v-model="lastName" required class="input-field" placeholder="Dupont" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="email" type="email" required class="input-field" placeholder="jean.dupont@email.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
          <input v-model="password" type="password" required class="input-field" placeholder="••••••••" />
          <p class="text-xs text-gray-500 mt-1">Au moins 8 caractères</p>
        </div>

        <button type="submit" class="btn-primary w-full">
          S'inscrire
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Déjà un compte ?
          <router-link to="/login" class="text-primary hover:text-secondary font-semibold">
            Se connecter
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const submit = async () => {
  try {
    error.value = ''
    await api.post('/api/auth/register', { firstName: firstName.value, lastName: lastName.value, email: email.value, password: password.value })
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur inscription'
  }
}
</script>