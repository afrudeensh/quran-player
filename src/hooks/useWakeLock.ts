import { useEffect } from 'react'

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch {
        // support illati or battery saver la fail aagum, ignore
      }
    }

    request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release()
    }
  }, [active])
}