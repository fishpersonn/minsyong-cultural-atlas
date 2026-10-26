import { useState } from 'react'
import { ExternalLink, Info, List, Search } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'
import Logo from './Logo'
import SearchBox from './SearchBox'

type Props = {
  listOpen?: boolean
  onToggleList?: () => void
  onOpenAbout?: () => void
  // 點站標與站名：回到最初的畫面（清掉篩選、搜尋、選取，地圖拉回全圖）；沒傳就只是標題
  onHome?: () => void
  // 搜尋框放在標題列裡；沒傳就不顯示
  search?: { query: string; onQuery: (query: string) => void; resultCount?: number }
}

// 窄螢幕只顯示圖示（文字用 sr-only 保留給螢幕閱讀器），寬螢幕顯示圖示加文字
const HEADER_BUTTON =
  'shrink-0 border-atlas-paper/30 bg-transparent px-2 text-atlas-paper hover:bg-atlas-paper/10 hover:text-white sm:px-3'
const LABEL = 'sr-only sm:not-sr-only'

export default function SiteHeader({ listOpen = false, onToggleList, onOpenAbout, onHome, search }: Props) {
  // 手機的標題列放不下搜尋框：點搜尋鈕後，整條標題列換成搜尋框；電腦（md 以上）永遠並排顯示
  const [mobileSearch, setMobileSearch] = useState(false)
  const searching = search !== undefined && (mobileSearch || search.query !== '')

  return (
    <header className="flex h-14 items-center gap-3 border-b-2 border-atlas-amber/70 bg-atlas-ink px-3 text-atlas-paper sm:px-4">
      <h1 className={`min-w-0 md:flex-none ${searching ? 'hidden md:block' : 'block'}`}>
        <button
          type="button"
          onClick={onHome}
          disabled={!onHome}
          title={onHome ? '回到首頁' : undefined}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg text-left outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-atlas-focus disabled:cursor-default disabled:hover:opacity-100"
        >
          <Logo className="hidden size-8 shrink-0 sm:block" />
          <span className="min-w-0 leading-tight">
            <span className="font-title block truncate text-base font-semibold tracking-wide sm:text-lg">
              Minsyong Cultural Atlas
            </span>
            <span className="hidden truncate text-xs text-atlas-paper/70 sm:block">民雄文化地圖</span>
            {onHome && <span className="sr-only">（回到首頁）</span>}
          </span>
        </button>
      </h1>

      {search && (
        <SearchBox
          query={search.query}
          onQuery={search.onQuery}
          resultCount={search.resultCount}
          focusWhen={mobileSearch}
          // 電腦：標題與按鈕之間，不要太寬；手機：沒在搜尋時藏起來，搜尋時佔滿整條
          className={`${searching ? 'flex flex-1' : 'hidden'} md:flex md:max-w-sm md:flex-1 lg:max-w-md`}
        />
      )}

      {searching ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setMobileSearch(false)
            search?.onQuery('')
          }}
          className="shrink-0 text-atlas-paper hover:bg-atlas-paper/10 hover:text-white md:hidden"
        >
          取消
        </Button>
      ) : null}

      <nav
        aria-label="主要功能"
        className={`ml-auto shrink-0 items-center gap-1.5 sm:gap-2 ${searching ? 'hidden md:flex' : 'flex'}`}
      >
        {search && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setMobileSearch(true)}
            className={`${HEADER_BUTTON} md:hidden`}
          >
            <Search aria-hidden="true" />
            <span className="sr-only">搜尋</span>
          </Button>
        )}
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
