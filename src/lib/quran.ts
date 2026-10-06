import type { Line, SurahInfo } from '../types'

const BASE = 'https://api.alquran.cloud/v1'
export const RECITER = 'ar.alafasy' // Mishary Alafasy

interface ApiAyah { number: number; text: string; audio?: string }
interface ApiEdition extends SurahInfo { edition: { identifier: string }; ayahs: ApiAyah[] }

export async function getSurahList(): Promise<SurahInfo[]> {
  const r = await fetch(`${BASE}/surah`)
  if (!r.ok) throw new Error('Could not load surah list')
  return (await r.json()).data
}

export async function getSurah(n: number) {
  const r = await fetch(`${BASE}/surah/${n}/editions/quran-uthmani,ta.tamil,en.sahih,${RECITER}`)
  if (!r.ok) throw new Error('Could not load surah ' + n + ' (status ' + r.status + ')')
  const data: ApiEdition[] = (await r.json()).data
  const pick = (id: string) => data.find((d) => d.edition.identifier === id)
  const ar = pick('quran-uthmani')!
  const ta = pick('ta.tamil')
  const en = pick('en.sahih')
  const au = pick(RECITER)!

  const lines: Line[] = ar.ayahs.map((a, i) => ({
    id: a.number,
    idx: i,
    ar: a.text,
    ta: ta?.ayahs[i]?.text ?? null,
    en: en?.ayahs[i]?.text ?? null,
    audio: au.ayahs[i].audio ?? '',
  }))
  return { info: ar as SurahInfo, lines }
}