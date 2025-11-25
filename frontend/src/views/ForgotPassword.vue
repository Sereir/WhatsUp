<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-dark mb-2">Mot de passe oublié</h2>
        <p class="text-gray-600">Entrez votre email pour réinitialiser votre mot de passe</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="info" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {{ info }}
        </div>
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input v-model="email" type="email" required class="input-field" placeholder="votre@email.com" />
        </div>

        <button type="submit" class="btn-primary w-full">
          Envoyer le lien de réinitialisation
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-primary hover:text-secondary font-semibold">
          ← Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const email = ref('')
const error = ref('')
const info = ref('')

const submit = async () => {
  try {
    error.value = ''
    const res = await api.post('/api/auth/forgot', { email: email.value })
    info.value = res.data.message || 'Email envoyé'
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur'
  }
}
</script>