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
          <button
            @click="$router.push('/contacts')"
            class="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Contacts"
          >
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-gray-600">
              <path d="M16,17V19H2V17S2,13 9,13 16,17 16,17M12.5,7.5A3.5,3.5 0 0,1 9,11A3.5,3.5 0 0,1 5.5,7.5A3.5,3.5 0 0,1 9,4A3.5,3.5 0 0,1 12.5,7.5M15.94,13C16.62,13.75 17,14.71 17,15.94V19H22V17S22,13.37 15.94,13M15,4A3.39,3.39 0 0,0 13.07,4.59A5,5 0 0,1 13.07,10.41A3.39,3.39 0 0,0 15,11A3.5,3.5 0 0,0 18.5,7.5A3.5,3.5 0 0,0 15,4Z"/>
            </svg>
          </button>
          <button
            @click="$router.push('/create-group')"
            class="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Créer un groupe"
          >
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current text-gray-600">
              <path d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"/>
            </svg>
          </button>
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
          :key="`${conv._id}-${conv.lastMessageAt}-${getUnreadCount(conv)}`"
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
              <!-- Avatar groupe -->
              <img 
                v-if="conv.isGroup && conv.groupAvatar" 
                :src="`http://localhost:3000/${conv.groupAvatar}`" 
                class="w-12 h-12 rounded-full object-cover" 
              />
              <div v-else-if="conv.isGroup" class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {{ conv.groupName?.[0]?.toUpperCase() || 'G' }}
              </div>
              <!-- Avatar contact -->
              <img 
                v-else-if="conv.contact?.avatar" 
                :src="`http://localhost:3000${conv.contact.avatar}`" 
                class="w-12 h-12 rounded-full object-cover" 
              />
              <div v-else class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {{ conv.contact?.firstName?.[0] || '?' }}{{ conv.contact?.lastName?.[0] || '' }}
              </div>
              <!-- Statut en ligne (seulement pour contacts) -->
              <div 
                v-if="!conv.isGroup && conv.contact?.status === 'online'" 
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
              ></div>
            </div>
            <!-- Info conversation -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 truncate">
                    {{ conv.isGroup ? conv.groupName : (conv.contact?.username || conv.contact?.firstName || 'Utilisateur') }}
                  </p>
                  <span v-if="conv.isGroup" class="flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">Groupe</span>
                </div>
                <p class="text-xs text-gray-500 flex-shrink-0 ml-2">{{ formatDate(conv.lastMessageAt) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <p :class="['text-sm truncate flex-1', getUnreadCount(conv) > 0 ? 'font-semibold text-gray-900' : 'text-gray-600']">
                  {{ getLastMessagePreview(conv) }}
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
            <div class="relative">
              <!-- Avatar groupe -->
              <img 
                v-if="selectedConv.isGroup && selectedConv.groupAvatar" 
                :src="`http://localhost:3000/${selectedConv.groupAvatar}`" 
                class="w-10 h-10 rounded-full object-cover" 
              />
              <div v-else-if="selectedConv.isGroup" class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {{ selectedConv.groupName?.[0]?.toUpperCase() || 'G' }}
              </div>
              <!-- Avatar contact -->
              <img 
                v-else-if="selectedConv.contact?.avatar" 
                :src="`http://localhost:3000${selectedConv.contact.avatar}`" 
                class="w-10 h-10 rounded-full object-cover" 
              />
              <div v-else class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {{ selectedConv.contact?.firstName?.[0] }}{{ selectedConv.contact?.lastName?.[0] }}
              </div>
              <!-- Puce verte statut en ligne (seulement pour contacts) -->
              <div 
                v-if="!selectedConv.isGroup && selectedConv.contact?.status === 'online'" 
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
              ></div>
            </div>
            <div class="text-white">
              <p class="font-semibold">
                {{ selectedConv.isGroup ? selectedConv.groupName : (selectedConv.contact?.username || selectedConv.contact?.firstName) }}
              </p>
              <p class="text-xs opacity-75">
                {{ selectedConv.isGroup ? `${selectedConv.participants?.length || 0} participant(s)` : (selectedConv.contact?.status === 'online' ? 'En ligne' : 'Hors ligne') }}
              </p>
            </div>
          </div>
          <!-- Bouton paramètres -->
          <button 
            @click="showSettings = true"
            class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
            title="Paramètres de la conversation"
          >
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        <!-- Affichage des messages avec scroll automatique -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-chat-pattern">
          <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
            <p>Aucun message. Commencez la conversation !</p>
          </div>
          
          <div v-for="msg in messages" :key="msg._id" class="mb-4" :data-message-id="msg._id">
            <div :class="['flex items-start gap-2', isOwnMessage(msg) ? 'justify-end' : 'justify-start']">
              <!-- Avatar dans les groupes (seulement pour les autres) -->
              <img 
                v-if="selectedConv.isGroup && !isOwnMessage(msg) && msg.sender?.avatar" 
                :src="`http://localhost:3000${msg.sender.avatar}`" 
                :alt="getSenderName(msg)"
                class="w-8 h-8 rounded-full object-cover mt-1"
              />
              <div 
                v-else-if="selectedConv.isGroup && !isOwnMessage(msg)" 
                class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mt-1"
              >
                {{ getSenderName(msg)?.[0]?.toUpperCase() }}
              </div>
              
              <div 
                :class="['relative max-w-md rounded-lg p-3 shadow transition-all group', isOwnMessage(msg) ? 'bg-primary text-white' : 'bg-white']"
                @contextmenu.prevent="!msg.isDeleted && showMessageActions(msg, $event)"
              >
                <!-- Nom de l'expéditeur dans les groupes -->
                <p 
                  v-if="selectedConv.isGroup && !isOwnMessage(msg) && !msg.isDeleted" 
                  :class="['text-xs font-semibold mb-1', isOwnMessage(msg) ? 'text-white' : 'text-primary']"
                >
                  {{ getSenderName(msg) }}
                </p>
                <!-- Bouton actions en haut à droite -->
                <button
                  v-if="!msg.isDeleted"
                  @click.stop="showMessageActions(msg, $event)"
                  :class="[
                    'absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-opacity-20 rounded',
                    isOwnMessage(msg) ? 'right-1 hover:bg-white' : 'right-1 hover:bg-gray-200'
                  ]"
                  title="Actions"
                >
                  <svg viewBox="0 0 24 24" :class="['w-4 h-4', isOwnMessage(msg) ? 'fill-white' : 'fill-gray-600']">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
                <!-- Message cité -->
                <div 
                  v-if="msg.replyTo && !msg.isDeleted"
                  class="mb-2 p-2 border-l-4 rounded"
                  :class="isOwnMessage(msg) ? 'bg-white bg-opacity-20 border-white' : 'bg-gray-100 border-primary'"
                  @click="scrollToMessage(msg.replyTo._id || msg.replyTo)"
                  style="cursor: pointer;"
                >
                  <p :class="['text-xs font-semibold mb-1', isOwnMessage(msg) ? 'text-white' : 'text-primary']">
                    {{ getReplyToSender(msg.replyTo) }}
                  </p>
                  <p :class="['text-sm truncate', isOwnMessage(msg) ? 'text-white text-opacity-75' : 'text-gray-600']">
                    {{ getReplyToContent(msg.replyTo) }}
                  </p>
                </div>

                <!-- Message supprimé -->
                <p v-if="msg.isDeleted" class="italic opacity-75">Ce message a été supprimé</p>

                <template v-else>
                  <!-- Image -->
                  <div v-if="(msg.type === 'image' || msg.mimeType?.startsWith('image/')) && msg.mediaUrl" class="mb-2">
                    <img 
                      :src="`http://localhost:3000${msg.mediaUrl}`" 
                      :alt="msg.fileName || 'Image'"
                      class="max-w-full rounded cursor-pointer"
                      style="max-height: 300px"
                      @click="openMedia(msg.mediaUrl)"
                    />
                  </div>

                  <!-- Vidéo -->
                  <div v-if="(msg.type === 'video' || msg.mimeType?.startsWith('video/')) && msg.mediaUrl" class="mb-2">
                    <video 
                      :src="`http://localhost:3000${msg.mediaUrl}`" 
                      controls
                      class="max-w-full rounded"
                      style="max-height: 300px"
                    ></video>
                  </div>

                  <!-- Fichier (PDF, etc.) -->
                  <div v-if="((msg.type === 'file' || msg.type === 'audio') && msg.mediaUrl) || (msg.mediaUrl && !msg.mimeType?.startsWith('image/') && !msg.mimeType?.startsWith('video/'))" class="mb-2 p-3 bg-white bg-opacity-50 rounded flex items-center gap-3">
                    <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current" :class="isOwnMessage(msg) ? 'text-white' : 'text-gray-600'">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-sm truncate" :class="isOwnMessage(msg) ? 'text-white' : 'text-gray-900'">{{ msg.fileName || 'Fichier' }}</p>
                      <p class="text-xs" :class="isOwnMessage(msg) ? 'text-white text-opacity-75' : 'text-gray-500'">{{ formatFileSize(msg.mediaSize) }}</p>
                    </div>
                    <a 
                      :href="`http://localhost:3000${msg.mediaUrl}`" 
                      download
                      class="p-2 rounded-full transition"
                      :class="isOwnMessage(msg) ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'"
                      title="Télécharger"
                    >
                      <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" :class="isOwnMessage(msg) ? 'text-white' : 'text-gray-600'">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                      </svg>
                    </a>
                  </div>

                  <!-- Contenu texte -->
                  <p v-if="msg.content" class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
                </template>
                
                <!-- Horodatage -->
                <p :class="['text-xs mt-1', isOwnMessage(msg) ? 'text-white text-opacity-75' : 'text-gray-500']">
                  {{ formatMessageTime(msg.createdAt) }}
                  <span v-if="msg.isEdited || msg.edited" class="ml-1 italic">· modifié</span>
                </p>
                
                <!-- Réactions (ÉTAPE 7.3) -->
                <MessageReactions 
                  v-if="!msg.isDeleted"
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
          :editingMessage="editingMessage"
          :replyingTo="replyingTo"
          @messageSent="handleMessageSent"
          @messageEdited="handleMessageEdited"
          @cancelEdit="editingMessage = null"
          @cancelReply="replyingTo = null"
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
        🗄️ Archiver
      </button>
      <button 
        @click="deleteConversation(contextMenu.conversation)" 
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        🗑️ Supprimer
      </button>
    </div>

    <!-- Message Actions Menu -->
    <MessageActions 
      v-if="messageActionsMenu.show"
      :message="messageActionsMenu.message"
      :position="messageActionsMenu.position"
      :conversation="selectedConv"
      @close="messageActionsMenu.show = false"
      @reply="handleReply"
      @edit="handleEdit"
      @delete="handleDelete"
      @reaction="handleReaction"
    />

    <!-- Conversation Settings Panel -->
    <Teleport to="body">
      <div 
        v-if="showSettings"
        class="fixed inset-0 z-50 flex"
      >
        <div 
          class="flex-1 bg-black bg-opacity-50"
          @click="showSettings = false"
        ></div>
        <div class="w-96 bg-white shadow-xl">
          <ConversationSettings 
            :conversation="selectedConv"
            :contact="selectedConv?.contact"
            @close="showSettings = false"
            @updated="handleConversationUpdated"
            @scrollToMessage="scrollToMessage"
            @block="handleBlockContact"
            @archive="handleArchiveConversation"
            @delete="handleDeleteConversation"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSocket } from '../composables/useSocket'
import { useNotifications } from '../composables/useNotifications'
import { useRealtimeMessages } from '../composables/useRealtimeMessages'
import { useRealtimeConversations } from '../composables/useRealtimeConversations'
import api from '../services/api'
import MessageReactions from '../components/chat/MessageReactions.vue'
import MessageInput from '../components/chat/MessageInput.vue'
import MessageActions from '../components/chat/MessageActions.vue'
import ConversationSettings from '../components/chat/ConversationSettings.vue'
import NotificationBadge from '../components/chat/NotificationBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const { connect, disconnect, getSocket } = useSocket()
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
const allConversations = ref([]) // Toutes les conversations incluant archivées

// Message actions
const messageActionsMenu = ref({
  show: false,
  message: null,
  position: { x: 0, y: 0 }
})

// Edit & Reply states
const editingMessage = ref(null)
const replyingTo = ref(null)

// Settings panel
const showSettings = ref(false)

// Real-time setup
const selectedConvId = computed(() => selectedConv.value?._id)
const { setupRealtimeListeners, cleanupListeners } = useRealtimeMessages(selectedConvId, messages, scrollToBottom, isTyping)
const { setupConversationListeners, cleanupConversationListeners } = useRealtimeConversations(conversations, loadConversations)

// Conversations filtrées
const filteredConversations = computed(() => {
  let filtered = conversations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => {
      // Recherche dans les groupes
      if (c.isGroup) {
        return c.groupName?.toLowerCase().includes(query) ||
               c.groupDescription?.toLowerCase().includes(query)
      }
      // Recherche dans les contacts
      return c.contact?.username?.toLowerCase().includes(query) ||
             c.contact?.firstName?.toLowerCase().includes(query) ||
             c.contact?.lastName?.toLowerCase().includes(query) ||
             c.contact?.email?.toLowerCase().includes(query)
    })
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

function getSenderName(msg) {
  if (!msg || !msg.sender) return 'Inconnu'
  const sender = msg.sender
  return sender.username || sender.firstName || sender.email || 'Inconnu'
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

function getLastMessagePreview(conv) {
  const msg = conv.lastMessage
  if (!msg) return 'Aucun message'
  
  if (msg.isDeleted) return 'Ce message a été supprimé'
  
  if (msg.type === 'image' || msg.mimeType?.startsWith('image/')) return '📷 Photo'
  if (msg.type === 'video' || msg.mimeType?.startsWith('video/')) return '🎥 Vidéo'
  if (msg.type === 'audio' || msg.mimeType?.startsWith('audio/')) return '🎵 Audio'
  if (msg.type === 'file' || msg.mediaUrl) return '📎 Fichier'
  
  return msg.content || 'Aucun message'
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
    // Charger toutes les conversations (incluant archivées)
    const res = await api.get('/api/conversations?includeArchived=true')
    const convs = res.data.data?.conversations || res.data.data || []
    
    // Enrichir avec le contact pour les one-to-one
    const enriched = convs.map(conv => {
      if (!conv.isGroup && conv.participants) {
        const contact = conv.participants.find(p => {
          const pId = p._id || p
          return pId.toString() !== user.value._id.toString()
        })
        
        // Déterminer si archivée pour cet utilisateur
        const isArchivedForMe = conv.archivedBy && conv.archivedBy.some(id => 
          (id._id || id).toString() === user.value._id.toString()
        )
        
        return { ...conv, contact, isArchived: isArchivedForMe }
      }
      
      // Pour les groupes, vérifier aussi si archivé
      const isArchivedForMe = conv.archivedBy && conv.archivedBy.some(id => 
        (id._id || id).toString() === user.value._id.toString()
      )
      
      return { ...conv, isArchived: isArchivedForMe }
    })
    
    // Stocker toutes les conversations pour recherche
    allConversations.value = enriched
    
    // Séparer archivées et actives
    const activeConvs = enriched.filter(c => !c.isArchived)
    const archivedConvs = enriched.filter(c => c.isArchived)
    
    // Afficher selon le filtre actuel
    if (filter.value === 'archived') {
      setConversations(archivedConvs)
    } else {
      setConversations(activeConvs)
    }
    
    // Rejoindre automatiquement toutes les conversations actives
    const socket = getSocket()
    if (socket && socket.connected) {
      activeConvs.forEach(conv => {
        socket.emit('conversation:join', conv._id)
      })
      console.log(`🔌 Rejoint ${activeConvs.length} conversations automatiquement`)
    }
    
    console.log('✅ Conversations:', activeConvs.length, 'actives,', archivedConvs.length, 'archivées')
  } catch (error) {
    console.error('❌ Erreur conversations:', error.response?.data || error.message)
  }
}

async function selectConversation(conv) {
  selectedConv.value = conv
  resetUnread(conv._id)
  
  // Rejoindre la conversation via Socket.io
  const socket = getSocket()
  if (socket) {
    socket.emit('conversation:join', conv._id)
    console.log('🔌 Rejoint conversation room:', conv._id)
  }
  
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
    // Réinitialiser le compteur de notifications
    resetUnread(selectedConv.value._id)
    
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
  const socket = getSocket()
  if (socket && selectedConv.value) {
    if (typing) {
      socket.emit('typing:start', {
        conversationId: selectedConv.value._id
      })
    } else {
      socket.emit('typing:stop', {
        conversationId: selectedConv.value._id
      })
    }
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
    console.log('🆕 Création/restauration conversation avec:', targetUser.firstName)
    
    // Appeler l'API pour créer/restaurer la conversation
    const res = await api.post('/api/conversations', { participantId: targetUser._id })
    const newConv = res.data.data?.conversation || res.data.data
    
    console.log('✅ Conversation créée/restaurée:', newConv._id)
    
    // L'événement Socket.io conversation:updated va recharger automatiquement les conversations
    // Attendre un peu pour que le rechargement se fasse
    await new Promise(resolve => setTimeout(resolve, 500))
    
    showNewConversation.value = false
    userSearchQuery.value = ''
    searchResults.value = []
    
    // Trouver et sélectionner la conversation dans la liste rechargée
    const conv = conversations.value.find(c => c._id === newConv._id)
    if (conv) {
      selectConversation(conv)
    } else {
      // Si pas encore dans la liste, l'ajouter manuellement
      newConv.contact = targetUser
      conversations.value.unshift(newConv)
      selectConversation(newConv)
    }
    
    console.log('✨ Conversation sélectionnée avec historique')
  } catch (error) {
    console.error('❌ Erreur création:', error.response?.data || error.message)
    alert('Erreur lors de la création de la conversation')
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
  const confirmText = 'Supprimer cette conversation ?\n\nNote: Cela masquera la conversation. Vous pourrez la restaurer en envoyant un nouveau message.'
  if (!confirm(confirmText)) return
  
  try {
    // Supprimer (masquer) la conversation
    await api.delete(`/api/conversations/${conv._id}`)
    
    // Retirer de la liste locale
    const updatedConvs = conversations.value.filter(c => c._id !== conv._id)
    setConversations(updatedConvs)
    
    // Retirer aussi de allConversations
    allConversations.value = allConversations.value.filter(c => c._id !== conv._id)
    
    if (selectedConv.value?._id === conv._id) {
      selectedConv.value = null
    }
    
    contextMenu.value.show = false
    console.log('🗑️ Conversation supprimée')
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    alert('Erreur lors de la suppression de la conversation')
  }
}

// Message actions
function showMessageActions(message, event) {
  event.stopPropagation()
  console.log('🔧 Ouverture menu actions pour:', message)
  messageActionsMenu.value = {
    show: true,
    message,
    position: { x: event.clientX, y: event.clientY }
  }
  console.log('📋 Menu state:', messageActionsMenu.value)
}

function handleReply(message) {
  replyingTo.value = message
  messageActionsMenu.value.show = false
}

function handleEdit(message) {
  editingMessage.value = message
  messageActionsMenu.value.show = false
}

async function handleDelete({ messageId, deleteForEveryone }) {
  try {
    console.log('🗑️ Suppression confirmée côté API:', messageId, 'deleteForEveryone:', deleteForEveryone)
    // L'UI sera mise à jour automatiquement via Socket.io (message:deleted)
    // Ne rien faire ici, juste fermer le menu
  } catch (error) {
    console.error('❌ Erreur suppression message:', error)
  }
  messageActionsMenu.value.show = false
}

function handleReaction({ messageId, emoji }) {
  console.log('👍 Réaction ajoutée:', emoji, 'sur message', messageId)
}

async function handleMessageEdited({ messageId, newContent }) {
  try {
    const res = await api.patch(`/api/messages/${messageId}`, { content: newContent })
    const updatedMessage = res.data.data?.message || res.data.data
    
    const index = messages.value.findIndex(m => m._id === messageId)
    if (index >= 0) {
      messages.value[index] = { ...messages.value[index], ...updatedMessage, edited: true }
    }
    
    editingMessage.value = null
    console.log('✏️ Message édité')
  } catch (error) {
    console.error('❌ Erreur édition:', error)
  }
}

async function handleConversationUpdated() {
  console.log('🔄 Rechargement de la conversation après mise à jour...')
  try {
    // Recharger la conversation actuelle
    if (selectedConv.value?._id) {
      const res = await api.get(`/api/conversations/${selectedConv.value._id}`)
      const updatedConv = res.data.data
      
      // Mettre à jour selectedConv en conservant le contact
      selectedConv.value = {
        ...selectedConv.value,
        ...updatedConv,
        contact: selectedConv.value.contact
      }
      
      console.log('✅ Conversation rechargée:', updatedConv)
    }
    
    // Recharger aussi la liste des conversations
    await loadConversations()
  } catch (error) {
    console.error('❌ Erreur rechargement conversation:', error)
  }
}

function scrollToMessage(messageId) {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageEl) {
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    messageEl.classList.add('highlight-message')
    setTimeout(() => messageEl.classList.remove('highlight-message'), 2000)
  }
  showSettings.value = false
}

function getReplyToSender(replyTo) {
  const msg = typeof replyTo === 'string' ? messages.value.find(m => m._id === replyTo) : replyTo
  if (!msg) return 'Message supprimé'
  
  const sender = msg.sender
  if (isOwnMessage(msg)) return 'Vous'
  return sender?.username || sender?.firstName || 'Utilisateur'
}

function getReplyToContent(replyTo) {
  const msg = typeof replyTo === 'string' ? messages.value.find(m => m._id === replyTo) : replyTo
  if (!msg) return 'Message supprimé'
  
  if (msg.content) return msg.content
  if (msg.mediaUrl) return '📎 Fichier'
  return 'Message'
}

async function handleBlockContact(contact) {
  console.log('🚫 Bloquer contact:', contact)
  // Le blocage est géré directement dans ConversationSettings
  // Cette fonction est appelée pour information seulement
  showSettings.value = false
}

async function handleArchiveConversation(conversation) {
  try {
    console.log('📦 Archivage conversation:', conversation._id)
    await api.patch(`/api/conversations/${conversation._id}/archive`)
    showSettings.value = false
    console.log('✅ Conversation archivée/désarchivée')
  } catch (error) {
    console.error('❌ Erreur archivage:', error)
  }
}

function handleDeleteConversation(conversation) {
  deleteConversation(conversation)
  showSettings.value = false
}

function openMedia(url) {
  window.open(`http://localhost:3000${url}`, '_blank')
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function logout() {
  authStore.logout()
  disconnect()
  router.push('/login')
}

// Recharger les conversations quand le filtre change
watch(() => filter.value, () => {
  if (filter.value === 'archived') {
    const archivedConvs = allConversations.value.filter(c => c.isArchived)
    setConversations(archivedConvs)
  } else if (filter.value === 'unread') {
    const unreadConvs = allConversations.value.filter(c => !c.isArchived && getUnreadCount(c) > 0)
    setConversations(unreadConvs)
  } else {
    const activeConvs = allConversations.value.filter(c => !c.isArchived)
    setConversations(activeConvs)
  }
})

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

// Fermer menu actions au clic ailleurs
watch(() => messageActionsMenu.value.show, (show) => {
  if (show) {
    const closeMenu = () => {
      messageActionsMenu.value.show = false
      document.removeEventListener('click', closeMenu)
    }
    setTimeout(() => document.addEventListener('click', closeMenu), 0)
  }
})

onMounted(async () => {
  await loadProfile()
  
  // Connecter le socket avant de charger les conversations
  if (authStore.token) {
    connect(authStore.token)
    
    // Attendre que le socket soit connecté
    const socket = getSocket()
    if (socket) {
      // Attendre l'événement de connexion
      socket.once('connect', () => {
        console.log('🔌 Socket connecté, configuration des listeners...')
        setupRealtimeListeners()
        setupConversationListeners()
      })
      
      // Si déjà connecté
      if (socket.connected) {
        setupRealtimeListeners()
        setupConversationListeners()
      }
    }
  }
  
  // Charger les conversations après la configuration du socket
  await loadConversations()
})

onBeforeUnmount(() => {
  cleanupListeners()
  cleanupConversationListeners()
  disconnect()
})
</script>

<style scoped>
.bg-chat-pattern {
  background-color: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Highlight message effect */
:deep(.highlight-message) {
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  0%, 100% {
    background-color: inherit;
  }
  50% {
    background-color: #fff59d !important;
  }
}
</style>
