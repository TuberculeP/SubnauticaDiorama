<template>
  <div ref="container" class="glb-viewer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const container = ref<HTMLDivElement>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let model: THREE.Object3D | null = null

const init = () => {
  if (!container.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(5, 5, 5)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ReinhardToneMapping
  renderer.toneMappingExposure = 1
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // Load GLB model
  const loader = new GLTFLoader()
  loader.load(
    '/src/assets/tout.glb',
    (gltf) => {
      model = gltf.scene
      
      
      scene.add(model)
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      
      // Adjust camera distance based on model size
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      camera.position.setLength(maxDim * 2)
      controls.update()
    },
    (progress) => {
      console.log('Loading progress:', progress.loaded / progress.total * 100 + '%')
    },
    (error) => {
      console.error('Error loading GLB model:', error)
    }
  )

  // Handle resize
  const handleResize = () => {
    if (!container.value) return
    
    camera.aspect = container.value.clientWidth / container.value.clientHeight
    camera.updateProjectionMatrix()
    
    renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  }
  
  window.addEventListener('resize', handleResize)

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (controls) controls.dispose()
  if (renderer) renderer.dispose()
  window.removeEventListener('resize', init)
})
</script>

<style scoped>
.glb-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>