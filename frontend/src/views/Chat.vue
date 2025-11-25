<template>
  <div class="h-screen flex bg-gray-100">
    <!-- ÉTAPE 7.1: SIDEBAR -->
    <div class="w-96 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header utilisateur -->
      <div class="bg-secondary p-4 flex items-center justify-between">
        <div class="flex items-center gap-3 flex-1">
          <img 
            v-if="user?.avatar" 
            :src="`http://localhost:3000${user.avatar}`" 
            class="w-10 h-10 rounded-full object-cover" 
          />
          <div v-else class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}
          </div>
          <div class="text-white flex-1">
            <p class="font-semibold">{{ user?.username || user?.firstName }}</p>
            <p class="text-xs opacity-75">{{ user?.email }}</p>
          </div>
        </div>
        <!-- Notifications badge + Menu -->
        <div class="flex items-center gap-3">
          <NotificationBadge :count="totalUnread" />
          <button @click="showMenu = !showMenu" class="text-white hover:text-gray-200 relative">
            ⋮
            <div v-if="showMenu" class="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-2 w-48 z-10">
              <button @click="logout" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                🚪 Déconnexion
              </button>
            </div>
          </button>
        </div>
      </div>

      <!-- Recherche de conversations -->
      <div class="p-4 border-b">
        <div class="flex gap-2">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Rechercher une conversation..."
            class="input-field flex-1"
          />
          <button @click="showNewConversation = true" class="btn-primary">+</button>
        </div>
      </div>

      <!-- Filtrage des conversations -->
      <div class="px-4 py-2 border-b flex gap-2">
        <button 
          @click="filter = 'all'" 
          :class="['px-3 py-1 rounded-full text-sm', filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700']"
        >
          Toutes
        </button>
        <button 
          @click="filter = 'unread'" 
          :class="['px-3 py-1 rounded-full text-sm', filter === 'unread' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700']"
        >
          Non lues
        </button>
        <button 
          @click="filter = 'archived'" 
          :class="['px-3 py-1 rounded-full text-sm', filter === 'archived' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700']"
        >
          Archivées
        </button>
      </div>

      <!-- Liste des conversations -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="filteredConversations.length === 0" class="p-8 text-center text-gray-500">
          <p class="mb-4">Aucune conversation</p>
          <button @click="showNewConversation = true" class="btn-primary">+ Nouvelle conversation</button>
        </div>
        <div 
          v-for="conv in filteredConversations" 
          :key="conv._id"
          @click="selectConversation(conv)"
          @contextmenu.prevent="showConvOptions(conv, $event)"
          :class="[
            'p-4 border-b cursor-pointer hover:bg-gray-50 transition',
            selectedConv?._id === conv._id ? 'bg-light' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div class="relative">
              <img 
                v-if="conv.contact?.avatar" 
                :src="`http://localhost:3000${conv.contact.avatar}`" 
                class="w-12 h-12 rounded-full object-cover" 
              />
              <div v-else class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {{ conv.contact?.firstName?.[0] || '?' }}{{ conv.contact?.lastName?.[0] || '' }}
              </div>
              <!-- Statut en ligne -->
              <div 
                v-if="conv.contact?.status === 'online'" 
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
              ></div>
            </div>
            <!-- Info conversation -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <p class="font-semibold text-gray-900 truncate">
                  {{ conv.contact?.username || conv.contact?.firstName || 'Utilisateur' }}
                </p>
                <p class="text-xs text-gray-500">{{ formatDate(conv.lastMessageAt) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <p :class="['text-sm truncate flex-1', getUnreadCount(conv) > 0 ? 'font-semibold text-gray-900' : 'text-gray-600']">
                  {{ conv.lastMessage?.content || 'Aucun message' }}
                </p>
                <!-- Badge notifications non lues -->
                <NotificationBadge :count="getUnreadCount(conv)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ÉTAPE 7.2: ZONE DE CHAT -->
    <div class="flex-1 flex flex-col">
      <!-- État vide -->
      <div v-if="!selectedConv" class="flex-1 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <p class="text-2xl mb-2">💬</p>
          <p>Sélectionnez une conversation pour commencer</p>
        </div>
      </div>

      <template v-else>
        <!-- Header de la conversation -->
        <div class="bg-secondary p-4 flex items-center justify-between border-b">
          <div class="flex items-center gap-3">
            <img 
              v-if="selectedConv.contact?.avatar" 
              :src="`http://localhost:3000${selectedConv.contact.avatar}`" 
              class="w-10 h-10 rounded-full object-cover" 
            />
            <div v-else class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {{ selectedConv.contact?.firstName?.[0] }}{{ selectedConv.contact?.lastName?.[0] }}
            </div>
            <div class="text-white">
              <p class="font-semibold">
                {{ selectedConv.contact?.username || selectedConv.contact?.firstName }}
              </p>
              <p class="text-xs opacity-75">
                {{ selectedConv.contact?.status === 'online' ? 'En ligne' : 'Hors ligne' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Affichage des messages avec scroll automatique -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-chat-pattern">
          <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
            <p>Aucun message. Commencez la conversation !</p>
          </div>
          
          <div v-for="msg in messages" :key="msg._id" class="mb-4">
            <div :class="['flex', isOwnMessage(msg) ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-md rounded-lg p-3 shadow', isOwnMessage(msg) ? 'bg-primary text-white' : 'bg-white']">
                <!-- Fichiers média avec téléchargement -->
                <div v-if="msg.mediaUrl" class="mb-2">
                  <img 
                    v-if="msg.mimeType?.startsWith('image/')" 
                    :src="`http://localhost:3000${msg.mediaUrl}`" 
                    class="rounded max-w-xs cursor-pointer hover:opacity-90"
                    @click="openMedia(msg.mediaUrl)"
                  />
                  <video 
                    v-else-if="msg.mimeType?.startsWith('video/')" 
                    :src="`http://localhost:3000${msg.mediaUrl}`" 
                    controls 
                    class="rounded max-w-xs"
                  />
                  <a 
                    v-else 
                    :href="`http://localhost:3000${msg.mediaUrl}`" 
                    :download="msg.fileName"
                    target="_blank" 
                    class="flex items-center gap-2 text-blue-500 hover:underline"
                  >
                    📎 {{ msg.fileName || msg.mediaUrl.split('/').pop() }}
                  </a>
                </div>
                
                <!-- Contenu texte -->
                <p v-if="msg.content" class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
                
                <!-- Horodatage -->
                <p :class="['text-xs mt-1', isOwnMessage(msg) ? 'text-white text-opacity-75' : 'text-gray-500']">
                  {{ formatMessageTime(msg.createdAt) }}
                </p>
                
                <!-- Réactions (ÉTAPE 7.3) -->
                <MessageReactions 
                  :message="msg" 
                  @reactionUpdated="refreshMessages"
                />
              </div>
            </div>
          </div>

          <!-- Indicateur d'écriture -->
          <div v-if="isTyping" class="flex items-center gap-2 text-gray-500 text-sm">
            <div class="flex gap-1">
              <span class="animate-bounce">●</span>
              <span class="animate-bounce" style="animation-delay: 0.1s">●</span>
              <span class="animate-bounce" style="animation-delay: 0.2s">●</span>
            </div>
            <span>{{ selectedConv.contact?.firstName }} est en train d'écrire...</span>
          </div>
        </div>

        <!-- ÉTAPE 7.3 & 7.4: Zone de saisie avec médias -->
        <MessageInput 
          :conversationId="selectedConv._id" 
          @messageSent="handleMessageSent"
          @typing="handleTyping"
        />
      </template>
    </div>

    <!-- Modal Nouvelle Conversation -->
    <div v-if="showNewConversation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showNewConversation = false">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-xl font-bold mb-4">Nouvelle conversation</h3>
        <input 
          v-model="userSearchQuery" 
          type="text" 
          placeholder="Rechercher un utilisateur..."
          class="input-field w-full mb-4"
          @input="searchUsers"
        />
        <div class="max-h-64 overflow-y-auto mb-4">
          <div v-if="searchResults.length === 0 && userSearchQuery.length >= 2" class="text-center text-gray-500 py-4">
            Aucun utilisateur trouvé
          </div>
          <div v-else-if="searchResults.length === 0" class="text-center text-gray-400 py-4 text-sm">
            Tapez au moins 2 caractères pour rechercher
          </div>
          <div 
            v-for="u in searchResults" 
            :key="u._id"
            @click="createConversation(u)"
            class="p-3 hover:bg-gray-100 cursor-pointer rounded flex items-center gap-3"
          >
            <img 
              v-if="u.avatar" 
              :src="`http://localhost:3000${u.avatar}`" 
              class="w-10 h-10 rounded-full object-cover" 
            />
            <div v-else class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {{ u.firstName?.[0] || '?' }}{{ u.lastName?.[0] || '' }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ u.username || u.firstName || 'Utilisateur' }}</p>
              <p class="text-sm text-gray-600">{{ u.email }}</p>
            </div>
          </div>
        </div>
        <button @click="showNewConversation = false" class="btn-secondary w-full">Annuler</button>
      </div>
    </div>

    <!-- Menu contextuel conversation (Archivage/Suppression) -->
    <div 
      v-if="contextMenu.show" 
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed bg-white shadow-lg rounded-lg py-2 w-48 z-50"
      @click.stop
    >
      <button 
        @click="archiveConversation(contextMenu.conversation)" 
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
      >
        📦 Archiver
      </button>
      <button 
        @click="deleteConversation(contextMenu.conversation)" 
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        🗑️ Supprimer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSocket } from '../composables/useSocket'
import { useNotifications } from '../composables/useNotifications'
import { useRealtimeMessages } from '../composables/useRealtimeMessages'
import api from '../services/api'
import MessageReactions from '../components/chat/MessageReactions.vue'
import MessageInput from '../components/chat/MessageInput.vue'
import NotificationBadge from '../components/chat/NotificationBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const { connect, disconnect } = useSocket()
const { 
  conversations, 
  totalUnread, 
  getUnreadCount, 
  resetUnread, 
  setConversations 
} = useNotifications()

// État
const user = ref(null)
const selectedConv = ref(null)
const messages = ref([])
const searchQuery = ref('')
const filter = ref('all')
const showMenu = ref(false)
const showNewConversation = ref(false)
const userSearchQuery = ref('')
const searchResults = ref([])
const messagesContainer = ref(null)
const isTyping = ref(false)
const contextMenu = ref({ show: false, x: 0, y: 0, conversation: null })

// Real-time setup
const selectedConvId = computed(() => selectedConv.value?._id)
const { setupRealtimeListeners, cleanupListeners } = useRealtimeMessages(selectedConvId, messages, scrollToBottom)

// Conversations filtrées
const filteredConversations = computed(() => {
  let filtered = conversations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.contact?.username?.toLowerCase().includes(query) ||
      c.contact?.firstName?.toLowerCase().includes(query) ||
      c.contact?.lastName?.toLowerCase().includes(query) ||
      c.contact?.email?.toLowerCase().includes(query)
    )
  }

  if (filter.value === 'unread') {
    filtered = filtered.filter(c => getUnreadCount(c) > 0)
  } else if (filter.value === 'archived') {
    filtered = filtered.filter(c => c.isArchived)
  }

  return filtered
})

// Fonctions utilitaires
function isOwnMessage(msg) {
  if (!msg || !user.value) return false
  const senderId = msg.sender?._id || msg.sender
  const userId = user.value._id
  return senderId?.toString() === userId?.toString()
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  if (diff < 86400000) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatMessageTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Chargement des données
async function loadProfile() {
  try {
    const res = await api.get('/api/auth/me')
    user.value = res.data.data
    authStore.setUser(user.value)
    console.log('✅ Profil chargé:', user.value.username)
  } catch (error) {
    console.error('❌ Erreur profil:', error)
    router.push('/login')
  }
}

async function loadConversations() {
  try {
    const res = await api.get('/api/conversations')
    const convs = res.data.data?.conversations || res.data.data || []
    
    // Enrichir avec le contact pour les one-to-one
    const enriched = convs.map(conv => {
      if (!conv.isGroup && conv.participants) {
        const contact = conv.participants.find(p => {
          const pId = p._id || p
          return pId.toString() !== user.value._id.toString()
        })
        return { ...conv, contact }
      }
      return conv
    })
    
    setConversations(enriched)
    console.log('✅ Conversations:', enriched.length)
  } catch (error) {
    console.error('❌ Erreur conversations:', error.response?.data || error.message)
  }
}

async function selectConversation(conv) {
  selectedConv.value = conv
  resetUnread(conv._id)
  
  try {
    const res = await api.get(`/api/messages/${conv._id}`)
    messages.value = res.data.data?.messages || []
    console.log('✅ Messages:', messages.value.length, messages.value)
    
    // Marquer comme lu après avoir chargé les messages
    try {
      await api.patch(`/api/conversations/${conv._id}/read`)
    } catch (readError) {
      console.warn('⚠️ Erreur markAsRead:', readError.response?.data || readError.message)
    }
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('❌ Erreur messages:', error.response?.data || error.message)
  }
}

async function handleMessageSent(formData) {
  if (!selectedConv.value) return

  try {
    // Ajouter conversationId au formData
    formData.append('conversationId', selectedConv.value._id)
    
    const res = await api.post('/api/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const newMessage = res.data.data?.message || res.data.data
    console.log('✅ Message envoyé:', newMessage)
    
    if (newMessage && !messages.value.find(m => m._id === newMessage._id)) {
      messages.value.push(newMessage)
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('❌ Erreur envoi:', error.response?.data || error.message)
  }
}

function handleTyping(typing) {
  // Émettre événement typing via socket
  const socket = require('../composables/useSocket').useSocket().getSocket()
  if (socket && selectedConv.value) {
    socket.emit('typing', {
      conversationId: selectedConv.value._id,
      isTyping: typing
    })
  }
}

async function refreshMessages() {
  if (!selectedConv.value) return
  const res = await api.get(`/api/messages/${selectedConv.value._id}`)
  messages.value = res.data.data?.messages || []
}

// Recherche utilisateurs
async function searchUsers() {
  if (userSearchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    const res = await api.get(`/api/users/search?q=${userSearchQuery.value}`)
    // Gérer data.users ou data directement
    searchResults.value = res.data.data?.users || res.data.data || []
    console.log('🔍 Résultats:', searchResults.value.length, searchResults.value)
  } catch (error) {
    console.error('❌ Erreur recherche:', error.response?.data || error)
    searchResults.value = []
  }
}

async function createConversation(targetUser) {
  try {
    const res = await api.post('/api/conversations', { participantId: targetUser._id })
    const newConv = res.data.data?.conversation || res.data.data
    
    newConv.contact = targetUser
    
    const existingIndex = conversations.value.findIndex(c => c._id === newConv._id)
    if (existingIndex >= 0) {
      conversations.value[existingIndex] = newConv
    } else {
      conversations.value.unshift(newConv)
    }
    
    showNewConversation.value = false
    userSearchQuery.value = ''
    searchResults.value = []
    
    selectConversation(newConv)
  } catch (error) {
    console.error('❌ Erreur création:', error.response?.data || error.message)
  }
}

// Menu contextuel
function showConvOptions(conv, event) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    conversation: conv
  }
}

async function archiveConversation(conv) {
  try {
    await api.patch(`/api/conversations/${conv._id}/archive`)
    await loadConversations()
    contextMenu.value.show = false
    console.log('📦 Conversation archivée')
  } catch (error) {
    console.error('❌ Erreur archivage:', error)
  }
}

async function deleteConversation(conv) {
  if (!confirm('Supprimer cette conversation ?')) return
  
  try {
    await api.delete(`/api/conversations/${conv._id}`)
    conversations.value = conversations.value.filter(c => c._id !== conv._id)
    if (selectedConv.value?._id === conv._id) {
      selectedConv.value = null
    }
    contextMenu.value.show = false
    console.log('🗑️ Conversation supprimée')
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
  }
}

function openMedia(url) {
  window.open(`http://localhost:3000${url}`, '_blank')
}

function logout() {
  authStore.logout()
  disconnect()
  router.push('/login')
}

// Fermer menu contextuel au clic
watch(() => contextMenu.value.show, (show) => {
  if (show) {
    const closeMenu = () => {
      contextMenu.value.show = false
      document.removeEventListener('click', closeMenu)
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }
})

onMounted(async () => {
  await loadProfile()
  await loadConversations()
  
  if (authStore.token) {
    connect(authStore.token)
    setTimeout(() => setupRealtimeListeners(), 500)
  }
})

onBeforeUnmount(() => {
  cleanupListeners()
  disconnect()
})
</script>

<style scoped>
.bg-chat-pattern {
  background-color: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
