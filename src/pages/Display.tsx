import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { joinRoom, type SyncState } from '../lib/room'
import { getSurah } from '../lib/quran'
import { useWakeLock } from '../hooks/useWakeLock'
import type { Line } from '../types'

export default function Display() {
  const { code } = useParams()
  const audioRef = useRef<HTMLAudioElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [state, setState] = useState<SyncState | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [started, setStarted] = useState(false) // browsers need one tap before sound
  const [soundOn, setSoundOn] = useState(true)

  useWakeLock(started)

  // join the room
  useEffect(() => {
    if (!code) return
    const room = joinRoom(code, setState)
    return () => { room.leave() }
  }, [code])

  // load the surah when the controller changes it
  const surahId = state?.surahId
  useEffect(() => {
    if (!surahId) return
    getSurah(surahId).then((r) => setLines(r.lines)).catch(console.error)
  }, [surahId])

  // keep this device's audio in sync with the controller
  useEffect(() => {
    const a = audioRef.current
    if (!a || !state) return
    const line = lines[state.index]
    if (!line || !started || !soundOn) { a.pause(); return }
    if (a.dataset.url !== line.audio) {
      a.dataset.url = line.audio
      a.src = line.audio
      a.load()
    }
    if (Math.abs(a.currentTime * 1000 - state.positionMs) > 700) {
      a.currentTime = state.positionMs / 1000
    }
    if (state.playing) a.play().catch(() => {})
    else a.pause()
  }, [state, lines, started, soundOn])

  const active = state?.index ?? 0
  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [active, lines])

  function start() {
    setStarted(true)
    document.documentElement.requestFullscreen?.()?.catch(() => {})
  }

  const s = state?.settings

  if (!s) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-emerald-950 p-6 text-center text-white">
        <p className="text-2xl">Waiting for controller...</p>
        <p className="mt-2 font-mono text-xl tracking-widest">{code}</p>
        <p className="mt-4 text-sm opacity-70">Open a surah on the player page and keep it open</p>
      </div>
    )
  }

  return (
    <div className="relative h-dvh overflow-y-auto" style={{ background: s.bg }}>
      <audio ref={audioRef} preload="auto" />

      {!started && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
          <button onClick={start}
            className="rounded-full bg-amber-400 px-10 py-5 text-2xl font-bold text-black">
            Tap to start
          </button>
        </div>
      )}

      <button onClick={() => setSoundOn((v) => !v)}
        className="fixed right-3 top-3 z-20 rounded-full bg-black/40 px-4 py-2 text-sm text-white">
        {soundOn ? 'Sound on' : 'Lyrics only'}
      </button>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-[40dvh]">
        {lines.map((l, i) => (
          <div key={l.id}
            ref={(el) => { itemRefs.current[i] = el }}
            style={{ color: i === active ? s.activeColor : s.textColor }}
            className={`rounded-2xl p-4 text-center transition-all duration-500 ${
              i === active ? 'scale-105 bg-white/10 opacity-100' : 'opacity-40'
            }`}>
            {s.langs.ar && (
              <p dir="rtl" lang="ar" className="leading-loose"
                style={{ fontFamily: s.fontAr, fontSize: s.fontSize * 2 }}>{l.ar}</p>
            )}
            {s.langs.ta && l.ta && (
              <p lang="ta" className="mt-2 leading-relaxed"
                style={{ fontFamily: s.fontTa, fontSize: s.fontSize * 1.4 }}>{l.ta}</p>
            )}
            {s.langs.en && l.en && (
              <p lang="en" className="mt-2 leading-relaxed"
                style={{ fontFamily: s.fontEn, fontSize: s.fontSize * 1.2 }}>{l.en}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}