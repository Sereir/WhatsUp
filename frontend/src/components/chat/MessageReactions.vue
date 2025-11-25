<template>
  <div class="flex flex-wrap gap-1 mt-1">
    <!-- Réactions existantes -->
    <button
      v-for="(reaction, idx) in groupedReactions"
      :key="idx"
      @click="toggleReaction(reaction.emoji)"
      :class="[
        'px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all',
        reaction.hasUserReacted 
          ? 'bg-primary bg-opacity-20 border border-primary' 
          : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
      ]"
    >
      <span>{{ reaction.emoji }}</span>
      <span class="font-semibold">{{ reaction.count }}</span>
    </button>

    <!-- Bouton ajouter réaction -->
    <button
      @click="showEmojiPicker = !showEmojiPicker"
      class="px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-all"
    >
      ➕
    </button>

    <!-- Picker emojis -->
    <div v-if="showEmojiPicker" class="absolute z-10 bg-white shadow-lg rounded-lg p-2 flex gap-1 mt-8 border">
      <button
        v-for="emoji in quickEmojis"
        :key="emoji"
        @click="addReaction(emoji)"
        class="text-xl hover:bg-gray-100 p-1 rounded"
      >
        {{ emoji }}
      </button>
    </div>
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
const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏']

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
