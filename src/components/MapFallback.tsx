import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'

export type FallbackReason = 'unsupported' | 'load-failed'

const COPY: Record<FallbackReason, { title: string; body: string }> = {
  unsupported: {
    title: '你的瀏覽器不支援互動地圖',
    body: '請改用較新的瀏覽器，或直接到大學路官網閱讀這些文章。',
  },
  'load-failed': {
    title: '互動地圖暫時無法載入',
    body: '請檢查網路連線後重新整理頁面，或直接到大學路官網閱讀這些文章。',
  },
}

export default function MapFallback({ reason }: { reason: FallbackReason }) {
  const { title, body } = COPY[reason]
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-atlas-hover px-6 text-center text-atlas-ink">
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-xs text-sm text-atlas-muted">{body}</p>
      <Button asChild>
        <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
          前往大學路官網
        </a>
      </Button>
    </div>
  )
}
