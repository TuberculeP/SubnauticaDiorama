<template>
  <div ref="container" class="glb-viewer">
    <div class="floor-controls">
      <button 
        @click="goToNextFloor" 
        :disabled="currentFloor >= maxFloors - 1 || isAnimating"
        class="floor-btn floor-up"
      >
        ↑
      </button>
      <div class="floor-indicator">
        {{ currentFloor + 1 }}/{{ maxFloors }}
      </div>
      <button 
        @click="goToPreviousFloor"
        :disabled="currentFloor <= 0 || isAnimating"
        class="floor-btn floor-down"
      >
        ↓
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

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: CameraControls
let model: THREE.Object3D | null = null

// Floor navigation
const currentFloor = ref(0)
const maxFloors = 5
const isAnimating = ref(false)

// Floor navigation functions
const animateToFloor = async (floor: number) => {
  if (isAnimating.value || floor === currentFloor.value) return
  
  isAnimating.value = true
  currentFloor.value = floor
  
  // Calculate target position based on floor
  const floorHeight = 2 // 2 units per floor, adjust as needed
  const baseY = 5 // Starting Y position
  const targetY = baseY + (floor * floorHeight)
  const currentPos = camera.position.clone()
  const targetPos = new THREE.Vector3(currentPos.x, targetY, currentPos.z)
  
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
      
      // Set initial floor position
      const baseY = 5
      camera.position.y = baseY
      controls.setTarget(0, baseY, 0, false) // Set initial target without animation
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

.floor-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}

.floor-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.floor-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.floor-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.floor-indicator {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  backdrop-filter: blur(10px);
}
</style>