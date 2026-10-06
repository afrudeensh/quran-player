import type { Line } from '../types'
import type { usePlayer } from '../hooks/usePlayer'

type Props = { lines: Line[]; player: ReturnType<typeof usePlayer> }

export default function PlayerBar({ lines, player: p }: Props) {
  const last = Math.max(lines.length - 1, 0)
  const on = p.range !== null
  const from = p.range?.[0] ?? 0
  const to = p.range?.[1] ?? 0
  const pill = 'h-11 rounded-full bg-white/10 px-4 text-sm transition hover:bg-white/20 sm:text-base'

  return (
    <div className="border-t border-white/10 bg-black/35 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white backdrop-blur-md">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="w-24 shrink-0 text-center">Ayah {p.index + 1}/{lines.length}</span>
          <input type="range" min={0} max={last} value={p.index}
            onChange={(e) => p.goTo(Number(e.target.value))} className="w-full accent-amber-400" />
        </div>

        <div className="h-1 w-full overflow-hidden rounded bg-white/20">
          <div className="h-full bg-amber-400" style={{ width: `${p.progress * 100}%` }} />
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button onClick={() => p.goTo(Math.max(p.index - 1, 0))} className={pill}>Prev</button>
          <button onClick={p.toggle}
            className="h-12 min-w-24 rounded-full bg-amber-400 px-6 font-bold text-black shadow-lg">
            {p.playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => p.goTo(Math.min(p.index + 1, last))} className={pill}>Next</button>
          <button
            onClick={() => (on ? p.setRange(null) : p.setRange([p.index, p.index]))}
            className={`${pill} ${on ? '!bg-amber-400 font-semibold text-black' : ''}`}>
            {on ? 'Repeat: ON' : 'Repeat'}
          </button>
        </div>

        {on && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span>Repeat ayah</span>
            <select value={from}
              onChange={(e) => p.setRange([Number(e.target.value), Math.max(to, Number(e.target.value))])}
              className="rounded bg-white/15 p-1">
              {lines.map((_, i) => <option key={i} value={i} className="text-black">{i + 1}</option>)}
            </select>
            <span>to</span>
            <select value={to}
              onChange={(e) => p.setRange([Math.min(from, Number(e.target.value)), Number(e.target.value)])}
              className="rounded bg-white/15 p-1">
              {lines.map((_, i) => <option key={i} value={i} className="text-black">{i + 1}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}