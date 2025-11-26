<template>
  <div class="conversation-settings">
    <!-- Header -->
    <div class="settings-header">
      <button class="close-btn" @click="$emit('close')">
        <svg viewBox="0 0 24 24" class="icon">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <h2>Paramètres</h2>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <svg viewBox="0 0 24 24" class="tab-icon">
          <path :d="tab.icon"/>
        </svg>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Content -->
    <div class="settings-content">
      <!-- Info Contact/Groupe -->
      <div v-if="activeTab === 'info'" class="tab-content">
        <div class="contact-header">
          <div class="contact-avatar">
            {{ contact?.name?.[0]?.toUpperCase() || '?' }}
          </div>
          <h3>{{ contact?.name || 'Utilisateur' }}</h3>
          <p class="contact-status">{{ contact?.status || 'En ligne' }}</p>
        </div>

        <div class="info-section">
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">{{ contact?.email || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Téléphone</span>
            <span class="info-value">{{ contact?.phone || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">À propos</span>
            <span class="info-value">{{ contact?.about || 'Pas de description' }}</span>
          </div>
        </div>

        <div class="danger-zone">
          <button class="action-btn" @click="handleArchive">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
            </svg>
            {{ isArchived ? 'Désarchiver' : 'Archiver' }} la conversation
          </button>
          <button class="danger-btn" @click="handleBlock">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
            </svg>
            Bloquer le contact
          </button>
          <button class="danger-btn" @click="handleDeleteConversation">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Supprimer la conversation
          </button>
        </div>
      </div>

      <!-- Recherche -->
      <div v-else-if="activeTab === 'search'" class="tab-content">
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher dans la conversation..."
            @input="searchMessages"
          >
        </div>

        <div class="search-results">
          <div 
            v-for="result in searchResults"
            :key="result._id"
            class="search-result-item"
            @click="scrollToMessage(result._id)"
          >
            <div class="result-content">
              <p class="result-text">{{ highlightText(result.content) }}</p>
              <span class="result-date">{{ formatDate(result.createdAt) }}</span>
            </div>
          </div>
          <div v-if="searchQuery && searchResults.length === 0" class="no-results">
            Aucun résultat trouvé
          </div>
        </div>
      </div>

      <!-- Médias -->
      <div v-else-if="activeTab === 'media'" class="tab-content">
        <div class="media-gallery">
          <div 
            v-for="media in mediaMessages"
            :key="media._id"
            class="media-item"
            @click="openMedia(media)"
          >
            <img 
              v-if="media.media.type === 'image'"
              :src="media.media.url"
              :alt="media.media.filename"
            >
            <div v-else class="video-thumb">
              <video :src="media.media.url"></video>
              <div class="play-overlay">
                <svg viewBox="0 0 24 24" class="play-icon">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          <div v-if="mediaMessages.length === 0" class="no-media">
            Aucun média partagé
          </div>
        </div>
      </div>

      <!-- Fichiers -->
      <div v-else-if="activeTab === 'files'" class="tab-content">
        <div class="files-list">
          <div 
            v-for="file in fileMessages"
            :key="file._id"
            class="file-item"
            @click="downloadFile(file)"
          >
            <div class="file-icon">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div class="file-info">
              <p class="file-name">{{ file.media.filename }}</p>
              <span class="file-size">{{ formatFileSize(file.media.size) }}</span>
            </div>
            <button class="download-btn" @click.stop="downloadFile(file)">
              <svg viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </button>
          </div>
          <div v-if="fileMessages.length === 0" class="no-files">
            Aucun fichier partagé
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  contact: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'scrollToMessage', 'block', 'delete', 'archive'])

const activeTab = ref('info')
const searchQuery = ref('')
const searchResults = ref([])
const allMessages = ref([])
const userId = ref(null)

// Détecter si la conversation est archivée pour cet utilisateur
const isArchived = computed(() => {
  if (!props.conversation || !userId.value) return false
  return props.conversation.archivedBy?.some(id => id === userId.value)
})

const tabs = [
  { 
    id: 'info', 
    label: 'Info',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
  },
  { 
    id: 'search', 
    label: 'Rechercher',
    icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
  },
  { 
    id: 'media', 
    label: 'Médias',
    icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'
  },
  { 
    id: 'files', 
    label: 'Fichiers',
    icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
  }
]

const mediaMessages = computed(() => {
  return allMessages.value.filter(msg => 
    msg.media && (msg.media.type === 'image' || msg.media.type === 'video')
  )
})

const fileMessages = computed(() => {
  return allMessages.value.filter(msg => 
    msg.media && msg.media.type !== 'image' && msg.media.type !== 'video'
  )
})

onMounted(async () => {
  // Charger l'userId depuis le store
  const authStore = useAuthStore()
  userId.value = authStore.user?._id
  
  await loadMessages()
})

async function loadMessages() {
  try {
    const res = await api.get(`/api/messages/${props.conversation._id}`)
    allMessages.value = res.data.data?.messages || []
  } catch (error) {
    console.error('❌ Erreur chargement messages:', error)
  }
}

function searchMessages() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = allMessages.value.filter(msg =>
    msg.content?.toLowerCase().includes(query)
  )
}

function scrollToMessage(messageId) {
  emit('scrollToMessage', messageId)
}

function highlightText(text) {
  if (!searchQuery.value || !text) return text
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function formatDate(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatFileSize(bytes) {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function openMedia(media) {
  window.open(media.media.url, '_blank')
}

function downloadFile(file) {
  const link = document.createElement('a')
  link.href = file.media.url
  link.download = file.media.filename || 'fichier'
  link.click()
}

function handleBlock() {
  if (confirm('Voulez-vous vraiment bloquer ce contact ?')) {
    emit('block', props.contact)
  }
}

function handleArchive() {
  emit('archive', props.conversation)
}

function handleDeleteConversation() {
  if (confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
    emit('delete', props.conversation)
  }
}
</script>

<style scoped>
.conversation-settings {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.close-btn .icon {
  width: 24px;
  height: 24px;
  fill: #666;
}

.settings-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  background: #f0f0f0;
}

.tab.active {
  color: #00a884;
  border-bottom-color: #00a884;
  background: #fff;
}

.tab-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}

.tab-content {
  padding: 20px;
}

/* Info */
.contact-header {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.contact-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 40px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.contact-header h3 {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.contact-status {
  color: #00a884;
  font-size: 14px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: #333;
}

.danger-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #1976d2;
  border-radius: 8px;
  color: #1976d2;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e3f2fd;
}

.action-btn .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.danger-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #d32f2f;
  border-radius: 8px;
  color: #d32f2f;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  background: #ffebee;
}

.danger-btn .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* Search */
.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  fill: #666;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.search-box input:focus {
  border-color: #00a884;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f0f0f0;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}

.result-text {
  flex: 1;
  margin: 0;
  font-size: 14px;
  color: #333;
}

.result-text :deep(mark) {
  background: #fff59d;
  padding: 2px 4px;
  border-radius: 3px;
}

.result-date {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.no-results,
.no-media,
.no-files {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* Media */
.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.media-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.media-item img,
.video-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb {
  position: relative;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}

.play-icon {
  width: 48px;
  height: 48px;
  fill: #fff;
}

/* Files */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: #00a884;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.download-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #e0e0e0;
}

.download-btn svg {
  width: 20px;
  height: 20px;
  fill: #666;
}
</style>
