import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'

export default function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between gap-3 bg-[#14313b] px-4 text-[#f4f6f3]">
      <h1 className="truncate text-lg font-semibold tracking-wide">民雄鐵路高架化</h1>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="shrink-0 border-[#f4f6f3]/40 bg-transparent text-[#f4f6f3] hover:bg-[#f4f6f3]/10 hover:text-white"
      >
        <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
          前往大學路官網
        </a>
      </Button>
    </header>
  )
}
