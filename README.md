# Minsyong Cultural Atlas　民雄文化地圖

**如果地圖標示的不只是地點，而是歲月與情感，會長怎樣？**

『重構大學路』團隊歷時無數個在田野間蹲下的午後，傾聽在地耆老的故事，把散落在民雄村落裡的記憶片段，縫合成這張【文化互動地圖】。

在這裡，你可以聽見地方的聲音，看見歲月的痕跡。邀請你點擊這張地圖，與我們一起接住這片土地上，值得被驕傲記住的光芒。

**[→ 走進這張地圖](https://fishpersonn.github.io/minsyong-cultural-atlas/)**

<table>
  <tr>
    <td><img src="docs/images/screenshot.png" alt="桌面版：地圖上有依主題上色的標記，上方是主題篩選列" width="640"></td>
    <td><img src="docs/images/screenshot-mobile.png" alt="手機版：點選地點後從底部滑出卡片" width="200"></td>
  </tr>
</table>

> *English:* an interactive map of Minxiong (民雄, Chiayi, Taiwan) cultural sites, built on public articles from National Chung Cheng University's "Reconstructing University Road" project. 638 places across 15 themes; the interface is in Traditional Chinese. Each place links back to the original article.

## 我們為什麼做這張地圖

我們常常在想，一座大學與它腳下的土地，該如何彼此相認？答案，或許就藏在這張地圖裡。

這不是一張冷冰冰的座標圖，而是一幅由無數在地生命交織出的記憶地圖。我們用雙腳走過民雄的歲月，把老人家隨口提及的往事、漸漸消失的傳統工藝，以及那些微小卻閃亮的日常，梳理成地圖上的點點微光。

它是一座 bridge（橋），連接了象牙塔內的眼界與田野間的深情；它也是一份禮物，輕柔地交到每一位關心這片土地的人手中。

這裡是故事的入口，不是[大學路官網](https://dovoha.ccu.edu.tw/)，也不放文章全文：每張卡片只有標題、圖片和一小段摘要。想把故事讀完，請從「到官網閱讀全文」走過去。

## 怎麼走進這張地圖

- **隨意點開**：標記依主題換顏色和圖示，數字標記表示附近有好幾個地方，點一下會放大。
- **不知道從哪開始**：地圖右邊有兩顆小圓鈕，滑鼠移上去會看到名字。「隨便逛逛」會替你抽一個地點；人剛好在民雄，就按「身邊有什麼」，看看腳邊的故事（需要允許定位）。
- **想找某一個人、某一棟老屋**：標題列的搜尋框可以搜標題、內容、分類，美食還能搜地址。主題可以多選，例如「人物」加「古碑文」一起看；只選一個主題時，還能再挑分類。篩完之後，地圖會自己移到結果的位置。
- **想回到起點**：點左上角的站標和「Minsyong Cultural Atlas」，會清掉篩選、搜尋和卡片，地圖也拉回全圖，像回到首頁。右上角的方框鈕「回到全圖」，則是拉回目前結果的整體範圍。
- **一篇一篇慢慢看**：卡片上有封面圖、摘要、年代和官網的發布日期；下面的「上一個／下一個」可以依序走下去，電腦上按 `Esc` 收起卡片。
- **想知道這張地圖的來歷**：標頭的「關於」會打開一段說明。
- **把遇見的故事交給別人**：選到的地點、主題和搜尋字都會記在網址裡，貼給朋友，他打開就會看到和你一樣的畫面。
- **手機也能走**：手機上卡片從下方滑出來，電腦上在左邊。

## 資料

共 **638 個地點、15 個主題**：

| 主題 | 地點數 | 主題 | 地點數 |
| --- | ---: | --- | ---: |
| 我的民雄朋友們 Podcast | 161 | 東南亞美食 | 39 |
| 民雄阿榮文化小站 | 111 | 街區走踏路線 | 36 |
| 民雄文化地圖 | 78 | 民雄鐵路高架化 | 24 |
| 民雄人物 | 75 | 工作坊紀錄 | 20 |
| 課程成果 | 49 | 鳳梨急行軍田野筆記 | 13 |
| 民雄古碑文 | 10 | 廟宇裝飾藝術 | 7 |
| 打貓街坊文化協會 | 5 | 我的農民朋友們 | 5 |
| 課程筆記 | 5 | | |

- **故事從哪裡來**：[重構大學路網站](https://dovoha.ccu.edu.tw/)。文章先用爬蟲整理，座標與分類由人工一一標記，難免有錯漏；如果你熟悉那個地方、發現哪裡不對，歡迎[開 Issue](https://github.com/fishpersonn/minsyong-cultural-atlas/issues) 告訴我們。
- **版權**：文章與圖片的版權屬大學路計畫所有。這裡的圖片是直接連到官網顯示，沒有另外存一份；官網改版或圖片失效時，會換成預設圖。卡片上的封面圖和發布日期，是用腳本從各篇文章的頁面補抓來的（見 [docs/DATA.md](docs/DATA.md)）。
- 資料怎麼更新、格式與規則，見 [docs/DATA.md](docs/DATA.md)。

## 技術

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript（`strict`）
- [Tailwind CSS](https://tailwindcss.com/) 4 + [shadcn/ui](https://ui.shadcn.com/)（Radix UI）
- [MapLibre GL JS](https://maplibre.org/)，底圖為 [CARTO](https://carto.com/) Positron
- 純靜態網站，沒有後端與資料庫；資料是隨程式一起打包的 JSON
- [Vitest](https://vitest.dev/) + Testing Library；GitHub Actions 自動檢查與部署到 GitHub Pages

如果瀏覽器不支援 WebGL，或地圖載入失敗，會顯示提示和官網連結，不會一片空白。

## 在自己的電腦上執行

需要 Node.js 22。

```bash
git clone https://github.com/fishpersonn/minsyong-cultural-atlas.git
cd minsyong-cultural-atlas
npm install
npm run dev        # 開發伺服器，網址會印在終端機（含 /minsyong-cultural-atlas/ 路徑）
```

其他指令：

```bash
npm test           # 執行測試
npm run lint       # ESLint
npm run build      # 型別檢查後打包到 dist/
npm run preview    # 預覽打包結果
```

## 專案結構

```
src/
  components/   地圖（MapView）、地點卡片、清單、篩選列、說明框…
  lib/          資料解析與驗證、篩選、標記合併、標記顏色與圖示
  data/         各主題的 GeoJSON、分類與年代補充資料、主題登錄（themes.ts）
  hooks/        網址（地點、篩選、搜尋）與畫面狀態同步、說明框記憶
scripts/        import-crawler.mjs（把爬蟲專案的資料轉成本站格式）、fetch-site-meta.mjs（從官網補抓封面圖與發布日期）
docs/           DATA.md（資料維護）、截圖
```

## 部署

push 到 `main` 會由 GitHub Actions 執行 lint、測試、建置，再部署到 GitHub Pages；其他分支與 pull request 只跑檢查，不部署。
自己 fork 部署時，要在 repo 的 Settings → Pages 把 Source 設為「GitHub Actions」，並依你的 repo 名稱調整 `vite.config.ts` 的 `base`。

## 參與

座標不對、分類標錯、連結失效，或是有想要的功能，都歡迎[開 Issue](https://github.com/fishpersonn/minsyong-cultural-atlas/issues)。
想改程式的話，請先開 Issue 討論，送 pull request 前請確認 `npm run lint`、`npm test`、`npm run build` 都通過。

## 致謝與授權

謝謝每一位為民雄寫下、說出這些故事的人，也謝謝願意聽的你。

- 內容與圖片：來自[重構大學路網站](https://dovoha.ccu.edu.tw/)，版權屬大學路計畫所有。
- 地圖資料：© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors、© [CARTO](https://carto.com/attributions)（地圖角落的標註請勿移除）。
- 開源元件：MapLibre GL JS（BSD-3-Clause）、React、Vite、Tailwind CSS、shadcn/ui 與 Radix UI（MIT）、[lucide](https://lucide.dev/) 圖示（ISC）、[Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC) 與 Geist 字體（SIL OFL）。
- **授權**：程式碼以 [MIT License](LICENSE) 授權。資料、文章內容與圖片（含 `src/data/` 底下的檔案）**不在 MIT 授權範圍內**，版權屬大學路計畫所有。
