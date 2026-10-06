import { useEffect, useRef } from 'react'
import type { Line } from '../types'
import { useSettings } from '../context/SettingsContext'

interface Props { lines: Line[]; active: number; onSelect: (index: number) => void }

export default function LyricsView({ lines, active, onSelect }: Props) {
  const { s } = useSettings()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const size = (m: number) => `min(${s.fontSize * m}px, ${6 * m}vw)`

  useEffect(() => {
    refs.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [active])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3 px-3 py-6 sm:px-4">
      {lines.map((l, i) => (
        <button
          key={l.id}
          ref={(el) => { refs.current[i] = el }}
          onClick={() => onSelect(i)}
          style={{ color: i === active ? s.activeColor : s.textColor }}
          className={`w-full rounded-2xl p-3 text-center transition-all duration-300 sm:p-4 ${
            i === active
              ? 'scale-[1.02] bg-white/10 opacity-100 shadow-lg ring-1 ring-white/20'
              : 'opacity-60 hover:opacity-90'
          }`}
        >
          {s.langs.ar && (
            <p dir="rtl" lang="ar" className="leading-loose"
              style={{ fontFamily: s.fontAr, fontSize: size(1.5) }}>{l.ar}</p>
          )}
          {s.langs.ta && l.ta && (
            <p lang="ta" className="mt-2 leading-relaxed"
              style={{ fontFamily: s.fontTa, fontSize: size(1) }}>{l.ta}</p>
          )}
          {s.langs.en && l.en && (
            <p lang="en" className="mt-2 leading-relaxed"
              style={{ fontFamily: s.fontEn, fontSize: size(0.9) }}>{l.en}</p>
          )}
        </button>
      ))}
    </div>
  )
}