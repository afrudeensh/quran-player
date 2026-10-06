export type Lang = 'ar' | 'ta' | 'en'

export interface Line {
  id: number
  idx: number
  ar: string
  ta: string | null
  en: string | null
  audio: string
}

export interface SurahInfo {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}