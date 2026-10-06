import { supabase } from './supabase'
import type { Settings } from '../context/SettingsContext'

export interface SyncState {
  surahId: number     // surah number 1-114
  index: number       // current ayah (0-based)
  positionMs: number  // position inside the current ayah
  playing: boolean
  settings: Settings
}
export function joinRoom(code: string, onState: (p: SyncState) => void) {
  const channel = supabase.channel(`room:${code}`, {
    config: { broadcast: { self: false } },
  })

  let ready = false
  channel
    .on('broadcast', { event: 'state' }, ({ payload }) => onState(payload as SyncState))
    .subscribe((status) => {
      ready = status === 'SUBSCRIBED'
    })

  return {
    send: (p: SyncState) => {
      if (ready) channel.send({ type: 'broadcast', event: 'state', payload: p })
    },
    leave: () => {
      supabase.removeChannel(channel)
    },
  }
}