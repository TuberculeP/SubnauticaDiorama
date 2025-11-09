<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <h1 class="welcome-title">Architecture 3D</h1>
      <p class="welcome-subtitle">Exploration interactive avec expérience sonore</p>
      
      <div class="loading-section" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
      
      <button 
        v-else
        @click="startExperience" 
        class="start-button"
        :disabled="!allLoaded"
      >
        {{ allLoaded ? 'Commencer' : 'Chargement...' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  start: []
}>()

const isLoading = ref(true)
const allLoaded = ref(false)
const loadingText = ref('Chargement des ressources...')

// Audio files paths (adjust according to your audio files)
const audioFiles = [
  '/audio/floor-0.mp3', // Fondations
  '/audio/floor-1.mp3', // RDC
  '/audio/floor-2.mp3', // Premier étage
  '/audio/floor-3.mp3', // Deuxième étage
  '/audio/floor-4.mp3'  // Terrasse
]

const preloadAudio = async () => {
  try {
    loadingText.value = 'Préchargement audio...'
    
    const audioPromises = audioFiles.map((src, index) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio()
        audio.src = src
        audio.preload = 'auto'
        
        audio.addEventListener('canplaythrough', () => {
          loadingText.value = `Audio chargé ${index + 1}/${audioFiles.length}`
          resolve(audio)
        })
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio: ${src}`)
          resolve(null) // Continue even if some files fail
        })
        
        audio.load()
      })
    })
    
    await Promise.all(audioPromises)
    loadingText.value = 'Prêt !'
    allLoaded.value = true
    
    // Small delay to show "Ready" message
    setTimeout(() => {
      isLoading.value = false
    }, 500)
    
  } catch (error) {
    console.error('Audio preloading failed:', error)
    allLoaded.value = true
    isLoading.value = false
  }
}

const startExperience = () => {
  emit('start')
}

onMounted(() => {
  preloadAudio()
})
</script>

<style scoped>
.welcome-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: 'Aileron', monospace;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.welcome-title {
  font-size: 48px;
  font-weight: bold;
  color: #4a90e2;
  margin-bottom: 16px;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
}

.welcome-subtitle {
  font-size: 18px;
  color: #cccccc;
  margin-bottom: 40px;
  line-height: 1.5;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(74, 144, 226, 0.3);
  border-top: 2px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #4a90e2;
  font-size: 16px;
  margin: 0;
}

.start-button {
  background: transparent;
  border: 2px solid #4a90e2;
  color: #4a90e2;
  font-family: 'Aileron', monospace;
  font-size: 20px;
  font-weight: bold;
  padding: 16px 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.start-button:hover:not(:disabled) {
  background: #4a90e2;
  color: #0a0a0a;
  box-shadow: 0 0 30px rgba(74, 144, 226, 0.6);
  transform: translateY(-2px);
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.start-button:active:not(:disabled) {
  transform: translateY(0);
}
</style>