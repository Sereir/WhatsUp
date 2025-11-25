<template>
  <div class="p-4 bg-gray-50 border-t">
    <!-- ÉTAPE 7.4: Prévisualisation fichier avec annulation -->
    <div v-if="selectedFile" class="mb-3 p-3 bg-white rounded-lg border flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-12 h-12 relative">
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="#e5e7eb" stroke-width="4" fill="none"/>
            <circle 
              cx="24" cy="24" r="20" 
              stroke="#25D366" 
              stroke-width="4" 
              fill="none"
              :stroke-dasharray="`${uploadProgress * 1.256} 125.6`"
            />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-xs font-bold">
            {{ uploadProgress }}%
          </span>
        </div>
        <div v-else class="text-2xl">
          {{ getFileIcon(selectedFile.type) }}
        </div>
        <div class="flex-1">
          <p class="font-medium text-sm">{{ selectedFile.name }}</p>
          <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
      </div>
      <button 
        @click="cancelFile" 
        class="text-red-500 hover:text-red-700 p-2"
        :disabled="uploadProgress > 0 && uploadProgress < 100"
      >
        ✕
      </button>
    </div>

    <!-- ÉTAPE 7.3: Zone de saisie avec émojis -->
    <div class="flex gap-2 items-end">
      <!-- Bouton emoji -->
      <button
        @click="showEmojiPicker = !showEmojiPicker"
        class="px-3 py-2 text-gray-600 hover:text-gray-800 relative self-end"
      >
        😊
        <!-- Picker emojis -->
        <div v-if="showEmojiPicker" class="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-3 grid grid-cols-6 gap-2 border z-10">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click.stop="insertEmoji(emoji)"
            class="text-2xl hover:bg-gray-100 p-1 rounded"
          >
            {{ emoji }}
          </button>
        </div>
      </button>

      <!-- ÉTAPE 7.4: Bouton fichier avec drag-and-drop -->
      <label class="px-3 py-2 text-gray-600 hover:text-gray-800 cursor-pointer self-end">
        📎
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          class="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </label>

      <!-- Input texte avec indicateur d'écriture -->
      <textarea
        ref="messageInput"
        v-model="messageText"
        @keydown.enter.exact="sendMessage"
        @input="handleInput"
        placeholder="Tapez un message..."
        rows="1"
        class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary resize-none max-h-32"
      />

      <!-- Bouton envoyer -->
      <button
        @click="sendMessage"
        :disabled="!canSend"
        :class="[
          'px-6 py-2 rounded-lg font-medium transition-all self-end',
          canSend
            ? 'bg-primary text-white hover:bg-opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        Envoyer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  conversationId: String
})

const emit = defineEmits(['messageSent', 'typing'])

const messageText = ref('')
const selectedFile = ref(null)
const showEmojiPicker = ref(false)
const uploadProgress = ref(0)
const messageInput = ref(null)
const fileInput = ref(null)
const typingTimeout = ref(null)

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😢', '🙏', '👏', '✨', '💯', '🙌', '😎', '🥳', '😭', '💪']

const canSend = computed(() => {
  return messageText.value.trim().length > 0 || selectedFile.value !== null
})

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word')) return '📝'
  return '📎'
}

function insertEmoji(emoji) {
  messageText.value += emoji
  showEmojiPicker.value = false
  messageInput.value?.focus()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    console.log('📎 Fichier:', file.name)
  }
}

function cancelFile() {
  selectedFile.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleInput() {
  // Indicateur d'écriture
  emit('typing', true)
  
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    emit('typing', false)
  }, 1000)
  
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

async function sendMessage(e) {
  if (e) e.preventDefault()
  if (!canSend.value || !props.conversationId) return

  const formData = new FormData()
  
  if (messageText.value.trim()) {
    formData.append('content', messageText.value.trim())
  }
  
  if (selectedFile.value) {
    formData.append('media', selectedFile.value)
    uploadProgress.value = 1
  }

  emit('messageSent', formData)

  // Simuler progression upload
  if (selectedFile.value) {
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          uploadProgress.value = 0
        }, 500)
      }
    }, 100)
  }

  // Reset
  messageText.value = ''
  selectedFile.value = null
  showEmojiPicker.value = false
  emit('typing', false)
  
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Auto-focus
watch(() => props.conversationId, () => {
  messageInput.value?.focus()
})
</script>
