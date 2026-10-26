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
              <Dialog.Title className="font-title text-xl font-semibold">關於這張地圖</Dialog.Title>
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
            <Section title="這是什麼">
              <p>
                民雄是嘉義縣的一個鄉鎮。中正大學「重構大學路計畫」多年來記錄了這裡的歷史、產業、人物與日常，文章散落在官網各處。這張地圖把它們標到同一個地方，讓不熟悉民雄的人，也能邊逛邊認識這裡。
              </p>
              <p>
                目前收錄 <strong>{placeCount}</strong> 個地點、<strong>{themeCount}</strong> 個主題：從鐵路與車站的老故事、農會倉庫與老建築，到民雄人物、Podcast、在地報導、廟宇裝飾藝術與東南亞美食。
              </p>
            </Section>

            <Section title="怎麼逛">
              <ul className="list-disc space-y-1 pl-5">
                <li>點地圖上的標記看卡片；數字標記代表附近有好幾個地點，點一下會放大。</li>
                <li>用上方的主題與分類縮小範圍，地圖會跟著移到結果的位置。</li>
                <li>
                  「地點清單」可以搜尋標題、內容與分類；卡片下方的「上一個／下一個」可以依序逛，電腦上按{' '}
                  <kbd className="rounded border border-atlas-ink/20 bg-white px-1 text-xs">Esc</kbd> 關閉卡片。
                </li>
                <li>每個地點都有自己的網址，複製網址貼給朋友，對方會直接看到那個地點。</li>
              </ul>
            </Section>

            <Section title="資料與版權">
              <p>
                資料來源是
                <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  重構大學路網站
                </a>
                ，文章內容與圖片的版權屬<strong>大學路計畫</strong>所有。本站不收錄全文，圖片也是直接連到官網顯示，沒有另外複製；想讀完整的文章，請從卡片上的按鈕前往官網。
              </p>
              <p>
                地點的座標與分類是人工標記與整理的，難免有錯誤或遺漏。本站也<strong>不是</strong>大學路官網。
              </p>
            </Section>

            <Section title="回報問題與原始碼">
              <p>
                發現座標不對、分類有誤、連結失效，或有功能建議，歡迎到
                <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className={LINK}>
                  GitHub Issues
                </a>
                告訴我們。程式碼以 MIT 授權公開在
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  GitHub
                </a>
                ；資料與圖片不在這個授權範圍內。
              </p>
            </Section>

            <Section title="致謝">
              <p>
                地圖資料 © OpenStreetMap contributors、© CARTO；地圖引擎 MapLibre GL JS；圖示 lucide；字體 Noto Serif TC 與 Geist。
              </p>
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
