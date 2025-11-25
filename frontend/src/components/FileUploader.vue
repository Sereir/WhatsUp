<template>
  <div class="file-uploader">
    <!-- Hidden File Input -->
    <input 
      ref="fileInput"
      type="file" 
      :accept="accept"
      @change="handleFileSelect"
      class="hidden"
    />
    
    <!-- Drag and Drop Zone -->
    <div 
      v-if="!file"
      @click="openFilePicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition',
        isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
      ]"
    >
      <div class="text-4xl mb-2">📎</div>
      <p class="text-gray-600">Cliquez ou glissez-déposez un fichier</p>
      <p class="text-sm text-gray-500 mt-1">{{ acceptText }}</p>
    </div>
    
    <!-- File Preview -->
    <div v-if="file" class="bg-gray-100 rounded-lg p-4">
      <div class="flex items-center gap-4">
        <!-- Image Preview -->
        <img 
          v-if="preview && fileType === 'image'" 
          :src="preview" 
          class="w-20 h-20 object-cover rounded"
        />
        <!-- File Icon -->
        <div 
          v-else 
          class="w-20 h-20 bg-gray-300 rounded flex items-center justify-center text-3xl"
        >
          {{ getFileIcon(file.type) }}
        </div>
        
        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate">{{ file.name }}</p>
          <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
        </div>
        
        <!-- Remove Button -->
        <button 
          @click="removeFile"
          class="text-red-500 hover:text-red-700 text-xl"
        >
          ✕
        </button>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="progress > 0 && progress < 100" class="mt-3">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-1 text-center">{{ progress }}%</p>
      </div>
      
      <!-- Upload Complete -->
      <div v-if="progress === 100" class="mt-3 text-green-600 text-center">
        ✓ Upload terminé
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  accept: {
    type: String,
    default: '*'
  },
  acceptText: {
    type: String,
    default: 'Tous types de fichiers'
  },
  modelValue: {
    type: File,
    default: null
  },
  progress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'fileSelected'])

const fileInput = ref(null)
const file = ref(props.modelValue)
const preview = ref(null)
const isDragging = ref(false)

const fileType = computed(() => {
  if (!file.value) return null
  if (file.value.type.startsWith('image/')) return 'image'
  if (file.value.type.startsWith('video/')) return 'video'
  if (file.value.type.startsWith('audio/')) return 'audio'
  return 'file'
})

watch(() => props.modelValue, (newVal) => {
  file.value = newVal
})

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    processFile(selectedFile)
  }
}

function handleDrop(event) {
  isDragging.value = false
  const droppedFile = event.dataTransfer.files[0]
  if (droppedFile) {
    processFile(droppedFile)
  }
}

function processFile(selectedFile) {
  file.value = selectedFile
  emit('update:modelValue', selectedFile)
  emit('fileSelected', selectedFile)
  
  // Create preview for images
  if (selectedFile.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
    }
    reader.readAsDataURL(selectedFile)
  } else {
    preview.value = null
  }
}

function removeFile() {
  file.value = null
  preview.value = null
  emit('update:modelValue', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
  return '📎'
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>
