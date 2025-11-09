import { ref, type Ref } from 'vue'

interface AudioTrack {
  audio: HTMLAudioElement
  src: string
  loaded: boolean
}

export function useAudio() {
  const currentTrack: Ref<AudioTrack | null> = ref(null)
  const isPlaying = ref(false)
  const volume = ref(0.5)
  const isTransitioning = ref(false)
  
  // Audio files for each floor
  const audioSources = [
    '/audio/Salutations.mp3', // Fondations
    '/audio/Mushroom Forest.mp3', // RDC
    '/audio/floor-2.mp3', // Premier étage
    '/audio/floor-3.mp3', // Deuxième étage
    '/audio/floor-4.mp3'  // Terrasse
  ]
  
  const audioTracks: AudioTrack[] = []
  
  // Initialize and preload all audio tracks
  const initializeAudio = async (): Promise<void> => {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalTracks = audioSources.length
      
      audioSources.forEach((src, index) => {
        const audio = new Audio()
        audio.src = src
        audio.preload = 'auto'
        audio.loop = true
        audio.volume = 0
        
        const track: AudioTrack = {
          audio,
          src,
          loaded: false
        }
        
        audio.addEventListener('canplaythrough', () => {
          track.loaded = true
          loadedCount++
          
          if (loadedCount === totalTracks) {
            resolve()
          }
        })
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio track: ${src}`)
          track.loaded = false
          loadedCount++
          
          if (loadedCount === totalTracks) {
            resolve()
          }
        })
        
        audioTracks[index] = track
        audio.load()
      })
    })
  }
  
  // Smooth volume transition
  const fadeVolume = (audio: HTMLAudioElement, fromVolume: number, toVolume: number, duration: number = 1000): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 20
      const stepDuration = duration / steps
      const volumeStep = (toVolume - fromVolume) / steps
      let currentStep = 0
      
      const fadeInterval = setInterval(() => {
        currentStep++
        const newVolume = fromVolume + (volumeStep * currentStep)
        audio.volume = Math.max(0, Math.min(1, newVolume))
        
        if (currentStep >= steps) {
          audio.volume = toVolume
          clearInterval(fadeInterval)
          resolve()
        }
      }, stepDuration)
    })
  }
  
  // Change to a specific floor's music
  const changeTrack = async (floorIndex: number): Promise<void> => {
    if (isTransitioning.value) return
    
    const newTrack = audioTracks[floorIndex]
    if (!newTrack || !newTrack.loaded) {
      console.warn(`Audio track for floor ${floorIndex} not available`)
      return
    }
    
    isTransitioning.value = true
    
    try {
      // If there's a current track playing, fade it out
      if (currentTrack.value && isPlaying.value) {
        await fadeVolume(currentTrack.value.audio, volume.value, 0, 800)
        currentTrack.value.audio.pause()
      }
      
      // Set new track
      currentTrack.value = newTrack
      newTrack.audio.currentTime = 0
      newTrack.audio.volume = 0
      
      // Start playing and fade in
      if (isPlaying.value) {
        await newTrack.audio.play()
        await fadeVolume(newTrack.audio, 0, volume.value, 800)
      }
      
    } catch (error) {
      console.error('Error changing track:', error)
    } finally {
      isTransitioning.value = false
    }
  }
  
  // Start playing current track
  const play = async (): Promise<void> => {
    if (!currentTrack.value || !currentTrack.value.loaded) return
    
    try {
      isPlaying.value = true
      await currentTrack.value.audio.play()
      await fadeVolume(currentTrack.value.audio, 0, volume.value, 500)
    } catch (error) {
      console.error('Error playing audio:', error)
      isPlaying.value = false
    }
  }
  
  // Pause current track
  const pause = async (): Promise<void> => {
    if (!currentTrack.value || !isPlaying.value) return
    
    await fadeVolume(currentTrack.value.audio, volume.value, 0, 500)
    currentTrack.value.audio.pause()
    isPlaying.value = false
  }
  
  // Set volume (0 to 1)
  const setVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    if (currentTrack.value && isPlaying.value) {
      currentTrack.value.audio.volume = volume.value
    }
  }
  
  // Start with first track
  const startWithTrack = async (floorIndex: number = 0): Promise<void> => {
    await changeTrack(floorIndex)
    await play()
  }
  
  // Cleanup
  const cleanup = (): void => {
    audioTracks.forEach(track => {
      if (track.audio) {
        track.audio.pause()
        track.audio.src = ''
        track.audio.load()
      }
    })
    audioTracks.length = 0
    currentTrack.value = null
    isPlaying.value = false
  }
  
  return {
    currentTrack,
    isPlaying,
    volume,
    isTransitioning,
    initializeAudio,
    changeTrack,
    play,
    pause,
    setVolume,
    startWithTrack,
    cleanup
  }
}