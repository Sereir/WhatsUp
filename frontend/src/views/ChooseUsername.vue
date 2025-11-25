<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-dark mb-2">Choisissez votre pseudo</h2>
        <p class="text-gray-600">C'est ainsi que vos contacts vous verront</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Pseudo</label>
          <input 
            v-model="username" 
            required 
            class="input-field" 
            placeholder="jean_dupont"
            pattern="[a-zA-Z0-9_]{3,20}"
            title="3-20 caractères : lettres, chiffres et underscore"
          />
          <p class="text-xs text-gray-500 mt-1">3-20 caractères : lettres, chiffres et underscore</p>
        </div>

        <button type="submit" class="btn-primary w-full">
          Continuer
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const username = ref('')
const error = ref('')
const router = useRouter()

const submit = async () => {
  try {
    error.value = ''
    await api.put('/api/users/me/username', { username: username.value })
    router.push('/upload-avatar')
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur'
  }
}
</script>