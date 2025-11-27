<template>
  <div class="group-settings space-y-4">
    <!-- Photo et nom du groupe -->
    <div class="text-center py-6 border-b">
      <div class="relative inline-block">
        <img
          :src="group.groupAvatar ? `http://localhost:3000/${group.groupAvatar}` : `https://ui-avatars.com/api/?name=${group.groupName}&background=random`"
          :alt="group.groupName"
          class="w-24 h-24 rounded-full object-cover mx-auto mb-3"
        />
        <button
          v-if="canEditInfo"
          @click="avatarInput?.click()"
          class="absolute bottom-2 right-0 bg-primary text-white rounded-full p-2 hover:bg-opacity-90 transition shadow-lg"
          title="Changer la photo"
        >
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
            <path d="M9,2V7.38L10.38,8.76L12,7.14L13.62,8.76L15,7.38V2H9M15,15.5A1.5,1.5 0 0,1 13.5,17A1.5,1.5 0 0,1 12,15.5A1.5,1.5 0 0,1 13.5,14A1.5,1.5 0 0,1 15,15.5M21,9H3V3H9V7.38L10.38,8.76L12,7.14L13.62,8.76L15,7.38V9H21V9M21,9V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V9H21Z"/>
          </svg>
        </button>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="updateAvatar"
        />
      </div>
      
      <div v-if="!editingName">
        <h2 class="text-xl font-bold">{{ group.groupName }}</h2>
        <button
          v-if="canEditInfo"
          @click="startEditName"
          class="text-primary text-sm hover:underline mt-1"
        >
          Modifier le nom
        </button>
      </div>
      <div v-else class="max-w-sm mx-auto mt-3">
        <input
          v-model="newName"
          type="text"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
          @keyup.enter="saveName"
          @keyup.esc="editingName = false"
        />
        <div class="flex gap-2 mt-2">
          <button
            @click="editingName = false"
            class="flex-1 px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Annuler
          </button>
          <button
            @click="saveName"
            class="flex-1 px-3 py-1 bg-primary text-white rounded text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <p class="text-sm text-gray-500 mt-2">Groupe · {{ members.length }} membre(s)</p>
      
      <!-- Créateur du groupe -->
      <div v-if="creatorInfo" class="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
        <span>Créé par</span>
        <div class="flex items-center gap-2">
          <img
            v-if="creatorInfo.avatar"
            :src="`http://localhost:3000${creatorInfo.avatar}`"
            :alt="creatorInfo.firstName"
            class="w-6 h-6 rounded-full object-cover"
          />
          <div v-else class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {{ creatorInfo.firstName?.[0] }}
          </div>
          <span class="font-semibold">{{ creatorInfo.firstName }} {{ creatorInfo.lastName }}</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="border-b pb-4">
      <h3 class="font-semibold mb-2">Description</h3>
      <div v-if="!editingDescription">
        <p class="text-sm text-gray-600">{{ group.groupDescription || 'Aucune description' }}</p>
        <button
          v-if="canEditInfo"
          @click="startEditDescription"
          class="text-primary text-sm hover:underline mt-1"
        >
          {{ group.groupDescription ? 'Modifier' : 'Ajouter' }} la description
        </button>
      </div>
      <div v-else>
        <textarea
          v-model="newDescription"
          rows="3"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
          @keyup.esc="editingDescription = false"
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button
            @click="editingDescription = false"
            class="flex-1 px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Annuler
          </button>
          <button
            @click="saveDescription"
            class="flex-1 px-3 py-1 bg-primary text-white rounded text-sm"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>

    <!-- Membres -->
    <div class="border-b pb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">Membres ({{ members.length }})</h3>
        <button
          v-if="canManageMembers"
          @click="showAddMember = true"
          class="text-primary text-sm hover:underline"
        >
          + Ajouter
        </button>
      </div>

      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="member in members"
          :key="member.user._id"
          class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition"
        >
          <img
            :src="member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}+${member.user.lastName}&background=random`"
            :alt="`${member.user.firstName} ${member.user.lastName}`"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">
              {{ member.user.firstName }} {{ member.user.lastName }}
              <span v-if="member.user._id === currentUserId" class="text-gray-500">(Vous)</span>
              <span v-if="member.user._id === group.creator" class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">👑 Créateur</span>
            </p>
            <p :class="['text-xs', getRoleColor(member.role)]">{{ getRoleLabel(member.role) }}</p>
          </div>

          <!-- Actions sur les membres -->
          <div v-if="canManageMembers && member.user._id !== currentUserId && member.user._id !== group.creator" class="flex gap-1">
            <!-- Menu déroulant pour changer le rôle -->
            <select
              v-if="canManageRoles(member.role)"
              :value="member.role"
              @change="changeRole(member.user._id, $event.target.value)"
              class="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="member">Membre</option>
              <option value="moderator">Modérateur</option>
              <option value="admin" v-if="isCreator">Admin</option>
            </select>
            <span v-else class="text-xs text-gray-500 px-2 py-1">
              {{ getRoleLabel(member.role) }}
            </span>

            <!-- Retirer du groupe -->
            <button
              @click="confirmRemoveMember(member.user._id)"
              class="p-1 hover:bg-red-50 rounded transition"
              title="Retirer du groupe"
            >
              <svg viewBox="0 0 24 24" class="w-4 h-4 fill-current text-red-600">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paramètres du groupe -->
    <div v-if="canEditSettings" class="border-b pb-4">
      <h3 class="font-semibold mb-3">Paramètres du groupe</h3>
      <div class="space-y-3">
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="text-sm font-medium">Seuls les admins peuvent envoyer des messages</p>
          </div>
          <input
            v-model="localSettings.onlyAdminsCanSend"
            type="checkbox"
            class="w-5 h-5 text-primary rounded"
            @change="updateSettings"
          />
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="text-sm font-medium">Seuls les admins peuvent modifier les infos</p>
          </div>
          <input
            v-model="localSettings.onlyAdminsCanEdit"
            type="checkbox"
            class="w-5 h-5 text-primary rounded"
            @change="updateSettings"
          />
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-2">
      <button
        @click="confirmLeaveGroup"
        class="w-full px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition text-sm font-semibold"
      >
        Quitter le groupe
      </button>
      <button
        v-if="isCreator"
        @click="confirmDeleteGroup"
        class="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm font-semibold"
      >
        Supprimer le groupe
      </button>
    </div>

    <!-- Modal Ajout de membre -->
    <Teleport to="body">
      <div
        v-if="showAddMember"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showAddMember = false"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          @click.stop
        >
          <div class="p-6 border-b">
            <h3 class="text-lg font-bold mb-3">Ajouter des membres</h3>
            <input
              v-model="memberSearchQuery"
              type="text"
              placeholder="Rechercher un contact..."
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div class="p-6 max-h-96 overflow-y-auto">
            <div
              v-for="contact in filteredAvailableContacts"
              :key="contact._id"
              class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
              @click="addMember(contact._id)"
            >
              <img
                :src="contact.avatar || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}&background=random`"
                :alt="`${contact.firstName} ${contact.lastName}`"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <p class="font-semibold text-sm">{{ contact.firstName }} {{ contact.lastName }}</p>
                <p class="text-xs text-gray-500">{{ contact.email }}</p>
              </div>
            </div>
            <div v-if="filteredAvailableContacts.length === 0 && !memberSearchQuery" class="text-center text-gray-500 py-8">
              Tous vos contacts sont déjà dans le groupe
            </div>
            <div v-if="filteredAvailableContacts.length === 0 && memberSearchQuery" class="text-center text-gray-500 py-8">
              Aucun contact trouvé
            </div>
          </div>
          <div class="p-6 border-t">
            <button
              @click="showAddMember = false; memberSearchQuery = ''"
              class="w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/services/api'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated', 'left', 'deleted'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?._id)

// État
const group = ref(props.conversation)
const members = ref([])
const contacts = ref([])
const editingName = ref(false)
const editingDescription = ref(false)
const newName = ref('')
const newDescription = ref('')
const showAddMember = ref(false)
const memberSearchQuery = ref('')
const avatarInput = ref(null)
const localSettings = ref({
  onlyAdminsCanSend: false,
  onlyAdminsCanEdit: true
})

// Rôle de l'utilisateur actuel
const currentUserRole = computed(() => {
  const member = members.value.find(m => m.user._id === currentUserId.value)
  return member?.role || 'member'
})

const isCreator = computed(() => currentUserRole.value === 'creator')
const isAdmin = computed(() => ['creator', 'admin'].includes(currentUserRole.value))

// Permissions
const canEditInfo = computed(() => {
  if (isCreator.value || isAdmin.value) return true
  return !localSettings.value.onlyAdminsCanEdit
})

const canManageMembers = computed(() => isCreator.value || isAdmin.value)
const canPromote = computed(() => isCreator.value)
const canEditSettings = computed(() => isCreator.value)

// Vérifier si on peut changer le rôle d'un membre
function canManageRoles(memberRole) {
  // Le créateur peut tout faire
  if (isCreator.value) return true
  
  // Les admins peuvent gérer member et moderator, mais pas les autres admins
  if (isAdmin.value) {
    return memberRole === 'member' || memberRole === 'moderator'
  }
  
  return false
}

// Contacts disponibles (pas encore dans le groupe)
const availableContacts = computed(() => {
  const memberIds = members.value.map(m => m.user._id)
  return contacts.value.filter(c => !memberIds.includes(c._id))
})

// Contacts filtrés par recherche
const filteredAvailableContacts = computed(() => {
  if (!memberSearchQuery.value) return availableContacts.value
  
  const query = memberSearchQuery.value.toLowerCase()
  return availableContacts.value.filter(c => 
    c.firstName?.toLowerCase().includes(query) ||
    c.lastName?.toLowerCase().includes(query) ||
    c.email?.toLowerCase().includes(query) ||
    c.username?.toLowerCase().includes(query)
  )
})

// Info du créateur
const creatorInfo = computed(() => {
  if (!group.value.creator) return null
  const creator = members.value.find(m => m.user._id === group.value.creator)
  return creator?.user || null
})

// Labels des rôles
function getRoleLabel(role) {
  const labels = {
    creator: 'Créateur',
    admin: 'Administrateur',
    moderator: 'Modérateur',
    member: 'Membre'
  }
  return labels[role] || 'Membre'
}

// Couleurs des rôles
function getRoleColor(role) {
  const colors = {
    creator: 'text-yellow-600 font-semibold',
    admin: 'text-blue-600 font-semibold',
    moderator: 'text-purple-600 font-semibold',
    member: 'text-gray-500'
  }
  return colors[role] || 'text-gray-500'
}

// Changer le rôle d'un membre
async function changeRole(userId, newRole) {
  try {
    await api.patch(`/api/conversations/${group.value._id}/members/${userId}/role`, {
      role: newRole
    })
    await loadMembers()
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur changement rôle:', error)
    alert(error.response?.data?.message || 'Erreur lors du changement de rôle')
  }
}

// Charger les membres
async function loadMembers() {
  try {
    const res = await api.get(`/api/conversations/${group.value._id}/members`)
    members.value = res.data.data || []
  } catch (error) {
    console.error('❌ Erreur chargement membres:', error)
  }
}

// Charger les contacts
async function loadContacts() {
  try {
    const res = await api.get('/api/contacts')
    contacts.value = res.data.data || []
  } catch (error) {
    console.error('❌ Erreur chargement contacts:', error)
  }
}

// Éditer le nom
function startEditName() {
  newName.value = group.value.groupName
  editingName.value = true
}

async function saveName() {
  try {
    await api.patch(`/api/conversations/${group.value._id}/group`, {
      groupName: newName.value
    })
    group.value.groupName = newName.value
    editingName.value = false
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur modification nom:', error)
    alert(error.response?.data?.message || 'Erreur lors de la modification')
  }
}

// Éditer la description
function startEditDescription() {
  newDescription.value = group.value.groupDescription || ''
  editingDescription.value = true
}

async function saveDescription() {
  try {
    await api.patch(`/api/conversations/${group.value._id}/group`, {
      groupDescription: newDescription.value
    })
    group.value.groupDescription = newDescription.value
    editingDescription.value = false
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur modification description:', error)
    alert(error.response?.data?.message || 'Erreur lors de la modification')
  }
}

// Changer l'avatar
async function updateAvatar(event) {
  const file = event.target.files[0]
  if (!file) {
    console.log('⚠️ Aucun fichier sélectionné')
    return
  }

  console.log('📷 Fichier sélectionné:', file.name, file.type, file.size)

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    console.log('📤 Envoi vers:', `/api/conversations/${group.value._id}/avatar`)
    
    const response = await api.post(`/api/conversations/${group.value._id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    console.log('✅ Réponse upload avatar:', response.data)
    
    // Recharger pour obtenir la nouvelle URL
    emit('updated')
    
    // Réinitialiser l'input
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  } catch (error) {
    console.error('❌ Erreur modification avatar:', error.response?.data || error)
    alert(error.response?.data?.message || 'Erreur lors de la modification de la photo')
  }
}

// Ajouter un membre
async function addMember(userId) {
  try {
    await api.post(`/api/conversations/${group.value._id}/members`, {
      userId
    })
    await loadMembers()
    showAddMember.value = false
    memberSearchQuery.value = ''
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur ajout membre:', error)
    alert(error.response?.data?.message || 'Erreur lors de l\'ajout')
  }
}

// Retirer un membre
function confirmRemoveMember(userId) {
  const member = members.value.find(m => m.user._id === userId)
  if (confirm(`Retirer ${member.user.firstName} ${member.user.lastName} du groupe ?`)) {
    removeMember(userId)
  }
}

async function removeMember(userId) {
  try {
    await api.delete(`/api/conversations/${group.value._id}/members/${userId}`)
    await loadMembers()
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur retrait membre:', error)
    alert(error.response?.data?.message || 'Erreur lors du retrait')
  }
}

// Mettre à jour les paramètres
async function updateSettings() {
  try {
    await api.patch(`/api/conversations/${group.value._id}/settings`, localSettings.value)
    emit('updated')
  } catch (error) {
    console.error('❌ Erreur mise à jour paramètres:', error)
    alert(error.response?.data?.message || 'Erreur lors de la mise à jour')
  }
}

// Quitter le groupe
function confirmLeaveGroup() {
  if (confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) {
    leaveGroup()
  }
}

async function leaveGroup() {
  try {
    await api.post(`/api/conversations/${group.value._id}/leave`)
    emit('left')
  } catch (error) {
    console.error('❌ Erreur quitter groupe:', error)
    alert(error.response?.data?.message || 'Erreur en quittant le groupe')
  }
}

// Supprimer le groupe
function confirmDeleteGroup() {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) {
    deleteGroup()
  }
}

async function deleteGroup() {
  try {
    await api.delete(`/api/conversations/${group.value._id}`)
    emit('deleted')
  } catch (error) {
    console.error('❌ Erreur suppression groupe:', error)
    alert(error.response?.data?.message || 'Erreur lors de la suppression')
  }
}

onMounted(() => {
  loadMembers()
  loadContacts()
  
  // Charger les paramètres actuels
  if (group.value.groupSettings) {
    localSettings.value = { ...group.value.groupSettings }
  }
})
</script>
