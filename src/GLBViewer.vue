<template>
  <div ref="container" class="glb-viewer">
    <!-- Floor Title Overlay -->
    <div class="title-overlay">
      <h1 class="floor-title">
        {{ floorTitles[currentFloor] || `Étage ${currentFloor + 1}` }}
      </h1>
    </div>

    <!-- Navigation Controls -->
    <div class="controls-overlay">
      <button 
        @click="goToNextFloor" 
        :disabled="currentFloor >= maxFloors - 1 || isAnimating"
        class="cyber-btn"
        title="Étage supérieur"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
        </svg>
      </button>
      
      <div class="cyber-indicator">
        {{ currentFloor + 1 }}/{{ maxFloors }}
      </div>
      
      <button 
        @click="goToPreviousFloor"
        :disabled="currentFloor <= 0 || isAnimating"
        class="cyber-btn"
        title="Étage inférieur"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import CameraControls from 'camera-controls'

const container = ref<HTMLDivElement>()

// Define emits
const emit = defineEmits<{
  floorChanged: [floor: number]
}>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: CameraControls
let model: THREE.Object3D | null = null

// Floor navigation
const currentFloor = ref(0)
const maxFloors = 5
const isAnimating = ref(false)

const floorTitles = [
  "Fondations",
  "Rez-de-chaussée", 
  "Premier étage",
  "Deuxième étage",
  "Terrasse"
]

const floorColors = [
  "#1a1a2d", // Fondations - bleu foncé
  "#1a1d2d", // RDC - bleu-violet
  "#1a1a2d", // Premier - bleu marine
  "#1d1a2d", // Deuxième - bleu-violet foncé
  "#1a1f2d"  // Terrasse - bleu gris
]

// Floor navigation functions
const animateToFloor = async (floor: number) => {
  if (isAnimating.value || floor === currentFloor.value) return
  
  isAnimating.value = true
  currentFloor.value = floor
  emit('floorChanged', floor)
  
  // Calculate target position based on floor
  const floorHeight = 2 // 2 units per floor, adjust as needed
  const baseY = 5 // Starting Y position
  const targetY = baseY + (floor * floorHeight)
  const currentPos = camera.position.clone()
  const targetPos = new THREE.Vector3(currentPos.x, targetY, currentPos.z)
  
  // Change page background color with smooth transition
  const body = document.body
  const currentStyle = window.getComputedStyle(body)
  const currentColor = currentStyle.backgroundColor
  const targetColor = floorColors[floor]
  
  // Add CSS transition for smooth color change
  body.style.transition = 'background-color 0.8s ease'
  body.style.backgroundColor = targetColor
  
  // Use camera-controls smooth transition for both position and target
  await Promise.all([
    controls.setPosition(targetPos.x, targetPos.y, targetPos.z, true),
    controls.setTarget(0, targetY, 0, true)
  ])
  
  isAnimating.value = false
}

const goToNextFloor = () => {
  if (currentFloor.value < maxFloors - 1) {
    animateToFloor(currentFloor.value + 1)
  }
}

const goToPreviousFloor = () => {
  if (currentFloor.value > 0) {
    animateToFloor(currentFloor.value - 1)
  }
}

// Handle resize
const handleResize = () => {
  if (!container.value || !camera || !renderer) return
  
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

const init = () => {
  if (!container.value) return

  // Initialize camera-controls with THREE
  CameraControls.install({ THREE })

  // Scene with alpha background
  scene = new THREE.Scene()
  scene.background = null // Transparent background

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(8, 5, 8) // Position décalée à droite

  // Renderer with alpha
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  // Tone mapping pour ajuster les couleurs - réduire l'exposition pour assombrir
  // Options de tone mapping disponibles (décommentez celle que vous voulez tester):
  renderer.toneMapping = THREE.ACESFilmicToneMapping // [ACTUEL] Plus contrasté et plus sombre
  // renderer.toneMapping = THREE.ReinhardToneMapping // [DÉFAUT] Tone mapping standard 
  // renderer.toneMapping = THREE.LinearToneMapping // Pas de tone mapping
  // renderer.toneMapping = THREE.CineonToneMapping // Style cinématographique
  // renderer.toneMapping = THREE.AgXToneMapping // Ton neutre, peu contrasté
  
  // Ajustements d'exposition (plus bas = plus sombre, plus haut = plus clair)
  renderer.toneMappingExposure = 0.6 // Réduit de 1.0 à 0.6 pour assombrir les couleurs
  // Valeurs suggérées à tester : 0.4 (très sombre), 0.6 (sombre), 0.8 (légèrement sombre), 1.0 (normal)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // Camera Controls
  controls = new CameraControls(camera, renderer.domElement)
  controls.dampingFactor = 0.05
  controls.mouseButtons.right = CameraControls.ACTION.NONE // Disable right-click pan
  controls.minPolarAngle = Math.PI / 2 // Lock vertical rotation
  controls.maxPolarAngle = Math.PI / 2 // Lock vertical rotation

  // Load GLB model
  const loader = new GLTFLoader()
  loader.load(
    '/src/assets/tout.glb',
    (gltf) => {
      model = gltf.scene
      
      // Add edge outlines to all meshes and ajust materials for darker colors
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Ajuster les matériaux pour des couleurs plus sombres
          if (child.material) {
            const material = Array.isArray(child.material) ? child.material : [child.material]
            material.forEach((mat: any) => {
              // Assurer que les textures de couleur utilisent sRGB encoding
              if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
              if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace
              if (mat.baseColorTexture) mat.baseColorTexture.colorSpace = THREE.SRGBColorSpace
              
              // Réduire l'intensité des couleurs émissives si présentes
              if (mat.emissive && mat.emissive.isColor) {
                mat.emissive.multiplyScalar(0.5)
              }
              
              // Assombrir légèrement la couleur de base du matériau
              if (mat.color && mat.color.isColor) {
                mat.color.multiplyScalar(0.8) // Réduire de 20% la luminosité
              }
            })
          }

          // Ajouter les contours
          const edges = new THREE.EdgesGeometry(child.geometry)
          const line = new THREE.LineSegments(
            edges, 
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
          )
          line.renderOrder = 1
          child.add(line)
        }
      })
      
      scene.add(model)
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      
      // Adjust camera distance based on model size
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      camera.position.setLength(maxDim * 2)
      
      // Set initial floor position and color
      const baseY = 5
      camera.position.y = baseY
      // Set initial position
      controls.setTarget(0, baseY, 0, false) // Target centered
      camera.position.setLength(maxDim * 2)
      document.body.style.backgroundColor = floorColors[0] // Set initial background color
      controls.update(0.016)
    },
    (progress) => {
      console.log('Loading progress:', progress.loaded / progress.total * 100 + '%')
    },
    (error) => {
      console.error('Error loading GLB model:', error)
    }
  )

  
  window.addEventListener('resize', handleResize)

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate)
    const delta = 0.016 // 60fps
    controls.update(delta)
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
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.glb-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.title-overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
}

.floor-title {
  font-size: 32px;
  font-weight: bold;
  color: #4a90e2;
  font-family: 'Aileron', monospace;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
}

.controls-overlay {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.cyber-btn {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(74, 144, 226, 0.5);
  background: transparent;
  color: #4a90e2;
  border-radius: 2px;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cyber-btn:hover:not(:disabled) {
  border-color: #4a90e2;
  color: #6ba3f5;
  box-shadow: 0 0 15px rgba(74, 144, 226, 0.3);
}

.cyber-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cyber-indicator {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(74, 144, 226, 0.5);
  color: #4a90e2;
  padding: 8px 12px;
  border-radius: 2px;
  min-width: 48px;
  text-align: center;
  font-family: 'Aileron', monospace;
  font-weight: bold;
  font-size: 14px;
  backdrop-filter: blur(8px);
}
</style>