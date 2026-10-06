import { useSettings } from '../context/SettingsContext'
import type { Lang } from '../types'
import ConnectDevice from './ConnectDevice'

const AR = ['Amiri', 'Noto Naskh Arabic']
const TA = ['Noto Sans Tamil', 'Hind Madurai']
const EN = ['Inter', 'Merriweather']

function ColorRow({ label, value, onChange }:
  { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-14 cursor-pointer rounded" />
    </label>
  )
}

function FontRow({ label, value, options, onChange }:
  { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded border p-1">
        {options.map((f) => <option key={f}>{f}</option>)}
      </select>
    </label>
  )
}

interface Props { code: string; open: boolean; onClose: () => void }

export default function SettingsPanel({ code, open, onClose }: Props) {
  const { s, update, reset } = useSettings()
  const langs: [Lang, string][] = [['ar', 'Arabic'], ['ta', 'Tamil'], ['en', 'English']]

  return (
    <>
      {/* dark backdrop, phones only */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        inert={!open}
        className={`fixed right-0 top-0 z-40 h-dvh w-80 max-w-[88vw] space-y-3 overflow-y-auto
          rounded-l-2xl bg-white p-4 pb-10 text-sm text-slate-800 shadow-2xl
          transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-800">Customize</h2>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200">
            Hide
          </button>
        </div>

        <ColorRow label="Background" value={s.bg} onChange={(v) => update({ bg: v })} />
        <ColorRow label="Text color" value={s.textColor} onChange={(v) => update({ textColor: v })} />
        <ColorRow label="Active line" value={s.activeColor} onChange={(v) => update({ activeColor: v })} />

        <FontRow label="Arabic font" value={s.fontAr} options={AR} onChange={(v) => update({ fontAr: v })} />
        <FontRow label="Tamil font" value={s.fontTa} options={TA} onChange={(v) => update({ fontTa: v })} />
        <FontRow label="English font" value={s.fontEn} options={EN} onChange={(v) => update({ fontEn: v })} />

        <label className="block">
          Font size: {s.fontSize}px
          <input type="range" min={14} max={48} value={s.fontSize} className="w-full"
            onChange={(e) => update({ fontSize: Number(e.target.value) })} />
        </label>

        <fieldset className="flex flex-wrap gap-4">
          {langs.map(([k, name]) => (
            <label key={k} className="flex items-center gap-1">
              <input type="checkbox" checked={s.langs[k]}
                onChange={(e) => update({ langs: { ...s.langs, [k]: e.target.checked } })} />
              {name}
            </label>
          ))}
        </fieldset>

        <button onClick={reset} className="rounded bg-slate-200 px-3 py-1">Reset</button>
        <ConnectDevice code={code} />
      </aside>
    </>
  )
}