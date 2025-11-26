import { useSocket } from './useSocket'
import { useNotifications } from './useNotifications'
import { useAuthStore } from '../store/auth'

export function useRealtimeConversations(conversations, loadConversations) {
  const { getSocket } = useSocket()
  const { incrementUnread } = useNotifications()
  const authStore = useAuthStore()

  function setupConversationListeners() {
    const socket = getSocket()
    if (!socket) {
      console.warn('⚠️ Socket non disponible pour conversations')
      return
    }

    // Nouveau message reçu - mettre à jour lastMessage
    socket.on('message:new', (data) => {
      console.log('📨 Nouveau message pour conversation:', data.conversationId)
      
      const conv = conversations.value.find(c => c._id === data.conversationId)
      if (conv) {
        conv.lastMessage = data.message
        conv.lastMessageAt = data.message.createdAt
        
        // Incrémenter unreadCount si le message n'est pas de l'utilisateur actuel
        const messageFromMe = data.message.sender?._id === authStore.user?._id || 
                              data.message.sender === authStore.user?._id
        
        if (!messageFromMe) {
          incrementUnread(data.conversationId)
        }
        
        // Remonter la conversation en haut de la liste
        const index = conversations.value.indexOf(conv)
        if (index > 0) {
          conversations.value.splice(index, 1)
          conversations.value.unshift(conv)
        }
      } else {
        // Nouvelle conversation, recharger
        loadConversations()
      }
    })

    // Conversation créée ou mise à jour
    socket.on('conversation:updated', async (data) => {
      console.log('📬 Conversation mise à jour:', data)
      
      if (data.unarchive || data.restore) {
        // Recharger toutes les conversations pour synchroniser
        console.log('🔄 Rechargement des conversations (unarchive/restore)...')
        await loadConversations()
      } else if (data.conversation) {
        // Ajouter ou mettre à jour la conversation
        const index = conversations.value.findIndex(c => c._id === data.conversation._id)
        if (index >= 0) {
          conversations.value[index] = data.conversation
        } else {
          conversations.value.unshift(data.conversation)
        }
      }
    })

    // Conversation supprimée
    socket.on('conversation:deleted', (data) => {
      console.log('🗑️ Conversation supprimée:', data.conversationId)
      conversations.value = conversations.value.filter(c => c._id !== data.conversationId)
    })

    // Conversation archivée/désarchivée
    socket.on('conversation:archived', async (data) => {
      console.log('📦 Conversation archivée/désarchivée:', data)
      if (data.isArchived) {
        // Retirer de la liste (sauf si on affiche les archivées)
        conversations.value = conversations.value.filter(c => c._id !== data.conversationId)
      } else {
        // Recharger pour afficher la conversation désarchivée
        await loadConversations()
      }
    })

    console.log('✅ Listeners conversations configurés')
  }

  function cleanupConversationListeners() {
    const socket = getSocket()
    if (socket) {
      socket.off('message:new')
      socket.off('conversation:updated')
      socket.off('conversation:deleted')
      socket.off('conversation:archived')
      console.log('🧹 Listeners conversations nettoyés')
    }
  }

  return {
    setupConversationListeners,
    cleanupConversationListeners
  }
}
