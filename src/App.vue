<script setup lang="ts">
import GLBViewer from './GLBViewer.vue'
</script>

<template>
  <div class="app">
    <main class="app-main">
      <GLBViewer />
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
}

.app-header p {
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.app-main {
  flex: 1;
  overflow: hidden;
}
</style>
