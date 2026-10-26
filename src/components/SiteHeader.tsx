import { ExternalLink, Info, List } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'
import Logo from './Logo'

type Props = {
  listOpen?: boolean
  onToggleList?: () => void
  onOpenAbout?: () => void
}

// 窄螢幕只顯示圖示（文字用 sr-only 保留給螢幕閱讀器），寬螢幕顯示圖示加文字
const HEADER_BUTTON =
  'shrink-0 border-atlas-paper/30 bg-transparent px-2 text-atlas-paper hover:bg-atlas-paper/10 hover:text-white sm:px-3'
const LABEL = 'sr-only sm:not-sr-only'

export default function SiteHeader({ listOpen = false, onToggleList, onOpenAbout }: Props) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b-2 border-atlas-amber/70 bg-atlas-ink px-3 text-atlas-paper sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Logo className="hidden size-8 shrink-0 sm:block" />
        <div className="min-w-0 leading-tight">
          <h1 className="font-title truncate text-base font-semibold tracking-wide sm:text-lg">
            Minsyong Cultural Atlas
          </h1>
          <p className="hidden truncate text-xs text-atlas-paper/70 sm:block">民雄文化地圖</p>
        </div>
      </div>
      <nav aria-label="主要功能" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
            <span className={LABEL}>地點清單</span>
          </Button>
        )}
        {onOpenAbout && (
          <Button type="button" size="sm" variant="outline" onClick={onOpenAbout} className={HEADER_BUTTON}>
            <Info aria-hidden="true" />
            <span className={LABEL}>關於</span>
          </Button>
        )}
        <Button asChild size="sm" variant="outline" className={HEADER_BUTTON}>
          <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            <span className={LABEL}>前往大學路官網</span>
          </a>
        </Button>
      </nav>
    </header>
  )
}
