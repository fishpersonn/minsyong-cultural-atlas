import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'

export default function MapFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#eef1ee] px-6 text-center text-[#14313b]">
      <p className="text-lg font-medium">你的瀏覽器不支援互動地圖</p>
      <p className="max-w-xs text-sm text-[#5b6770]">
        請改用較新的瀏覽器，或直接到大學路官網閱讀這些文章。
      </p>
      <Button asChild>
        <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
          前往大學路官網
        </a>
      </Button>
    </div>
  )
}
