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
        這裡標著 {count} 個地點，也標著歲月與情感。
        <br />
        隨便點一個標記，聽聽這片土地的聲音。
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
