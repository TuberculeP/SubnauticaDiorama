<script setup lang="ts">
import { ref } from 'vue'
import GLBViewer from './GLBViewer.vue'
import FloorDetails from './FloorDetails.vue'

const currentFloor = ref(0)

const handleFloorChanged = (floor: number) => {
  currentFloor.value = floor
}
</script>

<template>
  <div class="app">
    <div class="app-layout">
      <!-- Details Panel -->
      <div class="details-panel">
        <FloorDetails :currentFloor="currentFloor" />
      </div>
      
      <!-- 3D Viewer -->
      <div class="viewer-panel">
        <GLBViewer @floorChanged="handleFloorChanged" />
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
</style>
