<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style>
html,body,#app{height:100%;margin:0;font-family:Inter,Arial}

:root {
  --color-primary: #075E54;
}
</style>
