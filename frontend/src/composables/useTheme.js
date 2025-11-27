import { ref, watch } from 'vue'

// État partagé entre tous les composants
const isDark = ref(false)
const currentColor = ref('blue')
const isInitialized = ref(false)

const colors = {
  blue: '#075E54',
  purple: '#7C3AED',
  pink: '#EC4899',
  green: '#10B981'
}

// Appliquer le thème au DOM
function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Appliquer la couleur
function applyColor(colorName) {
  if (colors[colorName]) {
    document.documentElement.style.setProperty('--color-primary', colors[colorName])
  }
}

// Initialiser une seule fois
if (!isInitialized.value) {
  const savedTheme = localStorage.getItem('whatsup_theme')
  const savedColor = localStorage.getItem('whatsup_color') || 'blue'
  
  isDark.value = savedTheme === 'dark'
  currentColor.value = savedColor
  
  applyTheme()
  applyColor(savedColor)
  
  isInitialized.value = true
}

// Watcher pour persister les changements
watch(isDark, (newValue) => {
  localStorage.setItem('whatsup_theme', newValue ? 'dark' : 'light')
  applyTheme()
})

watch(currentColor, (newValue) => {
  localStorage.setItem('whatsup_color', newValue)
  applyColor(newValue)
})

export function useTheme() {
  // Initialiser le thème au chargement
  function initTheme() {
    const savedTheme = localStorage.getItem('whatsup_theme')
    const savedColor = localStorage.getItem('whatsup_color') || 'blue'
    
    isDark.value = savedTheme === 'dark'
    currentColor.value = savedColor
    
    applyTheme()
    applyColor(savedColor)
  }

  // Basculer le mode dark/light
  function toggleDarkMode() {
    isDark.value = !isDark.value
  }
  
  // Définir le mode dark directement
  function setDarkMode(value) {
    isDark.value = value
  }

  // Changer la couleur du thème
  function setThemeColor(colorName) {
    if (colors[colorName]) {
      currentColor.value = colorName
    }
  }

  return {
    isDark,
    currentColor,
    colors,
    initTheme,
    toggleDarkMode,
    setDarkMode,
    setThemeColor
  }
}
