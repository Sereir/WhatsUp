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
      // Récupérer l'ID utilisateur
      let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      if (!userId) {
        const authStore = useAuthStore?.()
        userId = authStore?.user?._id
      }
      
      if (userId && typeof conv.unreadCount === 'object' && conv.unreadCount !== null) {
        // Si c'est un objet, incrémenter pour cet utilisateur
        const currentCount = conv.unreadCount[userId.toString()] || 0
        // Forcer la réactivité en recréant l'objet
        conv.unreadCount = { ...conv.unreadCount, [userId.toString()]: currentCount + 1 }
      } else if (typeof conv.unreadCount === 'number') {
        conv.unreadCount++
      } else {
        conv.unreadCount = 1
      }
      
      console.log('🔔 Notification incrémentée pour conversation:', conversationId, 'nouveau count:', conv.unreadCount)
    }
  }

  function resetUnread(conversationId) {
    const index = conversations.value.findIndex(c => c._id === conversationId)
    if (index >= 0) {
      const conv = conversations.value[index]
      
      // Récupérer l'ID utilisateur
      let userId = localStorage.getItem('userId') || sessionStorage.getItem('userId')
      
      if (!userId) {
        const authStore = useAuthStore?.()
        userId = authStore?.user?._id
      }
      
      // Créer une nouvelle copie de la conversation pour forcer la réactivité
      const updatedConv = { ...conv }
      
      if (userId && typeof conv.unreadCount === 'object' && conv.unreadCount !== null) {
        // Si c'est un objet, mettre à jour seulement pour cet utilisateur
        updatedConv.unreadCount = { ...conv.unreadCount, [userId.toString()]: 0 }
      } else {
        // Sinon mettre à 0 directement
        updatedConv.unreadCount = 0
      }
      
      // Remplacer la conversation dans l'array
      conversations.value.splice(index, 1, updatedConv)
      
      console.log('🔔 Notifications réinitialisées pour conversation:', conversationId, 'nouveau count:', updatedConv.unreadCount)
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
