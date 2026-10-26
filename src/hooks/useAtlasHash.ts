import { useCallback, useEffect, useState } from 'react'
import { buildHash, parseHash, type HashState } from '../lib/hash'

// 畫面狀態（選取的地點、篩選、搜尋）與網址 hash 同步。
// 選取地點用 pushState（上一頁可回到前一個地點）；只改篩選或搜尋時用 replaceState，不灌歷史紀錄。
export function useAtlasHash(): [HashState, (patch: Partial<HashState>) => void] {
  const [state, setState] = useState<HashState>(() => parseHash(window.location.hash))

  useEffect(() => {
    const sync = () => setState(parseHash(window.location.hash))
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const update = useCallback((patch: Partial<HashState>) => {
    // 以網址為準合併，連續呼叫也不會互相蓋掉
    const next = { ...parseHash(window.location.hash), ...patch }
    const hash = buildHash(next)
    if (hash !== window.location.hash) {
      const selectionChanged = next.id !== parseHash(window.location.hash).id
      const url = window.location.pathname + window.location.search + hash
      if (selectionChanged) window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
    }
    setState(next)
  }, [])

  return [state, update]
}
