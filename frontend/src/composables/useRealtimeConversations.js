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
      
      const index = conversations.value.findIndex(c => c._id === data.conversationId)
      if (index >= 0) {
        const conv = conversations.value[index]
        
        // Incrémenter unreadCount si le message n'est pas de l'utilisateur actuel
        const messageFromMe = data.message.sender?._id === authStore.user?._id || 
                              data.message.sender === authStore.user?._id
        
        if (!messageFromMe) {
          // Incrémenter d'abord (cela va créer une nouvelle référence)
          incrementUnread(data.conversationId)
        }
        
        // Récupérer la conversation à jour après incrementUnread
        const updatedIndex = conversations.value.findIndex(c => c._id === data.conversationId)
        if (updatedIndex >= 0) {
          const currentConv = conversations.value[updatedIndex]
          
          // Créer une copie avec le nouveau message
          const finalConv = {
            ...currentConv,
            lastMessage: data.message,
            lastMessageAt: data.message.createdAt
          }
          
          // Remonter la conversation en haut de la liste
          conversations.value.splice(updatedIndex, 1)
          conversations.value.unshift(finalConv)
          
          console.log('✅ Conversation mise à jour et remontée en haut')
        }
      } else {
        // Nouvelle conversation détectée, recharger toutes les conversations
        console.log('🔄 Nouvelle conversation détectée, rechargement...')
        if (loadConversations) {
          loadConversations()
        }
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

    // Conversation marquée comme lue (autre utilisateur)
    socket.on('conversation:read', (data) => {
      console.log('👁️ Conversation marquée comme lue:', data)
      // Pas besoin de mettre à jour côté client, car resetUnread est déjà appelé localement
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
      socket.off('conversation:read')
      console.log('🧹 Listeners conversations nettoyés')
    }
  }

  return {
    setupConversationListeners,
    cleanupConversationListeners
  }
}
