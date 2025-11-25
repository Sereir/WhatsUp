import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('whatsup_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('whatsup_user') || 'null'))

  function login(newToken, remember = false) {
    token.value = newToken
    if (remember) {
      localStorage.setItem('whatsup_token', newToken)
    } else {
      sessionStorage.setItem('whatsup_token', newToken)
    }
  }

  function setUser(u) {
    user.value = u
    localStorage.setItem('whatsup_user', JSON.stringify(u))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('whatsup_token')
    localStorage.removeItem('whatsup_user')
    sessionStorage.removeItem('whatsup_token')
  }

  return { token, user, login, logout, setUser }
})

export default useAuthStore
