# Minsyong Cultural Atlas　民雄文化地圖

**一張可以在手機和電腦上探索的民雄文化互動地圖。**
把中正大學「重構大學路計畫」整理的民雄文史、人物、Podcast、老建築、在地報導，標在地圖上，點開就能讀每個地方的故事。

**[→ 打開地圖](https://fishpersonn.github.io/minsyong-cultural-atlas/)**

<table>
  <tr>
    <td><img src="docs/images/screenshot.png" alt="桌面版：地圖上有依主題上色的標記，上方是主題篩選列" width="640"></td>
    <td><img src="docs/images/screenshot-mobile.png" alt="手機版：點選地點後從底部滑出卡片" width="200"></td>
  </tr>
</table>

> *English:* an interactive map of Minxiong (民雄, Chiayi, Taiwan) cultural sites, built on public articles from National Chung Cheng University's "Reconstructing University Road" project. 638 places across 15 themes; the interface is in Traditional Chinese. Each place links back to the original article.

## 為什麼做這張地圖

民雄是嘉義的一個小鄉鎮。中正大學的「重構大學路計畫」這幾年一直在記錄這裡：老車站、農會倉庫、廟宇、做生意的人、住在這裡的人。文章很多，但散在[官網](https://dovoha.ccu.edu.tw/)各處，很難知道哪篇在哪條街上。

所以我把它們一篇一篇標到地圖上。不熟民雄也沒關係，打開來亂逛就好，看到有興趣的點下去，就是那個地方的故事。

這裡不是大學路官網，也不放文章全文。每張卡片只有標題、圖片和摘要，想讀完整的，點「到官網閱讀全文」過去就是了。

## 怎麼逛

- **直接點**：地圖上的標記依主題換顏色和圖示。數字標記是附近有好幾個地點，點一下會放大。
- **不知道看什麼**：按「隨機一個」，會在目前篩出來的地點裡抽一個。人在民雄的話，按「我附近」找最近的地點（要允許定位）。
- **想找特定的**：上面的搜尋框可以搜標題、內容、分類，美食還能搜地址。主題可以多選，例如「人物」加「古碑文」一起看；只選一個主題時，還能再挑分類。篩完之後地圖會自動移到結果的位置。
- **想看全貌**：地圖右上角的方框按鈕是「回到全圖」，按一下就拉回目前結果的整體範圍。
- **一個一個看**：卡片上有封面圖、摘要、年代和官網的發布日期；下面有「上一個／下一個」，電腦上按 `Esc` 關掉卡片。
- **想知道這是什麼**：標頭的「關於」會打開一個說明視窗，講這張地圖是什麼、怎麼逛、資料和版權、怎麼回報問題。
- **分享**：你選的地點、主題和搜尋字都會記在網址裡，貼給朋友，他打開就和你看到同一個畫面。
- **手機也好用**：手機上卡片從下面滑出來，電腦上在左邊。

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

- **資料從哪來**：[重構大學路網站](https://dovoha.ccu.edu.tw/)。文章先用爬蟲抓下來，座標和分類是我手動標的，難免標錯或漏掉；如果你發現了，歡迎[開 Issue](https://github.com/fishpersonn/minsyong-cultural-atlas/issues) 告訴我。
- **版權**：文章和圖片都是大學路計畫的。這裡的圖片是直接連到官網顯示，我沒有另外存一份；官網改版或圖片失效時，會換成預設圖。卡片上的封面圖和發布日期，是用腳本從各篇文章的頁面補抓來的（見 [docs/DATA.md](docs/DATA.md)）。
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

- 內容與圖片：來自[重構大學路網站](https://dovoha.ccu.edu.tw/)，版權屬大學路計畫所有。
- 地圖資料：© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors、© [CARTO](https://carto.com/attributions)（地圖角落的標註請勿移除）。
- 開源元件：MapLibre GL JS（BSD-3-Clause）、React、Vite、Tailwind CSS、shadcn/ui 與 Radix UI（MIT）、[lucide](https://lucide.dev/) 圖示（ISC）、[Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC) 與 Geist 字體（SIL OFL）。
- **授權**：程式碼以 [MIT License](LICENSE) 授權。資料、文章內容與圖片（含 `src/data/` 底下的檔案）**不在 MIT 授權範圍內**，版權屬大學路計畫所有。
