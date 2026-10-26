import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  count: number
  onOpenList: () => void
  onDismiss: () => void
}

// 第一次進來的提示：只放一句話、一句關於標記數字的說明、一個主要按鈕，不跟地圖搶視覺焦點。
// 想知道更多的人看「關於」；按右上角的 × 之後（會記住）就不再出現。
export default function IntroHint({ count, onOpenList, onDismiss }: Props) {
  return (
    <section
      aria-label="使用說明"
      className="atlas-paper relative flex flex-col gap-1.5 rounded-2xl p-3.5 pr-12 text-atlas-ink shadow-xl"
    >
      <p className="font-title text-[15px] leading-snug font-semibold">從地圖開始探索民雄的故事</p>
      <p className="text-xs leading-relaxed text-atlas-body">數字表示這個區域有多個地點，點一下就會放大。</p>
      <div className="mt-1.5 flex">
        <Button
          type="button"
          size="sm"
          onClick={onOpenList}
          className="bg-atlas-teal text-white hover:bg-atlas-ink"
        >
          瀏覽 {count} 個地點
        </Button>
      </div>
      <button
        type="button"
        aria-label="知道了"
        title="知道了，不再顯示"
        onClick={onDismiss}
        className="absolute top-1 right-1 flex size-11 cursor-pointer items-center justify-center rounded-full text-atlas-muted outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus sm:size-9"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </section>
  )
}
