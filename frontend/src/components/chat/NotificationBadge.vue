<template>
  <div v-if="count > 0" class="relative inline-block">
    <span class="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center inline-block">
      {{ displayCount }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 99
  }
})

const displayCount = computed(() => {
  return props.count > props.max ? `${props.max}+` : props.count
})
</script>
