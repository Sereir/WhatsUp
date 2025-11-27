import { ref, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'

let socketInstance = null

export function useSocket() {
  const isConnected = ref(false)
  const error = ref(null)

  function connect(token) {
    if (socketInstance?.connected) {
      console.log('Socket déjà connecté')
      return socketInstance
    }

    try {
      socketInstance = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      socketInstance.on('connect', () => {
        console.log('✅ Socket connecté:', socketInstance.id)
        isConnected.value = true
        error.value = null
        
        // Demander une synchronisation des données manquées
        const lastSync = localStorage.getItem('lastSyncDate')
        socketInstance.emit('sync:request', { 
          lastSyncDate: lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        })
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('❌ Socket déconnecté:', reason)
        isConnected.value = false
      })

      socketInstance.on('connect_error', (err) => {
        console.error('❌ Erreur connexion socket:', err.message)
        error.value = err.message
      })
      
      // Écouter la réponse de synchronisation
      socketInstance.on('sync:response', (data) => {
        console.log('🔄 Synchronisation reçue:', data)
        localStorage.setItem('lastSyncDate', data.syncDate)
        
        // Émettre un événement global pour que les composants puissent réagir
        window.dispatchEvent(new CustomEvent('socket:synced', { detail: data }))
      })

      return socketInstance
    } catch (err) {
      console.error('❌ Erreur création socket:', err)
      error.value = err.message
      return null
    }
  }

  function disconnect() {
    if (socketInstance) {
      console.log('Déconnexion socket...')
      socketInstance.disconnect()
      socketInstance = null
      isConnected.value = false
    }
  }

  function getSocket() {
    return socketInstance
  }

  return {
    connect,
    disconnect,
    getSocket,
    isConnected,
    error
  }
}
