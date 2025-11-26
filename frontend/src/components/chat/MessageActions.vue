<template>
  <Teleport to="body">
    <div 
      v-if="isVisible"
      class="message-actions-overlay"
      @click="close"
    >
      <div 
        class="message-actions-menu"
        :style="menuStyle"
        @click.stop
      >
        <!-- Réactions rapides -->
        <div class="quick-reactions">
          <button
            v-for="emoji in quickEmojis"
            :key="emoji"
            class="reaction-btn"
            @click="handleReaction(emoji)"
            :title="`Réagir avec ${emoji}`"
          >
            {{ emoji }}
          </button>
        </div>

        <div class="actions-divider"></div>

        <!-- Actions principales -->
        <div class="actions-list">
          <button 
            v-if="canReply"
            class="action-item"
            @click="handleReply"
          >
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
            </svg>
            <span>Répondre</span>
          </button>

          <button 
            v-if="message.content"
            class="action-item"
            @click="handleCopy"
          >
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>Copier</span>
          </button>

          <button 
            v-if="message.media?.url"
            class="action-item"
            @click="handleDownload"
          >
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Télécharger</span>
          </button>

          <button 
            v-if="canEdit"
            class="action-item"
            @click="handleEdit"
          >
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            <span>Modifier</span>
          </button>

          <button 
            v-if="canDelete"
            class="action-item delete-action"
            @click="confirmDelete('all')"
          >
            <svg viewBox="0 0 24 24" class="action-icon">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/services/api'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'reply', 'edit', 'delete', 'reaction'])

const authStore = useAuthStore()
const isVisible = ref(true)

const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']

// Permissions
const isOwnMessage = computed(() => {
  const senderId = props.message.sender?._id || props.message.sender
  return senderId === authStore.user?._id
})

const canEdit = computed(() => {
  return isOwnMessage.value && props.message.content && !props.message.media
})

const canDelete = computed(() => isOwnMessage.value)

const canDeleteForAll = computed(() => {
  return isOwnMessage.value
})

const canReply = computed(() => true)

// Positionnement du menu
const menuStyle = computed(() => {
  const { x, y } = props.position
  const style = { position: 'fixed' }
  
  // Vérifier si assez d'espace en bas
  const spaceBelow = window.innerHeight - y
  if (spaceBelow > 400) {
    style.top = `${y}px`
  } else {
    style.bottom = `${window.innerHeight - y}px`
  }
  
  // Vérifier si assez d'espace à droite
  const spaceRight = window.innerWidth - x
  if (spaceRight > 250) {
    style.left = `${x}px`
  } else {
    style.right = `${window.innerWidth - x}px`
  }
  
  return style
})

// Actions
function close() {
  isVisible.value = false
  emit('close')
}

async function handleReaction(emoji) {
  try {
    await api.post(`/api/messages/${props.message._id}/reaction`, { emoji })
    emit('reaction', { messageId: props.message._id, emoji })
    close()
  } catch (error) {
    console.error('❌ Erreur réaction:', error)
  }
}

function handleReply() {
  emit('reply', props.message)
  close()
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    close()
  } catch (error) {
    console.error('❌ Erreur copie:', error)
  }
}

function handleDownload() {
  if (props.message.media?.url) {
    const link = document.createElement('a')
    link.href = props.message.media.url
    link.download = props.message.media.filename || 'fichier'
    link.click()
  }
  close()
}

function handleEdit() {
  emit('edit', props.message)
  close()
}

async function confirmDelete(type) {
  console.log('Message ID:', props.message._id)
  
  try {
    console.log('📤 Envoi DELETE à l\'API...')
    const response = await api.delete(`/api/messages/${props.message._id}`, {
      data: { deleteForEveryone: type === 'all' }
    })
    console.log('✅ Réponse API:', response.data)
    
    emit('delete', { messageId: props.message._id, deleteForEveryone: type === 'all' })
    console.log('📨 Événement delete émis')
    
    close()
  } catch (error) {
    console.error('❌ ERREUR:', error)
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    alert('Erreur: ' + (error.response?.data?.message || error.message))
  }
}

</script>

<style scoped>
.message-actions-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}

.message-actions-menu {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 240px;
  max-width: 280px;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.quick-reactions {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
}

.reaction-btn {
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reaction-btn:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.actions-divider {
  height: 1px;
  background: #e0e0e0;
}

.actions-list {
  padding: 8px 0;
}

.action-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
  position: relative;
}

.action-item:hover {
  background: #f5f5f5;
}

.action-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-left: auto;
}

.delete-action {
  color: #d32f2f;
}
</style>
