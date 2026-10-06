import { useCallback, useEffect, useRef, useState } from 'react'
import type { Line } from '../types'

export function usePlayer(lines: Line[]) {
  // two audio players: one plays while the other preloads the next ayah
  const [D] = useState(() => {
    const a = [new Audio(), new Audio()]
    a.forEach((x) => { x.preload = 'auto' })
    return a
  })
  const audioRef = useRef<HTMLAudioElement | null>(D[0]) // always the active player
  const slots = useRef<(number | null)[]>([null, null])  // which ayah each player holds
  const cur = useRef(0)
  const indexRef = useRef(0)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [range, setRange] = useState<[number, number] | null>(null)

  const linesRef = useRef(lines)
  linesRef.current = lines
  const rangeRef = useRef(range)
  rangeRef.current = range

  const nextOf = useCallback((i: number): number | null => {
    const r = rangeRef.current
    const n = r && i >= r[1] ? r[0] : i + 1
    return n < linesRef.current.length ? n : null
  }, [])

  const prepare = useCallback((k: number, i: number | null) => {
    if (i === null) return
    const line = linesRef.current[i]
    if (!line || slots.current[k] === i) return
    D[k].src = line.audio
    D[k].load()
    slots.current[k] = i
  }, [D])

  const activate = useCallback((i: number, play: boolean) => {
    if (!linesRef.current[i]) return
    let k = slots.current.indexOf(i)
    if (k === -1) { k = 1 - cur.current; prepare(k, i) }
    const prevK = cur.current
    cur.current = k
    audioRef.current = D[k]
    if (prevK !== k) D[prevK].pause()
    D[k].currentTime = 0
    indexRef.current = i
    setIndex(i)
    setProgress(0)
    if (play) D[k].play().catch(() => setPlaying(false))
    prepare(1 - k, nextOf(i))            // preload the following ayah
  }, [D, prepare, nextOf])

  // events from both players
  useEffect(() => {
    const onPlay = (e: Event) => { if (e.target === D[cur.current]) setPlaying(true) }
    const onPause = (e: Event) => {
      const a = e.target as HTMLAudioElement
      if (a === D[cur.current] && !a.ended) setPlaying(false)
    }
    const onTime = (e: Event) => {
      const a = e.target as HTMLAudioElement
      if (a === D[cur.current]) setProgress(a.duration ? a.currentTime / a.duration : 0)
    }
    const onEnd = (e: Event) => {
      if (e.target !== D[cur.current]) return
      const n = nextOf(indexRef.current)
      if (n === null) { setPlaying(false); return }
      activate(n, true)
    }
    D.forEach((a) => {
      a.addEventListener('play', onPlay)
      a.addEventListener('pause', onPause)
      a.addEventListener('timeupdate', onTime)
      a.addEventListener('ended', onEnd)
    })
    return () => {
      D.forEach((a) => {
        a.removeEventListener('play', onPlay)
        a.removeEventListener('pause', onPause)
        a.removeEventListener('timeupdate', onTime)
        a.removeEventListener('ended', onEnd)
        a.pause()                        // stop sound when leaving the page
      })
    }
  }, [D, activate, nextOf])

  // surah loaded: start playing from ayah 1 automatically
  useEffect(() => {
    if (lines.length === 0) return
    slots.current = [null, null]
    cur.current = 0
    audioRef.current = D[0]
    activate(0, true)
  }, [lines, D, activate])

  // repeat range changed: preload the correct next ayah
  useEffect(() => {
    prepare(1 - cur.current, nextOf(indexRef.current))
  }, [range, prepare, nextOf])

  const toggle = useCallback(() => {
    const a = D[cur.current]
    if (a.paused) a.play().catch(console.error)
    else a.pause()
  }, [D])

  const goTo = useCallback((i: number) => activate(i, true), [activate])

  return { audioRef, index, active: index, playing, progress, range, setRange, toggle, goTo }
}