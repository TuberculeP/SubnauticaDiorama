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
  caption?: string
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

// Explications de 5 biomes Subnautica
// - Surface
// - Grottes Champignons
// - Grand Récif
// - Rivière Perdue
// - Zone de Lave
const floorsData: FloorData[] = [
  {
    title: "Surface",
    subtitle: "Îles et structures alien",
    explanations: `
      <h3>Éléments marquants</h3>
      <p>La surface est majoritairement vide à l'exception de deux grandes îles sur lesquelles le joueur explore des anciennes bases humaines, un portail mystérieux et aussi une immense structure alien.</p>
      <p>Cette structure est au centre de l'histoire du jeu : il s'agit d'un moyen de confinement planétaire (d'où l'énorme canon laser) que le joueur doit désactiver avant de pouvoir s'enfuir.</p>
      <p>‎</p>
      <h3>Technique utilisée</h3>
      <p>L'île et la montagne est générée en "paint" avec une brush épaisse, puis plus fine pour dégrossir. Pas de technique particulière sur les couleurs.</p>
      <p>La structure alien est conçue à partir de blocs bruts les uns sur les autres (sauf pour la partie canon faite vox par vox).
      <p>C'est sur cet étage que j'ai commencé à expérimenter les lumières.</p>
    `,
    references: [
      { url: "./references/surface/1.jpg" },
      { url: "./references/surface/2.webp" },
    ],
    renders: [
      { url: "./renders/surface/1.png" },
      { url: "./renders/surface/2.png" },
      { url: "./renders/surface/3.png" },
    ]
  },
  {
    title: "Grottes Champignons",
    subtitle: "Première grande caverne",
    explanations: `
      <h3>Éléments marquants</h3>
      <p>La première grande caverne est une des plus grandes cavernes de Subnautica. On y accède par un réseau de tunnels dès les premières heures du jeu.</p>
      <p>Cette caverne est remplie de champignons avec peu de végétation autour. On y trouve des serpents géants se cachant dans les champignons qui leur sert de nid.</p>
      <p>On y trouve aussi la première base humaine abandonnée.</p>
      <p>‎</p>
      <h3>Technique utilisée</h3>
      <p>Les murs et reliefs de la caverne sont également paint. Les coraux au mur sont faits avec un pattern disque 2d et les champignons sont faits main comme la base et le serpent puis utilisés comme pattern.</p>
      <p>C'est dans ce biome que je me suis vraiment amusé à la bioluminescence, ce qui a donné lieu à beaucoup de temps alloué à l'équilibrage des couleurs. On remarque sur le modèle brut des contrastes étranges mais qui prennent leur sens au render</p>
    `,
    references: [
        { url: "./references/mushroom/1.webp" },
        { url: "./references/mushroom/2.jpg" },
        { url: "./references/mushroom/3.webp" },
        { url: "./references/mushroom/4.jpg" },
    ],
    renders: [
      { url: "./renders/mushroom/1.png" },
      { url: "./renders/mushroom/2.png" },
      { url: "./renders/mushroom/3.png" },
      { url: "./renders/mushroom/4.png" },
      { url: "./renders/mushroom/5.png" },
      { url: "./renders/mushroom/6.png" },
    ]
  },
  {
    title: "Grand Récif",
    subtitle: "Biome vaste et sombre",
    explanations: `
      <h3>Éléments marquants</h3>
      <p>Un des biomes les plus verticaux du jeu. Il est parsemé de grandes plantes bioluminescentes en forme de boule qui semblent remplies d'air, retenu par des lianes.</p>
      <p>On trouve peu de vie dans ce biome (ou galère à faire). J'ai préféré illustrer le Cyclops, le plus gros vaisseau constructible du jeu, pour une échelle de taille.</p>
      <p>‎</p>
      <h3>Technique utilisée</h3>
      <p>La technique ici est semblable, l'idée majeure est de pouvoir faire une bioluminescence qui rende quand même un environnement sombre</p>
      <p>Le biome fait plus décor "boîte" que les précédents pour illustrer le côté vaste réseau de grottes et laisser de la place au Cyclops modélisé à la main.</p>
      <p>Les recherches de référence pour le cyclops m'a fait me rendre compte que quand on ne trouve pas de résultat pour "XXX Voxel" on en trouve toujours pour "XXX Minecraft" !</p>
    `,
    references: [
      { url: "./references/reef/1.png" },
      { url: "./references/reef/2.jpg" },
      { url: "./references/reef/3.webp" },
      { url: "./references/reef/4.webp" },
      { url: "./references/reef/5.jpg" },
    ],
    renders: [
      { url: "./renders/reef/1.png" },
      { url: "./renders/reef/2.png" },
      { url: "./renders/reef/3.png" },
    ]
  },
  {
    title: "Rivière Perdue",
    subtitle: "Le grand souterrain",
    explanations: `
      <h3>Éléments marquants</h3>
      <p>La rivière perdue est un biome long et étrange. Elle est composée de plusieurs sous-biomes que j'ai mélangé ici.</p>
      <p>On y trouve la fameuse rivière, inspirée des vraies rivières sous-marines, d'un squelette d'une créature géante, et notamment du grand arbre, lieu de gestation des léviathans de la région.</p>
      <p>‎</p>
      <h3>Technique utilisée</h3>
      <p>Le plus compliqué dans ce biome est la réalisation de l'arbre, 100% fait main avec patience et douleur.</p>
      <p>La rivière m'a aussi donné quelques sueurs à l'équilibrage des lumières. Le jeu ici est de donner cette impression de rivière vaporeuse. J'ai réussi à faire ça avec le material Glass + densité avec de l'emissive plus puissant en dessous.</p>
      `,
    references: [
      { url: "./references/river/1.jpg" },
      { url: "./references/river/2.webp" },
      { url: "./references/river/3.jpg" },
      { url: "./references/river/4.jpg" },
      { url: "./references/river/5.jepg" },
    ],
    renders: [
      { url: "./renders/river/1.png" },
      { url: "./renders/river/2.png" },
      { url: "./renders/river/3.png" },
    ]
  },
  {
    title: "Zone de Lave",
    subtitle: "La Fin",
    explanations: `
      <h3>Éléments marquants</h3>
      <p>La zone de lave est le dernier biome du jeu. Il ne contient que peu d'éléments marquants en comparaison de sa taille.</p>
      <p>J'y représente ici le générateur d'énergie thermique alien.</p>
      <p>‎</p>
      <h3>Technique utilisée</h3>
      <p>Mélange de toutes les techniques utilisées précédemment.</p>
      <p>Le plus de temps passé a été sur l'équilibre des lumières pour une lave brillante mais des murs peu éclairés.</p>
      <p>Il était prévu initialement que la zone de lave soit une zone de transition vers un ultime biome mais par manque de temps et par volonté de mettre en scène ce voxel sur ce site, c'est l'ultime biome réalisé.</p>
    `,
    references: [
      { url: "./references/lava/1.jpg" },
      { url: "./references/lava/2.webp" },
      { url: "./references/lava/3.png" },
    ],
    renders: [
      { url: "./renders/lava/1.png" },
      { url: "./renders/lava/2.png" },
    ]
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
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  max-width: 100%;
  max-height: 85vh;
  width: auto;
  height: auto;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-image {
    max-height: 80vh;
  }
  
  .modal-close {
    font-size: 28px;
    width: 36px;
    height: 36px;
    top: 8px;
    right: 8px;
  }
  
  .image-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-height: 600px) {
  .modal-image {
    max-height: 75vh;
  }
}
</style>