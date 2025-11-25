import { useSocket } from './useSocket'

export function useRealtimeMessages(selectedConversationId, messages, onNewMessage) {
  const { getSocket } = useSocket()

  function setupRealtimeListeners() {
    const socket = getSocket()
    if (!socket) {
      console.warn('⚠️ Socket non disponible')
      return
    }

    // Nouveau message
    socket.on('newMessage', (data) => {
      console.log('📨 Nouveau message reçu:', data)
      
      if (data.conversationId === selectedConversationId.value) {
        // Vérifier si le message n'existe pas déjà (éviter les doublons)
        const exists = messages.value.find(m => m._id === data.message._id)
        if (!exists) {
          messages.value.push(data.message)
          
          // Scroller en bas
          if (onNewMessage) {
            onNewMessage()
          }
        }
      }
    })

    // Réaction ajoutée
    socket.on('reactionAdded', (data) => {
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
    socket.on('reactionRemoved', (data) => {
      console.log('👎 Réaction retirée:', data)
      
      const message = messages.value.find(m => m._id === data.messageId)
      if (message && message.reactions) {
        message.reactions = message.reactions.filter(r => 
          !(r.user === data.userId || r.user?._id === data.userId)
        )
      }
    })

    console.log('✅ Listeners temps réel configurés')
  }

  function cleanupListeners() {
    const socket = getSocket()
    if (socket) {
      socket.off('newMessage')
      socket.off('reactionAdded')
      socket.off('reactionRemoved')
      console.log('🧹 Listeners nettoyés')
    }
  }

  return {
    setupRealtimeListeners,
    cleanupListeners
  }
}
