'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Plays a hidden looping <audio> element as a normal ambient soundtrack —
 * NOT locked to scroll position. Muted by default (autoplay-with-sound is
 * blocked by every browser anyway); a caller-rendered toggle button flips
 * `muted` after a real user gesture, which is what the browser actually
 * requires to allow audio, and kicks off playback at that point. Once
 * playing, it just loops continuously at 1x speed regardless of scroll —
 * previously this was hard-synced to scroll progress (reseeking
 * `currentTime` every scroll tick, pausing on idle); that's been dropped
 * in favor of plain background-music behavior per user request.
 *
 * `sync(progress)` is kept as a no-op with the same signature so the
 * call sites in HeroCanvas.tsx/AtelierFilm.tsx (wired into every
 * draw-frame path — live scroll, momentum coast, initial mount) don't need
 * touching; it simply does nothing now.
 */
export function useScrubAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.muted = true
    audio.preload = 'auto'
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [src])

  // No-op — kept only so existing call sites (draw/onUpdate/coast) don't
  // need to change. Audio playback is no longer driven by scroll progress.
  const sync = useCallback((_progress: number) => {}, [])

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const next = !m
      const audio = audioRef.current
      if (audio) {
        audio.muted = next
        if (!next && audio.paused) audio.play().catch(() => {})
      }
      return next
    })
  }, [])

  return { sync, muted, toggleMuted }
}
