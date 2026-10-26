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
              <Dialog.Title className="font-title text-xl leading-snug font-semibold">
                如果地圖標示的不只是地點，而是歲月與情感，會長怎樣？
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-atlas-muted">
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
            <div className="flex flex-col gap-2">
              <p>『重構大學路』團隊歷時無數個在田野間蹲下的午後，傾聽在地耆老的故事，把散落在民雄村落裡的記憶片段，縫合成這張【文化互動地圖】。</p>
              <p>在這裡，你可以聽見地方的聲音，看見歲月的痕跡。邀請你點擊這張地圖，與我們一起接住這片土地上，值得被驕傲記住的光芒。</p>
            </div>

            <Section title="我們為什麼做這張地圖">
              <p>我們常常在想，一座大學與它腳下的土地，該如何彼此相認？答案，或許就藏在這張地圖裡。</p>
              <p>這不是一張冷冰冰的座標圖，而是一幅由無數在地生命交織出的記憶地圖。我們用雙腳走過民雄的歲月，把老人家隨口提及的往事、漸漸消失的傳統工藝，以及那些微小卻閃亮的日常，梳理成地圖上的點點微光。</p>
              <p>它是一座 bridge（橋），連接了象牙塔內的眼界與田野間的深情；它也是一份禮物，輕柔地交到每一位關心這片土地的人手中。</p>
              <p>目前，地圖上有 <strong>{placeCount}</strong> 個地點、<strong>{themeCount}</strong> 個主題，往後還會一點一點，慢慢長出來。</p>
            </Section>

            <Section title="怎麼走進這張地圖">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>隨意點開一個標記就好。數字標記表示附近有好幾個地方，點一下會放大。</li>
                <li>不知道從哪開始？按地圖右邊的「隨便逛逛」，讓地圖替你抽一個。人剛好在民雄，就按「身邊有什麼」，看看腳邊的故事。（這兩顆是小圓鈕，滑鼠移上去，名字會滑出來。）</li>
                <li>想找某一個人、某一棟老屋，就用上面的搜尋框，或挑一個主題。</li>
                <li>
                  遇見喜歡的故事，複製網址交給朋友，他打開就會看到和你一樣的畫面。電腦上按{' '}
                  <kbd className="rounded border border-atlas-ink/20 bg-white px-1 text-xs">Esc</kbd> 可以收起卡片。
                </li>
              </ul>
            </Section>

            <Section title="這些故事屬於這片土地">
              <p>
                每一篇文章、每一張照片，都是
                <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  重構大學路計畫
                </a>
                的夥伴們走訪、傾聽、整理出來的，版權屬大學路計畫所有。
              </p>
              <p>這張地圖是故事的入口，不是大學路官網。這裡只放標題、一小段摘要和封面圖，圖片也是直接連回官網，沒有另外存一份。想把故事好好讀完，請從卡片上的按鈕走到官網去。</p>
            </Section>

            <Section title="如果你發現哪裡不對">
              <p>
                地點的位置與分類是人工一一標記的，難免有錯漏。如果你熟悉那個地方，發現哪裡不太對，
                <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className={LINK}>
                  請告訴我們
                </a>
                ，我們會很感謝。
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
              謝謝每一位為民雄寫下、說出這些故事的人，也謝謝願意聽的你。地圖使用 OpenStreetMap 與 CARTO 的資料、MapLibre 地圖引擎，圖示來自 lucide，字體是 Noto Serif TC 與 Geist。
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
