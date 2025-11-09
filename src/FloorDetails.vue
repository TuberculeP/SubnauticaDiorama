<template>
  <div class="floor-details-container">
    <!-- Floor Title -->
    <div class="floor-title">
      <h2 class="floor-title-main">
        {{ floorData?.title || `Étage ${currentFloor + 1}` }}
      </h2>
      <p class="floor-title-sub">
        {{ floorData?.subtitle || 'Détails du niveau' }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { 'tab-active': activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="content-container">
      <!-- Explanations Tab -->
      <div v-if="activeTab === 'explanations'" class="content-section">
        <div v-html="floorData?.explanations || 'Aucune explication disponible pour cet étage.'" 
             class="explanations-content">
        </div>
      </div>

      <!-- References Tab -->
      <div v-if="activeTab === 'references'" class="content-section">
        <div class="image-grid">
          <div 
            v-for="(image, index) in floorData?.references || []"
            :key="index"
            @click="openModal(image)"
            class="image-item"
          >
            <img :src="image.url" :alt="image.caption" />
          </div>
        </div>
        <div v-if="!floorData?.references?.length" class="empty-message">
          Aucune référence disponible pour cet étage.
        </div>
      </div>

      <!-- Renders Tab -->
      <div v-if="activeTab === 'renders'" class="content-section">
        <div class="image-grid">
          <div 
            v-for="(image, index) in floorData?.renders || []"
            :key="index"
            @click="openModal(image)"
            class="image-item"
          >
            <img :src="image.url" :alt="image.caption" />
          </div>
        </div>
        <div v-if="!floorData?.renders?.length" class="empty-message">
          Aucun rendu disponible pour cet étage.
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="modalImage" @click="closeModal" class="modal-overlay">
      <div class="modal-content">
        <img :src="modalImage.url" :alt="modalImage.caption" class="modal-image" />
        <div class="modal-caption">
          <p>{{ modalImage.caption }}</p>
        </div>
        <button @click="closeModal" class="modal-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface FloorImage {
  url: string
  caption: string
}

interface FloorData {
  title: string
  subtitle: string
  explanations: string
  references: FloorImage[]
  renders: FloorImage[]
}

const props = defineProps<{
  currentFloor: number
}>()

const activeTab = ref('explanations')
const modalImage = ref<FloorImage | null>(null)

const tabs = [
  { id: 'explanations', label: 'Explications' },
  { id: 'references', label: 'Références' },
  { id: 'renders', label: 'Renders' }
]

// Mock data - à remplacer par vos vraies données
const floorsData: FloorData[] = [
  {
    title: "Fondations",
    subtitle: "Base structurelle",
    explanations: `
      <h3>Concept architectural</h3>
      <p>Les fondations représentent l'ancrage de notre structure dans l'environnement. Cette base massive en béton armé assure la stabilité de l'ensemble tout en créant une transition harmonieuse avec le sol.</p>
      
      <h3>Matériaux</h3>
      <ul>
        <li>Béton armé haute performance</li>
        <li>Isolation thermique périphérique</li>
        <li>Étanchéité membranaire</li>
      </ul>
    `,
    references: [
      { url: "/api/placeholder/400/400", caption: "Référence architecturale 1" },
      { url: "/api/placeholder/400/400", caption: "Référence architecturale 2" }
    ],
    renders: [
      { url: "/api/placeholder/400/400", caption: "Rendu technique des fondations" },
      { url: "/api/placeholder/400/400", caption: "Vue en coupe" }
    ]
  },
  {
    title: "Rez-de-chaussée",
    subtitle: "Espaces publics",
    explanations: `
      <h3>Espaces de vie</h3>
      <p>Le rez-de-chaussée accueille les espaces communs et les zones d'accueil. Large hall d'entrée, espaces de circulation fluides et ouvertures généreuses sur l'extérieur.</p>
      
      <h3>Fonctionnalités</h3>
      <ul>
        <li>Hall d'accueil double hauteur</li>
        <li>Espaces de co-working</li>
        <li>Zone de restauration</li>
      </ul>
    `,
    references: [
      { url: "/api/placeholder/400/400", caption: "Inspiration hall moderne" },
      { url: "/api/placeholder/400/400", caption: "Espaces de co-working" }
    ],
    renders: [
      { url: "/api/placeholder/400/400", caption: "Vue intérieure hall" },
      { url: "/api/placeholder/400/400", caption: "Perspective extérieure" }
    ]
  },
  {
    title: "Premier étage",
    subtitle: "Espaces de travail",
    explanations: `
      <h3>Bureaux modulaires</h3>
      <p>Espaces de travail flexibles adaptables selon les besoins. Cloisons modulaires, éclairage naturel optimisé et zones de détente intégrées.</p>
    `,
    references: [],
    renders: []
  },
  {
    title: "Deuxième étage",
    subtitle: "Espaces techniques",
    explanations: `
      <h3>Infrastructure technique</h3>
      <p>Niveau dédié aux équipements techniques et aux systèmes de climatisation. Accès facilité pour la maintenance.</p>
    `,
    references: [],
    renders: []
  },
  {
    title: "Terrasse",
    subtitle: "Espace extérieur",
    explanations: `
      <h3>Toiture végétalisée</h3>
      <p>Espace de détente en hauteur avec vue panoramique. Intégration d'éléments végétaux et zones de repos.</p>
    `,
    references: [],
    renders: []
  }
]

const floorData = computed(() => floorsData[props.currentFloor] || null)

const openModal = (image: FloorImage) => {
  modalImage.value = image
}

const closeModal = () => {
  modalImage.value = null
}

// Reset to explanations tab when floor changes
watch(() => props.currentFloor, () => {
  activeTab.value = 'explanations'
})
</script>

<style scoped>
.floor-details-container {
  height: 100%;
  border-right: 1px solid rgba(74, 144, 226, 0.3);
  display: flex;
  flex-direction: column;
  font-family: 'Aileron', monospace;
}

.floor-title {
  padding: 24px;
  border-bottom: 1px solid rgba(74, 144, 226, 0.3);
}

.floor-title-main {
  font-size: 24px;
  font-weight: bold;
  color: #4a90e2;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.floor-title-sub {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.tabs-container {
  display: flex;
  border-bottom: 1px solid rgba(74, 144, 226, 0.3);
}

.tab-btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  color: #666;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Aileron', monospace;
}

.tab-btn:hover {
  color: #6ba3f5;
  border-bottom-color: rgba(74, 144, 226, 0.5);
}

.tab-active {
  color: #00e6c7 !important;
  border-bottom-color: #4a90e2 !important;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-section {
  height: 100%;
}

.explanations-content {
  color: #cccccc;
  line-height: 1.6;
}

.explanations-content h3 {
  color: #4a90e2;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 24px;
}

.explanations-content h3:first-child {
  margin-top: 0;
}

.explanations-content p {
  margin-bottom: 16px;
}

.explanations-content ul {
  padding-left: 20px;
  margin-bottom: 16px;
}

.explanations-content li {
  margin-bottom: 8px;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.image-item {
  aspect-ratio: 1;
  background: #2d2d2d;
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-item:hover {
  border-color: #4a90e2;
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.image-item:hover img {
  transform: scale(1.05);
}

.empty-message {
  color: #666;
  text-align: center;
  padding: 32px;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-content {
  position: relative;
  max-width: 80vw;
  max-height: 80vh;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 16px;
}

.modal-caption p {
  color: white;
  text-align: center;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #4a90e2;
}
</style>