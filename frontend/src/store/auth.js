import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Vérifier localStorage ET sessionStorage pour le token
  const token = ref(
    localStorage.getItem('whatsup_token') || 
    sessionStorage.getItem('whatsup_token') || 
    null
  )
  const user = ref(JSON.parse(localStorage.getItem('whatsup_user') || 'null'))

  function login(newToken, remember = false) {
    token.value = newToken
    if (remember) {
      localStorage.setItem('whatsup_token', newToken)
      sessionStorage.removeItem('whatsup_token')
    } else {
      sessionStorage.setItem('whatsup_token', newToken)
      localStorage.removeItem('whatsup_token')
    }
  }

  function setUser(u) {
    user.value = u
    localStorage.setItem('whatsup_user', JSON.stringify(u))
    // Stocker aussi l'userId pour un accès rapide
    if (u?._id) {
      localStorage.setItem('userId', u._id)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('whatsup_token')
    localStorage.removeItem('whatsup_user')
    localStorage.removeItem('userId')
    sessionStorage.removeItem('whatsup_token')
  }

  return { token, user, login, logout, setUser }
})

export default useAuthStore
