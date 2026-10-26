import { useCallback, useState } from 'react'

const KEY = 'atlas-intro-dismissed'

// localStorage 在隱私模式或被封鎖時可能丟錯，讀寫都要容錯；失敗時只是每次都顯示說明
function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function useIntroDismissed(): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(read)
  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // 忽略：本次瀏覽仍然會隱藏
    }
  }, [])
  return [dismissed, dismiss]
}
