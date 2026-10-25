# 民雄文化地圖：民雄鐵路高架化

一個靜態的互動地圖網站，把「民雄鐵路高架化」相關的大學路（https://dovoha.ccu.edu.tw/）文章標在地圖上。
對象是想從地理位置了解民雄鐵路高架化相關議題的一般民眾與在地居民，以手機優先設計，介面為繁體中文。

網站本身不收錄全文：每個地點的卡片只顯示標題、圖片、摘要與前往大學路官網的連結（一律以新分頁開啟）。
圖片直接引用官網網址，不複製進專案，圖片失效時顯示預設圖。本站不做統計、搜尋篩選與英文版。

正式網址：https://fishpersonn.github.io/minsyong-cultural-atlas/

## 技術

- Vite + React + TypeScript（`strict`）
- Tailwind CSS 4 + shadcn/ui（Radix UI）
- MapLibre GL JS，底圖為 OpenFreeMap Liberty（`https://tiles.openfreemap.org/styles/liberty`）
- Vitest + Testing Library
- GitHub Actions 建置並部署到 GitHub Pages（Vite `base` 為 `/minsyong-cultural-atlas/`）

沒有 WebGL 或地圖初始化失敗時，會顯示「你的瀏覽器不支援互動地圖」並提供前往大學路官網的連結。

## npm 指令

```bash
npm install        # 安裝相依套件
npm run dev        # 啟動開發伺服器（開發時，被略過的資料會在 console 以 warn 列出）
npm run build      # 型別檢查（tsc --noEmit）後以 Vite 打包到 dist/
npm run preview    # 預覽打包結果
npm test           # 執行測試（vitest run）
npm run lint       # ESLint 檢查
```

## 如何更新資料

資料來自爬蟲 repo `dovoha-Web-Crawle`。更新時，把爬蟲輸出的 JSON 複製過來覆蓋 `src/data/railway.json`：

```bash
cp <dovoha-Web-Crawle>/2026-團隊研究調查-民雄鐵路高架化/MinxiongRailwayElevation_Output/民雄鐵路高架化.json \
   src/data/railway.json
```

其中 `<dovoha-Web-Crawle>` 是爬蟲 repo 在你電腦上的路徑。覆蓋後執行 `npm test`、`npm run build` 確認沒問題，再 commit 並 push 到 `main`。

### 資料格式與驗證規則

資料是 GeoJSON `FeatureCollection`（`features` 陣列）。每個 feature 的欄位對應如下（`src/lib/parsePlaces.ts`）：

| 原始欄位 | 對應到 `Place` | 說明 |
| --- | --- | --- |
| `geometry.coordinates` `[經度, 緯度]` | `lng`、`lat` | 必填 |
| `properties.name` | `title` | 必填，不可為空白 |
| `properties.摘要` | `summary` | 選填，缺少時為空字串 |
| `properties.查看更多` | `links[0]`，並由此擷取 `id` | 必填；網址需含 `-<數字>,c<數字>` 才能取得文章 ID |
| `properties.圖片` | `images[0]` | 選填 |
| `properties.查看更多2` | `links[1]` | 選填，合併文章用 |
| `properties.圖片2` | `images[1]` | 選填 |

文章 ID 取自官網連結（例如 `.../p/405-1159-96220,c4204.php?Lang=zh-tw` 的 `96220`）。有 `查看更多2` 的合併文章以第一個連結的 ID 為準，卡片會顯示兩個連結。

下列資料會被跳過（不顯示在地圖上，不會讓網站壞掉）：

- 缺少座標，或座標不是有效數字
- 座標超出範圍：經度需在 118–123、緯度需在 21–26（見 `src/constants.ts`）
- 缺少標題（`name`）
- 缺少 `查看更多` 連結，或連結中找不到文章 ID
- 文章 ID 與前面的地點重複

座標完全相同的多篇文章會合併成同一個標記，卡片可切換。初始視野會排除離中位數超過 10 公里的離群點；沒有任何有效地點時，會顯示「目前沒有可顯示的地點」與官網連結。

## 如何新增主題

1. 把新主題的 JSON（同上述 GeoJSON 格式）放到 `src/data/`，例如 `src/data/xxx.json`。
2. 在 `src/data/themes.ts` 匯入並登錄：

   ```ts
   import railwayJson from './railway.json'
   import xxxJson from './xxx.json'

   export const themes: Theme[] = [
     { id: 'railway', name: '民雄鐵路高架化', data: railwayJson },
     { id: 'xxx', name: '主題名稱', data: xxxJson },
   ]
   ```

目前的限制：App 沒有主題切換介面。`src/App.tsx` 會把 `themes` 裡所有主題的地點合併，全部標在同一張地圖上，各主題之間沒有區分、篩選或不同標記樣式；頁首標題（`SiteHeader`）也固定是「民雄鐵路高架化」。因此新增主題後若需要切換、分色或更改標題，還要另外修改 App 與相關元件。

## 專屬網址

選取地點時，網址會變成 `#p=<文章ID>`，例如：

```
https://fishpersonn.github.io/minsyong-cultural-atlas/#p=96220
```

直接開啟這個網址會定位到該地點並開啟卡片，可以用來分享。ID 找不到對應地點時，視為沒有選取。

## 部署

push 到 `main` 就會由 GitHub Actions（`.github/workflows/deploy.yml`）自動執行 lint、測試、建置，並部署 `dist/` 到 GitHub Pages。其他分支與 pull request 只跑 lint、測試、建置，不部署。

首次部署前，需要在 GitHub repo 的 Settings → Pages，把 Source 設為「GitHub Actions」。
