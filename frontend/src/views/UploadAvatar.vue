<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-dark mb-2">Photo de profil</h2>
        <p class="text-gray-600">Ajoutez une photo pour personnaliser votre profil</p>
      </div>

      <div class="space-y-4">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
        <div v-if="info" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {{ info }}
          <button @click="router.push('/login')" class="mt-2 underline font-semibold">
            Retour à l'accueil
          </button>
        </div>

        <div v-if="preview" class="flex justify-center mb-4">
          <img :src="preview" alt="preview" class="w-40 h-40 rounded-full object-cover border-4 border-primary" />
        </div>

        <div v-if="!info" class="grid grid-cols-2 gap-4">
          <label class="btn-secondary cursor-pointer text-center">
            <input type="file" accept="image/*" @change="onFile" class="hidden" />
            📁 Choisir une photo
          </label>
          <button @click="openCamera" class="btn-secondary">
            📷 Prendre une photo
          </button>
        </div>

        <video ref="video" autoplay playsinline class="hidden w-full rounded-lg"></video>
        <canvas ref="canvas" class="hidden"></canvas>

        <button v-if="!info" @click="upload" :disabled="!file" class="btn-primary w-full">
          Téléverser et continuer
        </button>
        
        <button v-if="!info" @click="skip" class="text-gray-500 hover:text-gray-700 w-full text-center">
          Passer cette étape
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const file = ref(null)
const preview = ref(null)
const video = ref(null)
const canvas = ref(null)
const error = ref('')
const info = ref('')
const router = useRouter()
const authStore = useAuthStore()

const onFile = (e) => {
  const f = e.target.files[0]
  if (!f) return
  file.value = f
  preview.value = URL.createObjectURL(f)
}

const openCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    video.value.srcObject = stream
    video.value.style.display = 'block'
    // capture one frame
    setTimeout(() => {
      canvas.value.width = video.value.videoWidth
      canvas.value.height = video.value.videoHeight
      canvas.value.getContext('2d').drawImage(video.value, 0, 0)
      canvas.value.toBlob(blob => {
        file.value = new File([blob], `avatar-${Date.now()}.png`, { type: 'image/png' })
        preview.value = URL.createObjectURL(file.value)
      })
      // stop tracks
      stream.getTracks().forEach(t => t.stop())
      video.value.style.display = 'none'
    }, 800)
  } catch (err) {
    error.value = 'Impossible d\'accéder à la caméra'
  }
}

const upload = async () => {
  try {
    error.value = ''
    info.value = ''
    const form = new FormData()
    form.append('avatar', file.value)
    const res = await api.post('/api/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    info.value = 'Avatar téléversé ! Configuration terminée.'
    
    // Mettre à jour le user dans le store
    const authStore = useAuthStore()
    if (authStore.user) {
      authStore.user.avatar = res.data.data.avatar
      authStore.setUser(authStore.user)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur upload'
    console.error('Erreur upload:', err)
  }
}

const skip = () => {
  info.value = 'Configuration terminée ! Vous pouvez maintenant utiliser l\'application.'
}
</script>