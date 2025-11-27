<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-secondary dark:bg-gray-800 p-4 flex items-center gap-4 shadow">
      <button @click="goBack" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="text-xl font-bold text-white flex-1">Mon Profil</h1>
      <button 
        @click="$router.push('/settings')" 
        class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
        title="Paramètres"
      >
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
      </button>
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

      <!-- Photo de profil -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Photo de profil</h2>
        <div class="flex items-center gap-6">
          <div class="relative">
            <img 
              v-if="user?.avatar" 
              :src="`http://localhost:3000${user.avatar}`" 
              class="w-24 h-24 rounded-full object-cover" 
            />
            <div v-else class="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl">
              {{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}
            </div>
            <label 
              for="avatarInput" 
              class="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition"
            >
              <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/>
              </svg>
            </label>
            <input 
              id="avatarInput" 
              type="file" 
              accept="image/*" 
              class="hidden"
              @change="uploadAvatar"
            />
          </div>
          <div class="flex-1">
            <p class="text-gray-600 dark:text-gray-300 text-sm">
              Cliquez sur l'icône pour changer votre photo de profil
            </p>
            <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Taille maximale : 5 MB - Formats : JPG, PNG, GIF
            </p>
          </div>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations personnelles</h2>
        
        <!-- Pseudo -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pseudo
          </label>
          <div class="flex gap-2">
            <input 
              v-model="editedUsername" 
              type="text" 
              :disabled="!editingUsername"
              class="input-field flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              :class="{'bg-gray-100 dark:bg-gray-700': !editingUsername}"
              placeholder="Votre pseudo"
            />
            <button 
              v-if="!editingUsername"
              @click="startEditUsername" 
              class="btn-secondary"
            >
              Modifier
            </button>
            <button 
              v-else
              @click="saveUsername" 
              class="btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button 
              v-if="editingUsername"
              @click="cancelEditUsername" 
              class="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </div>

        <!-- Bio/Statut -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio / Statut
          </label>
          <div class="flex gap-2">
            <textarea 
              v-model="editedBio" 
              :disabled="!editingBio"
              class="input-field flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 resize-none"
              :class="{'bg-gray-100 dark:bg-gray-700': !editingBio}"
              rows="3"
              maxlength="200"
              placeholder="Votre bio..."
            ></textarea>
            <div class="flex flex-col gap-2">
              <button 
                v-if="!editingBio"
                @click="startEditBio" 
                class="btn-secondary whitespace-nowrap"
              >
                Modifier
              </button>
              <button 
                v-else
                @click="saveBio" 
                class="btn-primary whitespace-nowrap"
                :disabled="saving"
              >
                {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button 
                v-if="editingBio"
                @click="cancelEditBio" 
                class="btn-secondary whitespace-nowrap"
              >
                Annuler
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ editedBio?.length || 0 }} / 200 caractères
          </p>
        </div>

        <!-- Email (non modifiable) -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input 
            :value="user?.email" 
            type="email" 
            disabled
            class="input-field w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            L'email ne peut pas être modifié
          </p>
        </div>

        <!-- Nom et Prénom -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom
            </label>
            <input 
              :value="user?.firstName" 
              type="text" 
              disabled
              class="input-field w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom
            </label>
            <input 
              :value="user?.lastName" 
              type="text" 
              disabled
              class="input-field w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
            />
          </div>
        </div>
      </div>

      <!-- Statut en ligne -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Statut de disponibilité</h2>
        <div class="flex items-center gap-4">
          <button 
            @click="updateStatus('online')"
            :class="[
              'flex-1 p-4 rounded-lg border-2 transition',
              user?.status === 'online' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-30' 
                : 'border-gray-300 dark:border-gray-600'
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-green-500 rounded-full"></div>
              <div class="text-left">
                <p class="font-semibold text-gray-900 dark:text-white">En ligne</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Visible par tous</p>
              </div>
            </div>
          </button>
          
          <button 
            @click="updateStatus('offline')"
            :class="[
              'flex-1 p-4 rounded-lg border-2 transition',
              user?.status === 'offline' 
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-700' 
                : 'border-gray-300 dark:border-gray-600'
            ]"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-gray-500 rounded-full"></div>
              <div class="text-left">
                <p class="font-semibold text-gray-900 dark:text-white">Hors ligne</p>
                <p class="text-xs text-gray-600 dark:text-gray-400">Invisible</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Informations du compte -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations du compte</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">Date d'inscription</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(user?.createdAt) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400">Dernière connexion</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(user?.lastSeen) }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600 dark:text-gray-400">Identifiant unique</span>
            <span class="font-mono text-xs text-gray-900 dark:text-white">{{ user?._id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useTheme } from '../composables/useTheme'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
// Initialiser le thème
useTheme()

const user = ref(null)
const editingUsername = ref(false)
const editingBio = ref(false)
const editedUsername = ref('')
const editedBio = ref('')
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function goBack() {
  router.push('/chat')
}

async function loadProfile() {
  try {
    const res = await api.get('/api/auth/me')
    user.value = res.data.data
    authStore.setUser(user.value)
    editedUsername.value = user.value.username || ''
    editedBio.value = user.value.bio || ''
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    showError('Erreur lors du chargement du profil')
  }
}

function startEditUsername() {
  editingUsername.value = true
  editedUsername.value = user.value.username || ''
}

function cancelEditUsername() {
  editingUsername.value = false
  editedUsername.value = user.value.username || ''
}

async function saveUsername() {
  if (!editedUsername.value || editedUsername.value.length < 3) {
    showError('Le pseudo doit contenir au moins 3 caractères')
    return
  }

  saving.value = true
  try {
    const res = await api.patch('/api/users/profile', { 
      username: editedUsername.value 
    })
    user.value = res.data.data.user
    authStore.setUser(user.value)
    editingUsername.value = false
    showSuccess('Pseudo modifié avec succès')
  } catch (error) {
    console.error('Erreur modification pseudo:', error)
    showError(error.response?.data?.message || 'Erreur lors de la modification du pseudo')
  } finally {
    saving.value = false
  }
}

function startEditBio() {
  editingBio.value = true
  editedBio.value = user.value.bio || ''
}

function cancelEditBio() {
  editingBio.value = false
  editedBio.value = user.value.bio || ''
}

async function saveBio() {
  saving.value = true
  try {
    const res = await api.patch('/api/users/bio', { 
      bio: editedBio.value 
    })
    user.value.bio = res.data.data.bio
    authStore.setUser(user.value)
    editingBio.value = false
    showSuccess('Bio modifiée avec succès')
  } catch (error) {
    console.error('Erreur modification bio:', error)
    showError('Erreur lors de la modification de la bio')
  } finally {
    saving.value = false
  }
}

async function uploadAvatar(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showError('Le fichier est trop volumineux (max 5 MB)')
    return
  }

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const res = await api.post('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    user.value.avatar = res.data.data.avatar
    authStore.setUser(user.value)
    showSuccess('Photo de profil modifiée avec succès')
  } catch (error) {
    console.error('Erreur upload avatar:', error)
    showError('Erreur lors du téléchargement de la photo')
  }
}

async function updateStatus(newStatus) {
  try {
    await api.patch('/api/users/status', { status: newStatus })
    user.value.status = newStatus
    authStore.setUser(user.value)
    showSuccess('Statut modifié avec succès')
  } catch (error) {
    console.error('Erreur modification statut:', error)
    showError('Erreur lors de la modification du statut')
  }
}

function formatDate(date) {
  if (!date) return 'Non disponible'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  loadProfile()
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
