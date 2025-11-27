<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-secondary dark:bg-gray-800 p-4 flex items-center gap-4 shadow">
      <button @click="goBack" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="text-xl font-bold text-white flex-1">Paramètres</h1>
    </div>

    <div class="max-w-2xl mx-auto p-6">
      <!-- Message de succès -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg flex items-center gap-3">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-3">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Paramètres d'apparence -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Apparence</h2>
        
        <!-- Dark Mode -->
        <div class="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg mb-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-primary">
                <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Mode sombre</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Activer le thème sombre</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="darkMode" 
              @change="toggleDarkMode"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        <!-- Thème couleur (optionnel) -->
        <div class="p-4 border dark:border-gray-700 rounded-lg">
          <p class="font-medium text-gray-900 dark:text-white mb-3">Thème de couleur</p>
          <div class="grid grid-cols-4 gap-3">
            <button 
              v-for="color in themeColors" 
              :key="color.name"
              @click="changeThemeColor(color)"
              :class="[
                'h-12 rounded-lg border-2 transition',
                currentColor === color.name ? 'border-gray-900 dark:border-white' : 'border-transparent'
              ]"
              :style="{ backgroundColor: color.value }"
              :title="color.label"
            ></button>
          </div>
        </div>
      </div>

      <!-- Paramètres de compte -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Compte</h2>
        
        <!-- Lien vers profil -->
        <button 
          @click="$router.push('/profile')" 
          class="w-full flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-blue-600 dark:text-blue-400">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
              </svg>
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900 dark:text-white">Mon profil</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Modifier vos informations</p>
            </div>
          </div>
          <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-gray-400">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
          </svg>
        </button>
      </div>

      <!-- Sécurité -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sécurité</h2>
        
        <!-- Changement de mot de passe -->
        <div class="p-4 border dark:border-gray-700 rounded-lg">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-red-600 dark:text-red-400">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white mb-1">Changer le mot de passe</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Définir un nouveau mot de passe pour votre compte
              </p>
              
              <div v-if="!changingPassword">
                <button 
                  @click="changingPassword = true" 
                  class="btn-secondary"
                >
                  Modifier mon mot de passe
                </button>
              </div>
              
              <div v-else class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input 
                    v-model="newPassword" 
                    type="password" 
                    class="input-field w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="Minimum 6 caractères"
                    minlength="6"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input 
                    v-model="confirmPassword" 
                    type="password" 
                    class="input-field w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="Retapez le mot de passe"
                    minlength="6"
                  />
                </div>
                
                <div class="flex gap-2">
                  <button 
                    @click="changePassword" 
                    class="btn-primary"
                    :disabled="saving || !newPassword || !confirmPassword"
                  >
                    {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button 
                    @click="cancelPasswordChange" 
                    class="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions</h2>
        
        <!-- Déconnexion -->
        <button 
          @click="logout" 
          class="w-full flex items-center gap-4 p-4 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition"
        >
          <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
            <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
          </svg>
          <span class="font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useTheme } from '../composables/useTheme'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, currentColor, colors, setDarkMode, setThemeColor } = useTheme()

const darkMode = computed({
  get: () => isDark.value,
  set: (value) => setDarkMode(value)
})

const changingPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const themeColors = [
  { name: 'blue', label: 'Bleu', value: colors.blue },
  { name: 'purple', label: 'Violet', value: colors.purple },
  { name: 'pink', label: 'Rose', value: colors.pink },
  { name: 'green', label: 'Vert', value: colors.green }
]

function goBack() {
  router.push('/chat')
}

function toggleDarkMode() {
  showSuccess('Thème modifié avec succès')
}

function changeThemeColor(color) {
  setThemeColor(color.name)
  showSuccess(`Thème ${color.label} appliqué`)
}

async function changePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    showError('Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    showError('Les mots de passe ne correspondent pas')
    return
  }

  saving.value = true
  try {
    await api.put('/api/auth/password', {
      newPassword: newPassword.value
    })
    showSuccess('Mot de passe modifié avec succès')
    cancelPasswordChange()
  } catch (error) {
    console.error('Erreur changement mot de passe:', error)
    showError(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
  } finally {
    saving.value = false
  }
}

function cancelPasswordChange() {
  changingPassword.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

function logout() {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    authStore.logout()
    router.push('/login')
  }
}

function showSuccess(message) {
  successMessage.value = message
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function showError(message) {
  errorMessage.value = message
  successMessage.value = ''
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

onMounted(() => {
  // Le thème est déjà initialisé par useTheme
  // Rien à faire ici
})
</script>

<style scoped>
.input-field {
  @apply px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent;
}

.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition;
}
</style>
