// 注意：JSX 裡中文句子換行會變成一個空白，段落文字請維持在同一行，不要折行
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SITE_URL } from "@/constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeCount: number;
  themeCount: number;
};

const REPO_URL = "https://github.com/fishpersonn/minsyong-cultural-atlas";

const LINK =
  "font-medium text-atlas-teal underline underline-offset-2 hover:text-atlas-ink";

export default function AboutDialog({
  open,
  onOpenChange,
  placeCount,
  themeCount,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-atlas-ink/60 motion-safe:animate-in motion-safe:fade-in" />
        <Dialog.Content className="atlas-paper fixed inset-x-3 top-1/2 z-50 mx-auto flex max-h-[85dvh] max-w-xl -translate-y-1/2 flex-col overflow-hidden rounded-2xl text-atlas-ink shadow-2xl outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
          <div className="flex items-start justify-between gap-3 border-b border-atlas-ink/10 px-5 py-4">
            <div>
              <Dialog.Title className="font-title text-xl font-semibold tracking-wide">
                Minsyong Cultural Atlas
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-atlas-muted">
                民雄文化地圖
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

          <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-5 text-sm leading-relaxed text-atlas-body">
            <p className="font-title text-base leading-relaxed text-atlas-ink">
              一幅由無數在地生命交織成的地圖。
            </p>

            <p>
              「
              <a
                href={OFFICIAL_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                重構大學路
              </a>
              」團隊歷時無數個在田野間蹲下的午後，傾聽耆老的故事，把散落在民雄村落裡的記憶片段，編織成了這張民雄文化地圖。我們常想，一座大學與它腳下的土地該如何彼此相認？答案，或許就藏在這些微光裡。它是一座橋，連接了象牙塔內的眼界與田野間的深情；也是一份禮物，輕柔地交到每一位關心這片土地的人手中。
            </p>

            <p>
              目前地圖上已有 <strong>{placeCount}</strong> 個地點與{" "}
              <strong>{themeCount}</strong>{" "}
              個主題，往後也會順著時光的脈絡，一點一點，慢慢長出來。
            </p>

            <p className="font-semibold text-atlas-ink">備註</p>
            <ul className="mt-1 list-disc pl-5">
              <li>
                關於錯漏：地圖上的地點與分類皆由夥伴們人工一一標註，若有未盡完善之處，非常歡迎熟悉當地的你
                <a
                  href={`${REPO_URL}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  告訴我們
                </a>
                ，我們將會即時更正。
              </li>
            </ul>

            <p>
              謝謝每一位為民雄寫下、說出這些故事的人，也謝謝願意停下腳步、傾聽這片土地的你。
            </p>

            <div className="space-y-1 border-t border-atlas-ink/10 pt-4 text-xs text-atlas-muted">
              <p>
                版權與開源：圖文與資料版權為重構大學路計畫團隊所有；
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  網站程式碼
                </a>
                採 MIT 授權。
              </p>
              <p>
                致謝：
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  © OpenStreetMap contributors
                </a>{" "}
                <a
                  href="https://carto.com/attributions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  © CARTO
                </a>
                、MapLibre、lucide，以及 Noto Serif TC 與 Geist。
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
