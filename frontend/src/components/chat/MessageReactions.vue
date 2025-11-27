<template>
  <div class="flex flex-wrap gap-1 mt-1 relative">
    <!-- Réactions existantes -->
    <button
      v-for="(reaction, idx) in groupedReactions"
      :key="idx"
      @click="toggleReaction(reaction.emoji)"
      :class="[
        'px-2.5 py-1 rounded-full text-sm flex items-center gap-1.5 transition-all font-medium',
        reaction.hasUserReacted 
          ? 'bg-primary bg-opacity-20 border border-primary text-primary' 
          : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
      ]"
    >
      <span class="text-base leading-none">{{ reaction.emoji }}</span>
      <span class="text-xs font-semibold leading-none">{{ reaction.count }}</span>
    </button>

    <!-- Bouton ajouter réaction -->
    <div class="relative">
      <button
        @click="togglePicker"
        class="px-2.5 py-1 rounded-full text-sm bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-all"
        title="Ajouter une réaction"
      >
        <span class="text-base leading-none">➕</span>
      </button>

      <!-- Picker emojis -->
      <Teleport to="body">
        <div 
          v-if="showEmojiPicker" 
          :style="{
            position: 'fixed',
            top: pickerPosition.y + 'px',
            left: pickerPosition.x + 'px',
            transform: 'translate(-50%, calc(-100% - 8px))'
          }"
          class="z-50 bg-white shadow-xl rounded-lg p-2 flex gap-1 border border-gray-200"
          @click.stop
          ref="pickerRef"
        >
          <button
            v-for="emoji in quickEmojis"
            :key="emoji"
            @click="addReaction(emoji)"
            class="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
            :title="emoji"
          >
            {{ emoji }}
          </button>
        </div>
      </Teleport>
    </div>
    
    <!-- Overlay pour fermer le picker -->
    <div 
      v-if="showEmojiPicker"
      @click="showEmojiPicker = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../store/auth'
import api from '../../services/api'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reactionUpdated'])

const authStore = useAuthStore()
const showEmojiPicker = ref(false)
const pickerPosition = ref({ x: 0, y: 0 })
const pickerRef = ref(null)
const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']

// Calculer la position du picker
function togglePicker(event) {
  if (!showEmojiPicker.value) {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // Positionner au-dessus du bouton, centré
    pickerPosition.value = {
      x: rect.left + (rect.width / 2),
      y: rect.top
    }
  }
  
  showEmojiPicker.value = !showEmojiPicker.value
}

const groupedReactions = computed(() => {
  if (!props.message.reactions || props.message.reactions.length === 0) {
    return []
  }

  const grouped = {}
  props.message.reactions.forEach(reaction => {
    const emoji = reaction.emoji
    if (!grouped[emoji]) {
      grouped[emoji] = {
        emoji,
        count: 0,
        users: [],
        hasUserReacted: false
      }
    }
    grouped[emoji].count++
    grouped[emoji].users.push(reaction.user)
    
    const userId = authStore.user?._id
    if (reaction.user === userId || reaction.user?._id === userId) {
      grouped[emoji].hasUserReacted = true
    }
  })

  return Object.values(grouped)
})

async function addReaction(emoji) {
  try {
    showEmojiPicker.value = false
    await api.post(`/api/messages/${props.message._id}/reaction`, { emoji })
    console.log('✅ Réaction ajoutée:', emoji)
    emit('reactionUpdated')
  } catch (error) {
    console.error('❌ Erreur ajout réaction:', error.response?.data || error.message)
  }
}

async function toggleReaction(emoji) {
  const group = groupedReactions.value.find(r => r.emoji === emoji)
  
  if (group?.hasUserReacted) {
    // Retirer la réaction
    try {
      await api.delete(`/api/messages/${props.message._id}/reaction`, { data: { emoji } })
      console.log('✅ Réaction retirée:', emoji)
      emit('reactionUpdated')
    } catch (error) {
      console.error('❌ Erreur retrait réaction:', error.response?.data || error.message)
    }
  } else {
    // Ajouter la réaction
    await addReaction(emoji)
  }
}
</script>
