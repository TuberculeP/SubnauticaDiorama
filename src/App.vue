<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GLBViewer from './GLBViewer.vue'
import FloorDetails from './FloorDetails.vue'
import WelcomeScreen from './WelcomeScreen.vue'
import { useAudio } from './composables/useAudio'

const currentFloor = ref(0)
const showWelcome = ref(true)
const audioReady = ref(false)

// Initialize audio system
const { 
  initializeAudio, 
  changeTrackSmooth, 
  startWithTrack, 
  cleanup,
  isPlaying,
  currentTrack,
  isTransitioning 
} = useAudio()

const handleFloorChanged = async (floor: number) => {
  currentFloor.value = floor
  
  // Change music track if audio is ready
  if (audioReady.value) {
    await changeTrackSmooth(floor)
  }
}

const startExperience = async () => {
  try {
    // Start with first floor music
    await startWithTrack(0)
    audioReady.value = true
    showWelcome.value = false
  } catch (error) {
    console.error('Failed to start audio experience:', error)
    // Continue without audio
    showWelcome.value = false
  }
}

onMounted(async () => {
  // Initialize audio system
  try {
    await initializeAudio()
  } catch (error) {
    console.error('Audio initialization failed:', error)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="app">
    <!-- Welcome Screen -->
    <WelcomeScreen 
      v-if="showWelcome" 
      @start="startExperience" 
    />
    
    <!-- Main Application -->
    <div v-else class="app-layout">
      <!-- Details Panel -->
      <div class="details-panel">
        <FloorDetails :currentFloor="currentFloor" />
      </div>
      
      <!-- 3D Viewer -->
      <div class="viewer-panel">
        <GLBViewer @floorChanged="handleFloorChanged" />
        
        <!-- Audio Controls (optional) -->
        <div class="audio-controls" v-if="audioReady">
          <div class="audio-status">
            <span v-if="isTransitioning">♫ Transition...</span>
            <span v-else-if="isPlaying">♫ {{currentTrack?.title}}</span>
            <span v-else>♫ Pause</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
}

.app-layout {
  display: flex;
  height: 100%;
}

.details-panel {
  width: 40%;
  flex-shrink: 0;
}

.viewer-panel {
  width: 60%;
  position: relative;
}

.audio-controls {
  position: absolute;
  bottom: 24px;
  left: 24px;
  z-index: 10;
}

.audio-status {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(74, 144, 226, 0.3);
  color: #4a90e2;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Aileron', monospace;
  font-size: 12px;
  backdrop-filter: blur(8px);
}
</style>
