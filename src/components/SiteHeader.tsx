import { List } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'

type Props = {
  listOpen?: boolean
  onToggleList?: () => void
}

const HEADER_BUTTON =
  'shrink-0 border-atlas-paper/40 bg-transparent text-atlas-paper hover:bg-atlas-paper/10 hover:text-white'

export default function SiteHeader({ listOpen = false, onToggleList }: Props) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 bg-atlas-ink px-4 text-atlas-paper">
      <div className="min-w-0 leading-tight">
        <h1 className="truncate text-lg font-semibold tracking-wide">Minsyong Cultural Atlas</h1>
        <p className="truncate text-xs text-atlas-paper/70">民雄鐵路高架化</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onToggleList && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={listOpen}
            onClick={onToggleList}
            className={HEADER_BUTTON}
          >
            <List aria-hidden="true" />
            地點清單
          </Button>
        )}
        <Button asChild size="sm" variant="outline" className={HEADER_BUTTON}>
          <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" aria-label="前往大學路官網">
            <span className="sm:hidden" aria-hidden="true">官網</span>
            <span className="hidden sm:inline" aria-hidden="true">前往大學路官網</span>
          </a>
        </Button>
      </div>
    </header>
  )
}
