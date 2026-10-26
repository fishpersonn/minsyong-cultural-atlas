import { useCallback, useEffect, useState } from 'react'
import { buildHash, parseHash } from '../lib/hash'

export function useSelectedId(): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(() =>
    parseHash(window.location.hash),
  )

  useEffect(() => {
    const sync = () => setId(parseHash(window.location.hash))
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const select = useCallback((next: string | null) => {
    const hash = buildHash(next)
    if (hash !== window.location.hash) {
      window.history.pushState(
        null,
        '',
        window.location.pathname + window.location.search + hash,
      )
    }
    setId(next)
  }, [])

  return [id, select]
}
