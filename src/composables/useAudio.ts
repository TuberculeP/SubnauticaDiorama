import { ref, type Ref } from 'vue'

interface AudioTrack {
  audio: HTMLAudioElement
  src: string
  loaded: boolean
  title: string
}

export function useAudio() {
  const currentTrack: Ref<AudioTrack | null> = ref(null)
  const nextTrack: Ref<AudioTrack | null> = ref(null)
  const isPlaying = ref(false)
  const volume = ref(0.5)
  const isTransitioning = ref(false)
  
  // Audio files for each floor
  const audioSources = [
    {
      src: '/audio/Salutations.mp3',
      title: 'Salutations',
    }, // Fondations
    {
      src: '/audio/Mushroom Forest.mp3',
      title: 'Mushroom Forest',
    },
    {
      src: '/audio/Islands Beneath the Sea.mp3',
      title: 'Islands Beneath the Sea',
    },
    {
      src: '/audio/Lost River.mp3',
      title: 'Lost River',
    },
    {
      src: '/audio/Lava Castle.mp3',
      title: 'Lava Castle',
    },
  ]
  
  const audioTracks: AudioTrack[] = []
  
  // Initialize and preload all audio tracks
  const initializeAudio = async (): Promise<void> => {
    return new Promise((resolve) => {
      let loadedCount = 0
      const totalTracks = audioSources.length
      
      audioSources.forEach((track, index) => {
        const audio = new Audio()
        audio.src = track.src
        audio.preload = 'auto'
        audio.loop = true
        audio.volume = 0
        
        const audioTrack: AudioTrack = {
          audio,
          src: track.src,
          loaded: false,
          title: track.title,
        }
        
        audio.addEventListener('canplaythrough', () => {
          audioTrack.loaded = true
          loadedCount++
          
          if (loadedCount === totalTracks) {
            resolve()
          }
        })
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio track: ${track.src}`)
          audioTrack.loaded = false
          loadedCount++
          
          if (loadedCount === totalTracks) {
            resolve()
          }
        })
        
        audioTracks[index] = audioTrack
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
  
  // Crossfade between two audio tracks
  const crossfade = async (fromTrack: HTMLAudioElement, toTrack: HTMLAudioElement, duration: number = 1000): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 50
      const stepDuration = duration / steps
      let currentStep = 0
      
      const crossfadeInterval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        
        // Fade out current track
        fromTrack.volume = Math.max(0, volume.value * (1 - progress))
        // Fade in new track
        toTrack.volume = Math.min(volume.value, volume.value * progress)
        
        if (currentStep >= steps) {
          fromTrack.volume = 0
          toTrack.volume = volume.value
          fromTrack.pause()
          clearInterval(crossfadeInterval)
          resolve()
        }
      }, stepDuration)
    })
  }

  // Change to a specific floor's music with seamless transition
  const changeTrack = async (floorIndex: number): Promise<void> => {
    if (isTransitioning.value) return
    
    const newTrack = audioTracks[floorIndex]
    if (!newTrack || !newTrack.loaded) {
      console.warn(`Audio track for floor ${floorIndex} not available`)
      return
    }
    
    // Don't transition to the same track
    if (currentTrack.value === newTrack) return
    
    isTransitioning.value = true
    
    try {
      if (currentTrack.value && isPlaying.value) {
        // Prepare new track
        newTrack.audio.currentTime = 0
        newTrack.audio.volume = 0
        await newTrack.audio.play()
        
        // Crossfade from current to new track
        await crossfade(currentTrack.value.audio, newTrack.audio, 1200)
        
        // Update current track reference
        currentTrack.value = newTrack
      } else {
        // No current track, just start the new one
        currentTrack.value = newTrack
        newTrack.audio.currentTime = 0
        newTrack.audio.volume = 0
        
        if (isPlaying.value) {
          await newTrack.audio.play()
          await fadeVolume(newTrack.audio, 0, volume.value, 800)
        }
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
  
  // Preload next track for smoother transitions
  const preloadNextTrack = (currentIndex: number): void => {
    const nextIndex = (currentIndex + 1) % audioTracks.length
    const track = audioTracks[nextIndex]
    if (track && track.loaded) {
      nextTrack.value = track
      // Ensure the track is ready to play
      track.audio.currentTime = 0
      track.audio.volume = 0
    }
  }

  // Enhanced change track with preloading
  const changeTrackSmooth = async (floorIndex: number): Promise<void> => {
    if (isTransitioning.value) return
    
    const newTrack = audioTracks[floorIndex]
    if (!newTrack || !newTrack.loaded) {
      console.warn(`Audio track for floor ${floorIndex} not available`)
      return
    }
    
    // Don't transition to the same track
    if (currentTrack.value === newTrack) return
    
    isTransitioning.value = true
    
    try {
      if (currentTrack.value && isPlaying.value) {
        // Use preloaded track if available, otherwise prepare new track
        const trackToUse = nextTrack.value === newTrack ? nextTrack.value : newTrack
        
        // Prepare new track
        trackToUse.audio.currentTime = 0
        trackToUse.audio.volume = 0
        
        // Start new track without gap
        await trackToUse.audio.play()
        
        // Crossfade from current to new track
        await crossfade(currentTrack.value.audio, trackToUse.audio, 1000)
        
        // Update current track reference
        currentTrack.value = trackToUse
        nextTrack.value = null
        
        // Preload next track for future transitions
        preloadNextTrack(floorIndex)
      } else {
        // No current track, just start the new one
        currentTrack.value = newTrack
        newTrack.audio.currentTime = 0
        newTrack.audio.volume = 0
        
        if (isPlaying.value) {
          await newTrack.audio.play()
          await fadeVolume(newTrack.audio, 0, volume.value, 500)
        }
        
        // Preload next track
        preloadNextTrack(floorIndex)
      }
      
    } catch (error) {
      console.error('Error changing track:', error)
    } finally {
      isTransitioning.value = false
    }
  }

  return {
    currentTrack,
    nextTrack,
    isPlaying,
    volume,
    isTransitioning,
    initializeAudio,
    changeTrack,
    changeTrackSmooth,
    play,
    pause,
    setVolume,
    startWithTrack,
    preloadNextTrack,
    cleanup
  }
}