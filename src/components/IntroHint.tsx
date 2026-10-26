import { Button } from '@/components/ui/button'

type Props = {
  count: number
  onOpenList: () => void
  onDismiss: () => void
}

export default function IntroHint({ count, onOpenList, onDismiss }: Props) {
  return (
    <section
      aria-label="使用說明"
      className="flex flex-col gap-3 atlas-paper rounded-2xl p-4 text-atlas-ink shadow-xl"
    >
      <p className="text-sm leading-relaxed">
        這是民雄的文化地圖，目前收錄 {count} 個地點。
        <br />
        點地圖上的標記，就能讀那個地方的故事。
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onOpenList}
          className="bg-atlas-teal text-white hover:bg-atlas-ink"
        >
          看地點清單
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDismiss}
          className="border-atlas-ink/30 text-atlas-ink"
        >
          知道了
        </Button>
      </div>
    </section>
  )
}
