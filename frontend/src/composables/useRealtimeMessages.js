import { useSocket } from './useSocket'

export function useRealtimeMessages(selectedConversationId, messages, onNewMessage, isTyping) {
  const { getSocket } = useSocket()

  function setupRealtimeListeners() {
    const socket = getSocket()
    if (!socket) {
      console.warn('⚠️ Socket non disponible')
      return
    }

    // Nouveau message
    socket.on('message:new', async (data) => {
      console.log('📨 Nouveau message reçu:', data)
      
      if (data.conversationId === selectedConversationId.value) {
        // Vérifier si le message n'existe pas déjà (éviter les doublons)
        const exists = messages.value.find(m => m._id === data.message._id)
        if (!exists) {
          messages.value.push(data.message)
          
          // Marquer comme lu immédiatement puisqu'on est sur la conversation
          try {
            const api = (await import('@/services/api')).default
            await api.patch(`/api/conversations/${data.conversationId}/read`)
            console.log('✅ Conversation marquée comme lue')
          } catch (error) {
            console.warn('⚠️ Erreur markAsRead:', error)
          }
          
          // Scroller en bas
          if (onNewMessage) {
            onNewMessage()
          }
        }
      }
    })

    // Événement typing (quelqu'un écrit)
    socket.on('typing:start', (data) => {
      console.log('✍️ Typing start:', data)
      
      if (data.conversationId === selectedConversationId.value) {
        if (isTyping && isTyping.value !== undefined) {
          isTyping.value = true
          console.log('🟢 isTyping mis à true')
        }
      }
    })

    socket.on('typing:stop', (data) => {
      console.log('✍️ Typing stop:', data)
      
      if (data.conversationId === selectedConversationId.value) {
        if (isTyping && isTyping.value !== undefined) {
          isTyping.value = false
          console.log('🔴 isTyping mis à false')
        }
      }
    })

    // Réaction ajoutée
    socket.on('reaction:added', (data) => {
      console.log('👍 Réaction ajoutée:', data)
      
      const message = messages.value.find(m => m._id === data.messageId)
      if (message) {
        if (!message.reactions) {
          message.reactions = []
        }
        message.reactions.push(data.reaction)
      }
    })

    // Réaction retirée
    socket.on('reaction:removed', (data) => {
      console.log('👎 Réaction retirée:', data)
      
      const message = messages.value.find(m => m._id === data.messageId)
      if (message && message.reactions) {
        message.reactions = message.reactions.filter(r => 
          !(r.user === data.userId || r.user?._id === data.userId)
        )
      }
    })

    // Message édité
    socket.on('message:edited', (data) => {
      console.log('✏️ Message édité:', data)
      
      const index = messages.value.findIndex(m => m._id === data.message._id || m._id === data.messageId)
      if (index >= 0) {
        messages.value[index] = { 
          ...messages.value[index], 
          content: data.message.content || data.content,
          edited: true
        }
      }
    })

    // Message supprimé
    socket.on('message:deleted', (data) => {
      console.log('🗑️ Message supprimé:', data)
      
      // Toujours supprimer le message de la liste (pour tout le monde ou pour moi)
      const index = messages.value.findIndex(m => m._id === data.messageId)
      if (index >= 0) {
        messages.value.splice(index, 1)
        console.log('✅ Message retiré de la liste')
      }
    })

    // Message supprimé
    socket.on('message:deleted', (data) => {
      console.log('🗑️ Message supprimé:', data)
      
      if (data.deleteForEveryone) {
        // Supprimer complètement
        messages.value = messages.value.filter(m => m._id !== data.messageId)
      } else {
        // Marquer comme supprimé pour l'utilisateur
        const message = messages.value.find(m => m._id === data.messageId)
        if (message) {
          message.content = 'Message supprimé'
          message.deleted = true
        }
      }
    })

    console.log('✅ Listeners temps réel configurés')
  }

  function cleanupListeners() {
    const socket = getSocket()
    if (socket) {
      socket.off('message:new')
      socket.off('typing:start')
      socket.off('typing:stop')
      socket.off('reaction:added')
      socket.off('reaction:removed')
      socket.off('message:edited')
      socket.off('message:deleted')
      console.log('🧹 Listeners nettoyés')
    }
  }

  return {
    setupRealtimeListeners,
    cleanupListeners
  }
}
