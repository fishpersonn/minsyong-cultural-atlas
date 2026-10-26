// 注意：JSX 裡中文句子換行會變成一個空白，段落文字請維持在同一行，不要折行
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { OFFICIAL_SITE_URL } from '@/constants'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeCount: number
  themeCount: number
}

const REPO_URL = 'https://github.com/fishpersonn/minsyong-cultural-atlas'

const LINK = 'font-medium text-atlas-teal underline underline-offset-2 hover:text-atlas-ink'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-title text-base font-semibold">{title}</h3>
      {children}
    </section>
  )
}

export default function AboutDialog({ open, onOpenChange, placeCount, themeCount }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-ink/60 motion-safe:animate-in motion-safe:fade-in" />
        <Dialog.Content
          className="atlas-paper fixed inset-x-3 top-1/2 z-50 mx-auto flex max-h-[85dvh] max-w-xl -translate-y-1/2 flex-col overflow-hidden rounded-2xl text-atlas-ink shadow-2xl outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95"
        >
          <div className="flex items-start justify-between gap-3 border-b border-atlas-ink/10 px-5 py-4">
            <div>
              <Dialog.Title className="font-title text-xl font-semibold">嗨，歡迎來民雄走走</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-atlas-muted">
                Minsyong Cultural Atlas・民雄文化地圖
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                size="icon"
                aria-label="關閉"
                className="size-9 shrink-0 rounded-full bg-atlas-ink/80 text-atlas-paper hover:bg-atlas-ink"
              >
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-4 text-sm leading-relaxed text-atlas-body">
            <Section title="為什麼有這張地圖">
              <p>民雄是嘉義的一個小鄉鎮，有老車站、農會倉庫、廟宇，也有在這裡住了一輩子的人。中正大學的「重構大學路計畫」這幾年一直在記錄這些，寫了好多文章。</p>
              <p>可惜文章散在官網各處，很難知道哪一篇發生在哪條街上。所以我把它們一篇一篇標回地圖上，放回它們發生的地方。目前有 <strong>{placeCount}</strong> 個地點、<strong>{themeCount}</strong> 個主題，之後還會慢慢長大。</p>
            </Section>

            <Section title="不知道從哪逛起？">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>隨便點一個標記就好。數字標記是附近有好幾個地方，點一下會放大。</li>
                <li>
                  沒有想看的？按地圖右邊的「隨便逛逛」，讓地圖幫你挑。人剛好在民雄的話，按「身邊有什麼」，看看腳邊有什麼故事。（這兩顆是小圓鈕，滑鼠移上去，名字會滑出來。）
                </li>
                <li>想找某一個人、某一棟老房子，就用上面的搜尋框，或挑一個主題。</li>
                <li>
                  看到喜歡的，複製網址傳給朋友，他打開就會看到和你一樣的畫面。電腦上按{' '}
                  <kbd className="rounded border border-atlas-ink/20 bg-white px-1 text-xs">Esc</kbd> 可以收起卡片。
                </li>
              </ul>
            </Section>

            <Section title="這些故事是大家的">
              <p>
                每一篇文章、每一張照片，都是
                <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  重構大學路計畫
                </a>
                的夥伴們走訪、訪談、整理出來的，版權屬大學路計畫所有。
              </p>
              <p>這裡只放標題、一小段摘要和封面圖，圖片也是直接連回官網，我沒有另外存一份。想好好讀完一篇，請從卡片上的按鈕走到官網去，那裡有完整的故事。</p>
            </Section>

            <Section title="如果你發現哪裡不對">
              <p>
                地點的位置和分類是我手動整理的，一定有標錯或漏掉的。如果你剛好熟悉那個地方，發現哪裡怪怪的，
                <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className={LINK}>
                  跟我說一聲
                </a>
                ，我會很感謝。
              </p>
              <p>
                這個網站的程式碼是公開的（MIT 授權），放在
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  GitHub
                </a>
                ，歡迎看看、拿去用，或一起把它變得更好。資料和圖片不在這個授權裡。
              </p>
            </Section>

            <p className="border-t border-atlas-ink/10 pt-4 text-atlas-muted">
              謝謝所有為民雄寫下這些文章的人。地圖用的是 OpenStreetMap 與 CARTO 的資料、MapLibre 地圖引擎，圖示來自 lucide，字體是 Noto Serif TC 與 Geist。祝你逛得開心。
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
