<template>
  <div class="p-4 bg-gray-50 border-t">
    <!-- Réponse citée -->
    <div v-if="replyingTo" class="mb-2 p-3 bg-white rounded-lg border-l-4 border-primary flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs font-semibold text-primary mb-1">
          Répondre à {{ getReplyToSender() }}
        </p>
        <p class="text-sm text-gray-600 truncate">
          {{ replyingTo.content || '📎 Fichier' }}
        </p>
      </div>
      <button @click="$emit('cancelReply')" class="text-gray-400 hover:text-gray-600 ml-2">
        ✕
      </button>
    </div>

    <!-- Mode édition -->
    <div v-if="editingMessage" class="mb-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs font-semibold text-blue-600 mb-1">
          ✏️ Modifier le message
        </p>
        <p class="text-sm text-gray-600 truncate">
          {{ editingMessage.content }}
        </p>
      </div>
      <button @click="$emit('cancelEdit')" class="text-gray-400 hover:text-gray-600 ml-2">
        ✕
      </button>
    </div>

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
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  conversationId: String,
  editingMessage: {
    type: Object,
    default: null
  },
  replyingTo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['messageSent', 'messageEdited', 'typing', 'cancelEdit', 'cancelReply'])

const authStore = useAuthStore()
const messageText = ref('')
const selectedFile = ref(null)
const showEmojiPicker = ref(false)
const uploadProgress = ref(0)
const messageInput = ref(null)
const fileInput = ref(null)
const typingTimeout = ref(null)

const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😢', '🙏', '👏', '✨', '💯', '🙌', '😎', '🥳', '😭', '💪']

const canSend = computed(() => {
  if (props.editingMessage) {
    return messageText.value.trim().length > 0
  }
  // Permettre l'envoi si texte OU fichier
  return messageText.value.trim().length > 0 || selectedFile.value !== null
})

// Remplir le champ si édition
watch(() => props.editingMessage, (msg) => {
  if (msg) {
    messageText.value = msg.content || ''
    selectedFile.value = null
    messageInput.value?.focus()
  }
})

function getReplyToSender() {
  if (!props.replyingTo) return ''
  const sender = props.replyingTo.sender
  const senderId = sender?._id || sender
  if (senderId === authStore.user?._id) return 'vous-même'
  return sender?.username || sender?.firstName || 'Utilisateur'
}

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
  if (!canSend.value) return

  // Mode édition
  if (props.editingMessage) {
    emit('messageEdited', {
      messageId: props.editingMessage._id,
      newContent: messageText.value.trim()
    })
    messageText.value = ''
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
    }
    return
  }

  // Envoi normal
  if (!props.conversationId) return

  const formData = new FormData()
  
  if (messageText.value.trim()) {
    formData.append('content', messageText.value.trim())
  }
  
  if (selectedFile.value) {
    formData.append('media', selectedFile.value)
    uploadProgress.value = 1
  }

  // Ajouter replyTo si présent
  if (props.replyingTo) {
    formData.append('replyTo', props.replyingTo._id)
  }

  emit('messageSent', formData)

  // Fermer mode réponse après envoi
  if (props.replyingTo) {
    emit('cancelReply')
  }

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
