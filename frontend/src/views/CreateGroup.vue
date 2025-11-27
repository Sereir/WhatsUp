<template>
  <div class="create-group-container h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-primary text-white p-4 shadow-md flex items-center gap-4">
      <button
        @click="$router.back()"
        class="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
      >
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
        </svg>
      </button>
      <h1 class="text-2xl font-bold">Créer un groupe</h1>
    </div>

    <!-- Formulaire -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Étape 1: Infos du groupe -->
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900">Informations du groupe</h2>

          <!-- Photo du groupe -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <div
                v-if="!groupPhoto"
                class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
                @click="$refs.photoInput.click()"
              >
                <svg viewBox="0 0 24 24" class="w-12 h-12 fill-current text-gray-400">
                  <path d="M9,2V7.38L10.38,8.76L12,7.14L13.62,8.76L15,7.38V2H9M15,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,14A1.5,1.5 0 0,1 15,15.5M21,9H3V3H9V7.38L10.38,8.76L12,7.14L13.62,8.76L15,7.38V9H21V9M21,9V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V9H21Z"/>
                </svg>
              </div>
              <img
                v-else
                :src="groupPhotoPreview"
                class="w-24 h-24 rounded-full object-cover cursor-pointer"
                @click="$refs.photoInput.click()"
              />
              <button
                v-if="groupPhoto"
                @click="removePhoto"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </button>
            </div>
            <div>
              <button
                @click="$refs.photoInput.click()"
                class="text-primary font-semibold hover:underline"
              >
                {{ groupPhoto ? 'Changer la photo' : 'Ajouter une photo' }}
              </button>
              <p class="text-sm text-gray-500 mt-1">Photo de profil du groupe (optionnel)</p>
            </div>
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handlePhotoUpload"
            />
          </div>

          <!-- Nom du groupe -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nom du groupe <span class="text-red-500">*</span>
            </label>
            <input
              v-model="groupName"
              type="text"
              placeholder="Mon super groupe"
              maxlength="50"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p class="text-xs text-gray-500 mt-1">{{ groupName.length }}/50 caractères</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              v-model="groupDescription"
              placeholder="Décrivez le groupe..."
              rows="3"
              maxlength="200"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ groupDescription.length }}/200 caractères</p>
          </div>
        </div>

        <!-- Étape 2: Sélection des membres -->
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">
              Membres du groupe
              <span class="text-sm font-normal text-gray-500">({{ selectedMembers.length }} sélectionné(s))</span>
            </h2>
          </div>

          <!-- Recherche de contacts -->
          <div class="relative">
            <input
              v-model="memberSearchQuery"
              type="text"
              placeholder="Rechercher un utilisateur (nom, prénom ou email)..."
              class="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              @input="searchUsers"
            />
            <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
          </div>

          <!-- Liste des contacts -->
          <div class="max-h-64 overflow-y-auto border rounded-lg divide-y">
            <div v-if="searchingUsers" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p class="text-gray-500 text-sm mt-2">Recherche en cours...</p>
            </div>
            <div
              v-else
              v-for="user in filteredUsers"
              :key="user._id"
              class="p-3 hover:bg-gray-50 transition flex items-center gap-3 cursor-pointer"
              @click="toggleMember(user)"
            >
              <input
                type="checkbox"
                :checked="isSelected(user._id)"
                class="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                @click.stop="toggleMember(user)"
              />
              <img
                :src="user.avatar ? `http://localhost:3000${user.avatar}` : `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`"
                :alt="`${user.firstName} ${user.lastName}`"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-sm">{{ user.firstName }} {{ user.lastName }}</h3>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
              </div>
            </div>

            <div v-if="!searchingUsers && filteredUsers.length === 0" class="p-8 text-center text-gray-500">
              <p v-if="memberSearchQuery">Aucun utilisateur trouvé</p>
              <p v-else>Recherchez un utilisateur pour l'ajouter au groupe</p>
            </div>
          </div>

          <!-- Membres sélectionnés -->
          <div v-if="selectedMembers.length > 0" class="border-t pt-4">
            <p class="text-sm font-semibold text-gray-700 mb-2">Membres sélectionnés:</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="member in selectedMembers"
                :key="member._id"
                class="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{{ member.customName || `${member.firstName} ${member.lastName}` }}</span>
                <button
                  @click="removeMember(member._id)"
                  class="hover:bg-primary hover:bg-opacity-20 rounded-full p-0.5 transition"
                >
                  <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 3: Paramètres du groupe -->
        <div class="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 class="text-lg font-bold text-gray-900">Paramètres</h2>

          <div class="space-y-3">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-semibold text-sm">Groupe privé</p>
                <p class="text-xs text-gray-500">Seuls les membres peuvent voir le groupe</p>
              </div>
              <input
                v-model="settings.isPrivate"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-semibold text-sm">Seuls les admins peuvent envoyer des messages</p>
                <p class="text-xs text-gray-500">Restreindre l'envoi de messages</p>
              </div>
              <input
                v-model="settings.onlyAdminsCanSend"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-semibold text-sm">Seuls les admins peuvent modifier les infos</p>
                <p class="text-xs text-gray-500">Restreindre la modification du nom, photo, etc.</p>
              </div>
              <input
                v-model="settings.onlyAdminsCanEdit"
                type="checkbox"
                class="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        <!-- Validation et erreurs -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {{ error }}
        </div>

        <!-- Boutons d'action -->
        <div class="flex gap-3">
          <button
            @click="$router.back()"
            class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            @click="createGroup"
            :disabled="!canCreate || creating"
            class="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ creating ? 'Création...' : 'Créer le groupe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// État
const users = ref([])
const groupName = ref('')
const groupDescription = ref('')
const groupPhoto = ref(null)
const groupPhotoPreview = ref('')
const selectedMembers = ref([])
const memberSearchQuery = ref('')
const searchingUsers = ref(false)
const settings = ref({
  isPrivate: false,
  onlyAdminsCanSend: false,
  onlyAdminsCanEdit: true
})
const creating = ref(false)
const error = ref('')

// Validation
const canCreate = computed(() => {
  return groupName.value.trim().length >= 3 && selectedMembers.value.length >= 1
})

// Filtrage des utilisateurs
const filteredUsers = computed(() => {
  return users.value
})

// Vérifier si un contact est sélectionné
function isSelected(contactId) {
  return selectedMembers.value.some(m => m._id === contactId)
}

// Rechercher des utilisateurs
let searchTimeout = null
async function searchUsers() {
  const query = memberSearchQuery.value.trim()
  
  if (!query || query.length < 2) {
    users.value = []
    return
  }
  
  // Débouncing
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    try {
      searchingUsers.value = true
      const res = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`)
      users.value = res.data.data?.users || []
      console.log('🔍 Utilisateurs trouvés:', users.value.length)
    } catch (err) {
      console.error('❌ Erreur recherche utilisateurs:', err)
      users.value = []
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

// Toggle membre
function toggleMember(contact) {
  const index = selectedMembers.value.findIndex(m => m._id === contact._id)
  if (index > -1) {
    selectedMembers.value.splice(index, 1)
  } else {
    selectedMembers.value.push(contact)
  }
}

// Retirer un membre
function removeMember(contactId) {
  selectedMembers.value = selectedMembers.value.filter(m => m._id !== contactId)
}

// Upload de photo
function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (file) {
    groupPhoto.value = file
    groupPhotoPreview.value = URL.createObjectURL(file)
  }
}

// Supprimer la photo
function removePhoto() {
  groupPhoto.value = null
  groupPhotoPreview.value = ''
}

// Créer le groupe
async function createGroup() {
  if (!canCreate.value) return

  try {
    creating.value = true
    error.value = ''

    const formData = new FormData()
    formData.append('isGroup', 'true')
    formData.append('groupName', groupName.value.trim())
    formData.append('groupDescription', groupDescription.value.trim())
    
    // Ajouter les IDs des participants (s'assurer qu'ils sont valides)
    const participantIds = selectedMembers.value
      .map(member => member._id)
      .filter(id => id) // Filtrer les IDs invalides
    
    if (participantIds.length === 0) {
      error.value = 'Veuillez sélectionner au moins 1 membre'
      creating.value = false
      return
    }
    
    console.log('📋 Données du groupe:', {
      groupName: groupName.value.trim(),
      groupDescription: groupDescription.value.trim(),
      participantIds,
      hasPhoto: !!groupPhoto.value
    })
    
    participantIds.forEach(id => {
      formData.append('participants', id)
    })

    // Ajouter les paramètres
    formData.append('settings', JSON.stringify({
      onlyAdminsCanSend: settings.value.onlyAdminsCanSend,
      onlyAdminsCanEdit: settings.value.onlyAdminsCanEdit
    }))

    // Ajouter la photo si présente
    if (groupPhoto.value) {
      formData.append('avatar', groupPhoto.value)
    }

    const res = await api.post('/api/conversations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    console.log('✅ Groupe créé:', res.data)

    // Rediriger vers le chat
    router.push('/chat')
  } catch (err) {
    console.error('❌ Erreur création groupe:', err)
    console.error('Détails de l\'erreur:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.response?.data?.message,
      errors: err.response?.data?.errors
    })
    
    // Afficher les erreurs de validation détaillées
    if (err.response?.data?.errors) {
      console.error('📋 Erreurs de validation:', err.response.data.errors)
      err.response.data.errors.forEach(e => {
        console.error(`  - ${e.field}: ${e.message}`)
      })
    }
    
    error.value = err.response?.data?.message || 'Erreur lors de la création du groupe'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  // Pas besoin de charger les contacts, la recherche se fait dynamiquement
})
</script>

<style scoped>
.create-group-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
