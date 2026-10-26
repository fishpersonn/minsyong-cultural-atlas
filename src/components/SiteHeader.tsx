import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'

export default function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between gap-3 bg-atlas-ink px-4 text-atlas-paper">
      <h1 className="truncate text-lg font-semibold tracking-wide">民雄鐵路高架化</h1>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="shrink-0 border-atlas-paper/40 bg-transparent text-atlas-paper hover:bg-atlas-paper/10 hover:text-white"
      >
        <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
          前往大學路官網
        </a>
      </Button>
    </header>
  )
}
