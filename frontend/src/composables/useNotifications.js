import { ref, computed } from 'vue'
import { useAuthStore } from '../store/auth'

// Singleton pour partager l'état entre les composables
const conversations = ref([])

export function useNotifications() {
  const totalUnread = computed(() => {
    return conversations.value.reduce((sum, conv) => {
      const unread = getUnreadCount(conv)
      return sum + unread
    }, 0)
  })

  function getUnreadCount(conversation) {
    if (!conversation) return 0
    
    // Récupérer l'ID utilisateur depuis localStorage/sessionStorage
    let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
    
    // Si pas dans le storage, essayer depuis le store auth
    if (!userId) {
      const authStore = useAuthStore?.()
      userId = authStore?.user?._id
    }
    
    if (!userId) return 0
    
    const unreadCount = conversation.unreadCount
    
    // Gérer Map
    if (typeof unreadCount === 'object' && unreadCount?.get) {
      return unreadCount.get(userId.toString()) || 0
    }
    
    // Gérer objet JSON sérialisé {userId: count}
    if (typeof unreadCount === 'object' && unreadCount !== null) {
      return unreadCount[userId.toString()] || unreadCount[userId] || 0
    }
    
    // Gérer nombre direct
    if (typeof unreadCount === 'number') {
      return unreadCount
    }
    
    return 0
  }

  function incrementUnread(conversationId) {
    const conv = conversations.value.find(c => c._id === conversationId)
    if (conv) {
      if (typeof conv.unreadCount === 'number') {
        conv.unreadCount++
      } else {
        conv.unreadCount = 1
      }
    }
  }

  function resetUnread(conversationId) {
    const conv = conversations.value.find(c => c._id === conversationId)
    if (conv) {
      // Récupérer l'ID utilisateur
      let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      if (!userId) {
        const authStore = useAuthStore?.()
        userId = authStore?.user?._id
      }
      
      if (userId && typeof conv.unreadCount === 'object' && conv.unreadCount !== null) {
        // Si c'est un objet, mettre à jour seulement pour cet utilisateur
        conv.unreadCount[userId.toString()] = 0
      } else {
        // Sinon mettre à 0 directement
        conv.unreadCount = 0
      }
      
      console.log('🔔 Notifications réinitialisées pour conversation:', conversationId)
    }
  }

  function setConversations(convs) {
    conversations.value = convs
  }

  return {
    conversations,
    totalUnread,
    getUnreadCount,
    incrementUnread,
    resetUnread,
    setConversations
  }
}
