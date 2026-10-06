import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lang } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

export interface Settings {
  bg: string
  textColor: string
  activeColor: string
  fontAr: string
  fontTa: string
  fontEn: string
  fontSize: number
  langs: Record<Lang, boolean>
}

export const DEFAULTS: Settings = {
  bg: '#064e3b',
  textColor: '#d1fae5',
  activeColor: '#fbbf24',
  fontAr: 'Amiri',
  fontTa: 'Noto Sans Tamil',
  fontEn: 'Inter',
  fontSize: 20,
  langs: { ar: true, ta: true, en: true },
}

type Ctx = { s: Settings; update: (p: Partial<Settings>) => void; reset: () => void }
const SettingsCtx = createContext<Ctx | null>(null)
const KEY = 'qp-settings'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()

  const [s, setS] = useState<Settings>(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    } catch {
      return DEFAULTS
    }
  })

  // login pannina user oda saved settings ah load pannu
  useEffect(() => {
    if (!session) return
    supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setS({ ...DEFAULTS, ...data.settings })
      })
  }, [session])

  // local la udane save, Supabase la 800ms maarama irundha save (debounce)
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s))
    if (!session) return
    const t = setTimeout(() => {
      supabase.from('user_settings').upsert({
        user_id: session.user.id,
        settings: s,
        updated_at: new Date().toISOString(),
      })
    }, 800)
    return () => clearTimeout(t)
  }, [s, session])

  const update = (p: Partial<Settings>) => setS((old) => ({ ...old, ...p }))
  const reset = () => setS(DEFAULTS)

  return <SettingsCtx.Provider value={{ s, update, reset }}>{children}</SettingsCtx.Provider>
}

export function useSettings() {
  const c = useContext(SettingsCtx)
  if (!c) throw new Error('useSettings must be used inside SettingsProvider')
  return c
}