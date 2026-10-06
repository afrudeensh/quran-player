import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getSurah } from '../lib/quran'
import { joinRoom } from '../lib/room'
import { usePlayer } from '../hooks/usePlayer'
import { useSettings } from '../context/SettingsContext'
import LyricsView from '../components/LyricsView'
import PlayerBar from '../components/PlayerBar'
import SettingsPanel from '../components/SettingsPanel'
import type { Line, SurahInfo } from '../types'

export default function Player() {
  const { id } = useParams()
  const code = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), [])
  return <PlayerInner key={id} id={id} code={code} />
}

function PlayerInner({ id, code }: { id?: string; code: string }) {
  const { s } = useSettings()
  const [info, setInfo] = useState<SurahInfo | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [error, setError] = useState('')
  const [panelOpen, setPanelOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const p = usePlayer(lines)
  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null)

  useEffect(() => {
    getSurah(Number(id))
      .then((r) => { setInfo(r.info); setLines(r.lines) })
      .catch((e) => setError(String(e.message ?? e)))
  }, [id])

  useEffect(() => {
    const room = joinRoom(code, () => {})
    roomRef.current = room
    return () => { roomRef.current = null; room.leave() }
  }, [code])

  const push = useCallback(() => {
    if (!info) return
    roomRef.current?.send({
      surahId: info.number,
      index: p.index,
      positionMs: (p.audioRef.current?.currentTime ?? 0) * 1000,
      playing: p.playing,
      settings: s,
    })
  }, [info, p.index, p.playing, p.audioRef, s])

  useEffect(() => {
    push()
    const t = setInterval(push, 1500)
    return () => clearInterval(t)
  }, [push])

  const btn = 'rounded-full bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/20'

  return (
    <div className="relative h-dvh overflow-hidden" style={{ background: s.bg }}>
      <div className="pattern-overlay" />

      <section className={`relative z-10 flex h-full min-h-0 flex-col transition-[padding] duration-300
                           ${panelOpen ? 'lg:pr-80' : ''}`}>
        <header className="px-3 pt-2" style={{ color: s.textColor }}>
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className={btn}>Library</Link>
            <div className="flex gap-2">
              <button onClick={() => setPanelOpen((v) => !v)} className={btn}>
                {panelOpen ? 'Hide panel' : 'Customize'}
              </button>
              <button onClick={() => supabase.auth.signOut()}
                className="rounded-full bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-600">
                Log out
              </button>
            </div>
          </div>
          <h1 className="mt-1 truncate text-center text-sm opacity-90 sm:text-base">
            {info?.number}. {info?.englishName} - Mishary Alafasy
          </h1>
        </header>

        {error && <p className="p-4 text-rose-300">{error}</p>}
        {!error && lines.length === 0 && (
          <p className="p-4" style={{ color: s.textColor }}>Loading...</p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <LyricsView lines={lines} active={p.active} onSelect={p.goTo} />
        </div>
        <PlayerBar lines={lines} player={p} />
      </section>

      <SettingsPanel code={code} open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}