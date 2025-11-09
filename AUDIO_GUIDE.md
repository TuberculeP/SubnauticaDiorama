# Guide du Système Audio

## 🎵 Fonctionnalités Implémentées

### ✅ Écran d'Accueil
- **Bouton "Commencer"** pour démarrer l'expérience audio
- **Préchargement automatique** des 5 pistes audio
- **Indicateur de progression** du chargement
- **First interaction** nécessaire pour l'autoplay (conformité navigateurs)

### ✅ Système Audio Avancé
- **5 pistes audio** (une par étage)
- **Transitions fluides** (fade in/out 800ms)
- **Gestion d'erreurs** robuste
- **Volume optimisé** (30% par défaut)
- **Mode loop** pour chaque piste

### ✅ Navigation Interactive
- **Changement automatique** de musique selon l'étage
- **Indicateur audio** en temps réel
- **États visuels** : "En cours", "Transition...", "Pause"

## 🎧 Comment Utiliser

### 1. Préparation Audio
Placez vos fichiers MP3 dans `/public/audio/` :
```
public/audio/
├── floor-0.mp3  (Fondations)
├── floor-1.mp3  (Rez-de-chaussée)  
├── floor-2.mp3  (Premier étage)
├── floor-3.mp3  (Deuxième étage)
└── floor-4.mp3  (Terrasse)
```

### 2. Expérience Utilisateur
1. **Chargement** → L'app précharge automatiquement tous les audios
2. **Écran d'accueil** → Bouton "Commencer" visible quand tout est prêt  
3. **Navigation** → Chaque changement d'étage = nouvelle musique
4. **Transitions** → Fade out ancien + fade in nouveau (800ms)

## ⚙️ Configuration Technique

### Volume et Paramètres
```typescript
// Dans useAudio.ts
const volume = ref(0.3)        // Volume par défaut 30%
const fadeVolume = 800         // Durée transition (ms)
const audio.loop = true        // Lecture en boucle
```

### Customisation
- **Modifier durée transitions** → `fadeVolume` dans `useAudio.ts`
- **Ajuster volume** → `volume.value` 
- **Changer fichiers audio** → Remplacer dans `/public/audio/`
- **Ajouter étages** → Modifier `audioSources` array

## 🔧 Fichiers Créés

- `src/WelcomeScreen.vue` - Écran d'accueil avec préchargement
- `src/composables/useAudio.ts` - Système de gestion audio complet  
- `public/audio/` - Dossier pour vos fichiers MP3
- Audio de test silencieux créés automatiquement

## 🚀 Prêt à Utiliser !

Le système est entièrement fonctionnel avec des fichiers audio de test silencieux. Remplacez simplement les fichiers MP3 dans `/public/audio/` par vos vraies musiques pour une expérience immersive complète !

**Navigation** : Boutons ↑/↓ changent étage ET musique automatiquement ! 🎭🎵