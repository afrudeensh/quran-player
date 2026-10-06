import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getSurahList } from '../lib/quran'
import type { SurahInfo } from '../types'

export default function Library() {
  const [surahs, setSurahs] = useState<SurahInfo[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getSurahList().then(setSurahs).catch((e) => setError(String(e.message ?? e)))
  }, [])

  return (
    <div className="app-bg min-h-dvh">
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Quran</h1>
            <p className="text-sm text-amber-300">114 Surahs - Arabic, Tamil, English</p>
          </div>
          <button onClick={() => supabase.auth.signOut()}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600">
            Log out
          </button>
        </div>
        {error && <p className="text-rose-300">{error}</p>}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.map((s) => (
            <li key={s.number}>
              <Link to={`/player/${s.number}`}
                className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 shadow
                           transition hover:-translate-y-0.5 hover:shadow-lg">
                <div>
                  <p className="font-semibold text-emerald-800">{s.number}. {s.englishName}</p>
                  <p className="text-xs text-slate-500">
                    {s.englishNameTranslation} - {s.numberOfAyahs} ayahs
                  </p>
                </div>
                <span lang="ar" className="text-xl text-emerald-700" style={{ fontFamily: 'Amiri' }}>
                  {s.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}