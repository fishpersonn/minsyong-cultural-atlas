import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sharePath } from '@/lib/sharePage'

type Props = { id: string; title: string }

// 分享連結不是網址列上的 #p=…，而是建置時產生的 /p/<id>/ 靜態頁：
// 貼到 LINE、Facebook 時，預覽才會是這個地點的標題、摘要與封面圖（真人點開會立刻轉回地圖）。
// 手機（觸控裝置）叫出系統的分享選單；電腦直接複製連結。
export default function ShareButton({ id, title }: Props) {
  const [status, setStatus] = useState<'copied' | 'failed' | null>(null)

  useEffect(() => {
    if (status === null) return
    const timer = setTimeout(() => setStatus(null), 2500)
    return () => clearTimeout(timer)
  }, [status])

  const share = async () => {
    const url = sharePath(new URL(import.meta.env.BASE_URL, window.location.origin).href, id)
    try {
      if (window.matchMedia?.('(pointer: coarse)').matches && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch (error) {
      // 使用者自己關掉分享選單不算失敗
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('failed')
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={share}
        className="border-atlas-ink/30 text-atlas-ink"
      >
        <Share2 aria-hidden="true" />
        分享這個地點
      </Button>
      {status !== null && (
        <span role="status" className="self-center text-xs text-atlas-muted">
          {status === 'copied' ? '已複製連結' : '無法複製，請手動複製網址'}
        </span>
      )}
    </>
  )
}
