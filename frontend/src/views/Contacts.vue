<template>
  <div class="contacts-container h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-primary text-white p-4 shadow-md">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <button
            @click="$router.push('/chat')"
            class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            title="Retour au chat"
          >
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
          </button>
          <h1 class="text-2xl font-bold">Contacts</h1>
        </div>
        <button
          @click="showAddContact = true"
          class="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
          </svg>
          Ajouter un contact
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un contact..."
          class="w-full px-4 py-2 pl-10 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
      </div>
    </div>

    <!-- Filtres et tri -->
    <div class="bg-white border-b p-3 flex gap-3 items-center">
      <select
        v-model="sortBy"
        class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="name">Trier par nom</option>
        <option value="recent">Récents</option>
        <option value="online">En ligne</option>
      </select>

      <select
        v-model="filterBy"
        class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">Tous les contacts</option>
        <option value="online">En ligne uniquement</option>
        <option value="blocked">Contacts bloqués</option>
      </select>

      <span class="ml-auto text-sm text-gray-500">{{ filteredContacts.length }} contact(s)</span>
    </div>

    <!-- Liste des contacts -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="filteredContacts.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <svg viewBox="0 0 24 24" class="w-16 h-16 fill-current mb-4 opacity-50">
          <path d="M16,17V19H2V17S2,13 9,13 16,17 16,17M12.5,7.5A3.5,3.5 0 0,1 9,11A3.5,3.5 0 0,1 5.5,7.5A3.5,3.5 0 0,1 9,4A3.5,3.5 0 0,1 12.5,7.5M15.94,13C16.62,13.75 17,14.71 17,15.94V19H22V17S22,13.37 15.94,13M15,4A3.39,3.39 0 0,0 13.07,4.59A5,5 0 0,1 13.07,10.41A3.39,3.39 0 0,0 15,11A3.5,3.5 0 0,0 18.5,7.5A3.5,3.5 0 0,0 15,4Z"/>
        </svg>
        <p class="text-lg">Aucun contact trouvé</p>
        <p class="text-sm mt-2">{{ searchQuery ? 'Essayez un autre terme de recherche' : 'Ajoutez des contacts pour commencer' }}</p>
      </div>

      <div v-else class="divide-y">
        <div
          v-for="contact in filteredContacts"
          :key="contact._id"
          class="p-4 hover:bg-gray-50 transition cursor-pointer flex items-center gap-4 group"
          @click="startConversation(contact)"
        >
          <!-- Avatar -->
          <div class="relative">
            <img
              :src="contact.avatar || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}&background=random`"
              :alt="`${contact.firstName} ${contact.lastName}`"
              class="w-14 h-14 rounded-full object-cover"
            />
            <div
              v-if="contact.status === 'online'"
              class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            ></div>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">
              {{ contact.customName || `${contact.firstName} ${contact.lastName}` }}
            </h3>
            <p class="text-sm text-gray-500 truncate">{{ contact.email }}</p>
            <p v-if="contact.bio" class="text-xs text-gray-400 truncate mt-1">{{ contact.bio }}</p>
          </div>

          <!-- Statut -->
          <div class="flex items-center gap-2">
            <span
              :class="[
                'text-xs px-2 py-1 rounded-full',
                contact.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ contact.status === 'online' ? 'En ligne' : 'Hors ligne' }}
            </span>
            <span
              v-if="contact.isBlocked"
              class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700"
            >
              Bloqué
            </span>
          </div>

          <!-- Actions (apparaissent au hover) -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              @click.stop="openContactMenu(contact, $event)"
              class="p-2 hover:bg-gray-200 rounded-full transition"
              title="Options"
            >
              <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current text-gray-600">
                <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Édition du nom -->
    <Teleport to="body">
      <div
        v-if="showEditName"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showEditName = false"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          @click.stop
        >
          <div class="p-6 border-b">
            <h2 class="text-xl font-bold text-gray-900">Modifier le nom</h2>
            <p class="text-sm text-gray-500 mt-1">Personnalisez le nom d'affichage de ce contact</p>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom personnalisé</label>
              <input
                v-model="editingName"
                type="text"
                :placeholder="`${editingContact?.firstName || ''} ${editingContact?.lastName || ''}`"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                @keyup.enter="saveCustomName"
              />
              <p class="text-xs text-gray-500 mt-1">Laissez vide pour utiliser le nom d'origine</p>
            </div>
          </div>

          <div class="p-6 border-t flex gap-3">
            <button
              @click="showEditName = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              @click="saveCustomName"
              :disabled="savingName"
              class="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {{ savingName ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajout de contact -->
    <Teleport to="body">
      <div
        v-if="showAddContact"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showAddContact = false"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
          @click.stop
        >
          <div class="p-6 border-b">
            <h2 class="text-xl font-bold text-gray-900">Ajouter un contact</h2>
            <p class="text-sm text-gray-500 mt-1">Recherchez un utilisateur par nom ou email</p>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <input
                v-model="newContactEmail"
                type="text"
                placeholder="Nom ou email du contact"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                @keyup.enter="searchUser"
              />
            </div>

            <button
              @click="searchUser"
              :disabled="!newContactEmail || searchingUser"
              class="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ searchingUser ? 'Recherche...' : 'Rechercher' }}
            </button>

            <!-- Résultat de recherche -->
            <div v-if="foundUser" class="border rounded-lg p-4 flex items-center gap-3">
              <img
                :src="foundUser.avatar || `https://ui-avatars.com/api/?name=${foundUser.firstName}+${foundUser.lastName}&background=random`"
                :alt="`${foundUser.firstName} ${foundUser.lastName}`"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold">{{ foundUser.firstName }} {{ foundUser.lastName }}</h3>
                <p class="text-sm text-gray-500">{{ foundUser.email }}</p>
              </div>
              <button
                @click="addContact(foundUser._id)"
                :disabled="addingContact"
                class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {{ addingContact ? 'Ajout...' : 'Ajouter' }}
              </button>
            </div>

            <div v-if="searchError" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {{ searchError }}
            </div>
          </div>

          <div class="p-6 border-t">
            <button
              @click="showAddContact = false"
              class="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Menu contextuel contact -->
    <Teleport to="body">
      <div
        v-if="contextMenu.show"
        class="fixed bg-white rounded-lg shadow-xl border py-2 min-w-[200px] z-50"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <button
          @click="editContactName"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm flex items-center gap-3"
        >
          <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
          </svg>
          Modifier le nom
        </button>
        <button
          @click="toggleBlockContact"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm flex items-center gap-3"
        >
          <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V15A4,4 0 0,0 11,11H13A2,2 0 0,1 15,13V17.2C13.21,18.24 11,17.22 9,15.46V13C9,11.89 9.89,11 11,11H13A2,2 0 0,1 15,13V15A6,6 0 0,1 12,6Z"/>
          </svg>
          {{ contextMenu.contact?.isBlocked ? 'Débloquer' : 'Bloquer' }}
        </button>
        <button
          @click="confirmDeleteContact"
          class="w-full px-4 py-2 text-left hover:bg-red-50 transition text-sm flex items-center gap-3 text-red-600"
        >
          <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current">
            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
          </svg>
          Supprimer le contact
        </button>
      </div>
      <div
        v-if="contextMenu.show"
        class="fixed inset-0 z-40"
        @click="contextMenu.show = false"
      ></div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// État
const contacts = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('name')
const filterBy = ref('all')

// Modal ajout
const showAddContact = ref(false)
const newContactEmail = ref('')
const searchingUser = ref(false)
const foundUser = ref(null)
const addingContact = ref(false)
const searchError = ref('')

// Modal édition du nom
const showEditName = ref(false)
const editingContact = ref(null)
const editingName = ref('')
const savingName = ref(false)

// Menu contextuel
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  contact: null
})

// Contacts filtrés et triés
const filteredContacts = computed(() => {
  let result = [...contacts.value]

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => {
      const displayName = c.customName || `${c.firstName} ${c.lastName}`
      return displayName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    })
  }

  // Filtrer par statut
  if (filterBy.value === 'online') {
    result = result.filter(c => c.status === 'online')
  } else if (filterBy.value === 'blocked') {
    result = result.filter(c => c.isBlocked)
  }

  // Trier
  if (sortBy.value === 'name') {
    result.sort((a, b) => a.firstName.localeCompare(b.firstName))
  } else if (sortBy.value === 'online') {
    result.sort((a, b) => {
      if (a.status === 'online' && b.status !== 'online') return -1
      if (a.status !== 'online' && b.status === 'online') return 1
      return 0
    })
  }

  return result
})

// Charger les contacts
async function loadContacts() {
  try {
    loading.value = true
    // Charger TOUS les contacts (bloqués et non-bloqués)
    const [normalRes, blockedRes] = await Promise.all([
      api.get('/api/contacts'), // Contacts non-bloqués
      api.get('/api/contacts?blocked=true') // Contacts bloqués
    ])
    
    const normalContacts = normalRes.data.data?.contacts || []
    const blockedContacts = blockedRes.data.data?.contacts || []
    
    // Combiner les deux listes
    const allContacts = [...normalContacts, ...blockedContacts]
    
    // Transformer les contacts pour avoir la structure attendue
    contacts.value = allContacts.map(c => ({
      _id: c._id,
      ...c.contact, // Spread les infos de l'utilisateur
      customName: c.customName,
      isFavorite: c.isFavorite,
      isBlocked: c.isBlocked,
      addedAt: c.addedAt
    }))
    
    console.log('📋 Contacts chargés:', contacts.value.length, '| Bloqués:', contacts.value.filter(c => c.isBlocked).length)
  } catch (error) {
    console.error('❌ Erreur chargement contacts:', error)
  } finally {
    loading.value = false
  }
}

// Rechercher un utilisateur
async function searchUser() {
  if (!newContactEmail.value || newContactEmail.value.length < 2) {
    searchError.value = 'Entrez au moins 2 caractères'
    return
  }

  try {
    searchingUser.value = true
    searchError.value = ''
    foundUser.value = null

    const res = await api.get(`/api/users/search?q=${encodeURIComponent(newContactEmail.value)}`)
    
    if (res.data.data?.users && res.data.data.users.length > 0) {
      // Prendre le premier résultat
      foundUser.value = res.data.data.users[0]
    } else {
      searchError.value = 'Aucun utilisateur trouvé'
    }
  } catch (error) {
    searchError.value = error.response?.data?.message || 'Erreur lors de la recherche'
  } finally {
    searchingUser.value = false
  }
}

// Ajouter un contact
async function addContact(userId) {
  try {
    addingContact.value = true
    await api.post('/api/contacts', { contactId: userId })
    
    // Fermer le modal
    showAddContact.value = false
    newContactEmail.value = ''
    foundUser.value = null
    searchError.value = ''
    
    // Recharger les contacts pour actualiser l'affichage
    await loadContacts()
    
    console.log('✅ Contact ajouté et liste actualisée')
  } catch (error) {
    searchError.value = error.response?.data?.message || 'Erreur lors de l\'ajout'
  } finally {
    addingContact.value = false
  }
}

// Ouvrir le menu contextuel
function openContactMenu(contact, event) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    contact
  }
}

// Voir le profil
function viewContactProfile() {
  // TODO: Implémenter la vue profil
  console.log('Voir profil:', contextMenu.value.contact)
  contextMenu.value.show = false
}

// Éditer le nom du contact
function editContactName() {
  editingContact.value = contextMenu.value.contact
  editingName.value = contextMenu.value.contact.customName || ''
  showEditName.value = true
  contextMenu.value.show = false
}

// Sauvegarder le nom personnalisé
async function saveCustomName() {
  if (savingName.value) return
  
  try {
    savingName.value = true
    await api.patch(`/api/contacts/${editingContact.value._id}/name`, {
      customName: editingName.value || null
    })
    
    // Recharger les contacts pour avoir les données à jour
    await loadContacts()
    
    showEditName.value = false
    editingContact.value = null
    editingName.value = ''
    
    console.log('✅ Nom personnalisé mis à jour')
  } catch (error) {
    console.error('❌ Erreur sauvegarde nom:', error)
    alert(error.response?.data?.message || 'Erreur lors de la sauvegarde du nom')
  } finally {
    savingName.value = false
  }
}

// Bloquer/débloquer
async function toggleBlockContact() {
  const contact = contextMenu.value.contact
  const wasBlocked = contact.isBlocked
  
  try {
    if (contact.isBlocked) {
      await api.patch(`/api/contacts/${contact._id}/unblock`)
    } else {
      await api.patch(`/api/contacts/${contact._id}/block`)
    }
    
    // Mise à jour réactive immédiate
    const index = contacts.value.findIndex(c => c._id === contact._id)
    if (index !== -1) {
      const updatedContact = { ...contacts.value[index] }
      updatedContact.isBlocked = !wasBlocked
      contacts.value.splice(index, 1, updatedContact)
    }
    
    console.log('✅ Contact', wasBlocked ? 'débloqué' : 'bloqué')
  } catch (error) {
    console.error('❌ Erreur blocage:', error)
    alert(error.response?.data?.message || 'Erreur lors du blocage')
    // Recharger en cas d'erreur pour restaurer l'état
    await loadContacts()
  } finally {
    contextMenu.value.show = false
  }
}

// Confirmer suppression
function confirmDeleteContact() {
  const contact = contextMenu.value.contact
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${contact.firstName} ${contact.lastName} de vos contacts ?`)) {
    deleteContact(contact._id)
  }
  contextMenu.value.show = false
}

// Supprimer un contact
async function deleteContact(contactId) {
  try {
    await api.delete(`/api/contacts/${contactId}`)
    
    // Recharger les contacts
    await loadContacts()
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

// Démarrer une conversation
async function startConversation(contact) {
  try {
    // Créer ou récupérer la conversation
    const res = await api.post('/api/conversations', {
      participants: [contact._id],
      type: 'private'
    })
    
    // Rediriger vers le chat
    router.push('/chat')
  } catch (error) {
    console.error('❌ Erreur création conversation:', error)
  }
}

onMounted(() => {
  loadContacts()
})
</script>

<style scoped>
.contacts-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
