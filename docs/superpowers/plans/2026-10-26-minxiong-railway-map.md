# 民雄鐵路高架化互動地圖 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 做出一個手機與電腦都能用的互動式地圖網站，呈現民雄鐵路高架化的 24 個地點，每個地點的卡片帶訪客回大學路官網。

**Architecture:** 純靜態網站。資料是統一欄位的 JSON，載入時逐筆驗證，壞資料被跳過而不影響其他點。地圖（MapLibre）、卡片、網址狀態三個模組各自獨立，透過 `#p=<文章ID>` 同步選取狀態。

**Tech Stack:** Vite、React、TypeScript、maplibre-gl、Vitest + Testing Library、ESLint、GitHub Actions、GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-10-25-minxiong-railway-map-design.md`

## Global Constraints

- 部署網址 `https://fishpersonn.github.io/minsyong-cultural-atlas/`；Vite `base` 為 `/minsyong-cultural-atlas/`。
- 官網首頁與備援連結：`https://dovoha.ccu.edu.tw/`。
- 官網文章連結格式 `https://dovoha.ccu.edu.tw/p/405-1159-<ID>,c4204.php?Lang=zh-tw`；ID 以 `-(\d+),c\d+` 擷取。
- 專屬網址格式 `#p=<文章ID>`；2 筆合併文章（有 `查看更多2`）以第一個連結的 ID 為準，卡片兩個連結都顯示。
- 官網連結一律以新分頁開啟（`target="_blank"`、`rel="noopener noreferrer"`）。
- 卡片只放標題、圖片、摘要與官網連結，不放全文。
- 圖片直接引用官網網址，不複製進專案；失效時顯示預設圖。
- 底圖用 OpenFreeMap（先試 Liberty，風格網址 `https://tiles.openfreemap.org/styles/liberty`，需實測可用；備案 CARTO Positron）。
- 座標合理範圍：經度 118–123、緯度 21–26，之外視為無效。
- 沒有 WebGL 或地圖初始化失敗：顯示「你的瀏覽器不支援互動地圖」加前往大學路官網的連結，不顯示空白頁。
- 不做任何統計、不放全文、不做搜尋篩選、不做英文版。
- 繁體中文介面；手機優先設計。
- Conventional Commits；commit 訊息不加 attribution 行。
- 型別使用 TypeScript，`strict: true`。

## Review Focus

1. 多個地點座標完全相同（農會倉庫 3 筆、車站附近 3 筆）：地圖上不可疊成看不見的點，使用者要能看到全部地點。
2. 網址 `#p=` 指到不存在的 ID，或格式壞掉：回到全圖，不報錯、不空白。
3. 官網圖片 404 或載入失敗：卡片仍完整可用。
4. 資料整批無效（0 筆有效）或檔案缺欄位：頁面顯示友善訊息與官網連結，不當機。
5. 瀏覽器上一頁／下一頁與重新整理：選取狀態與網址一致。

---

## File Structure

| 檔案 | 責任 |
|---|---|
| `src/types.ts` | `Place`、`PlaceGroup`、`ParseResult` 型別 |
| `src/constants.ts` | 官網網址、底圖網址、座標範圍、初始視野離群距離 |
| `src/data/railway.json` | 從爬蟲 repo 複製來的原始 GeoJSON |
| `src/data/themes.ts` | 主題登錄：`themes: Theme[]` |
| `src/lib/articleId.ts` | `extractArticleId` |
| `src/lib/parsePlaces.ts` | 原始 GeoJSON → 驗證過的 `Place[]` |
| `src/lib/groupPlaces.ts` | `groupByLocation`、`initialBounds` |
| `src/lib/hash.ts` | `parseHash`、`buildHash` |
| `src/hooks/useSelectedId.ts` | 讀寫 `#p=`，監聽 `hashchange` |
| `src/components/MapView.tsx` | MapLibre 初始化、標記、飛行定位 |
| `src/components/PlaceCard.tsx` | 地點卡片 |
| `src/components/MapFallback.tsx` | 地圖不可用時的提示 |
| `src/components/SiteHeader.tsx` | 固定的「前往大學路官網」入口 |
| `src/App.tsx` | 組裝與版面（手機底部抽屜、電腦側欄） |
| `.github/workflows/deploy.yml` | CI 與部署 |
| `README.md` | 如何更新資料、如何新增主題 |

---

### Task 1: 專案骨架、CI 與部署

**Files:**
- Create: `package.json`、`vite.config.ts`、`tsconfig.json`、`index.html`、`src/main.tsx`、`src/App.tsx`（暫時只顯示標題）、`.github/workflows/deploy.yml`、`.gitignore`、`eslint.config.js`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `npm run dev|build|test|lint` 腳本；`vite.config.ts` 的 `base`；`src/constants.ts` 匯出 `OFFICIAL_SITE_URL: string`。

- [ ] **Step 1:** 在 repo 根目錄建立 Vite + React + TS 專案（檔案放根目錄，不要多一層資料夾），加入 `maplibre-gl`、`vitest`、`@testing-library/react`、`jsdom`、ESLint。`.gitignore` 排除 `node_modules`、`dist`。
- [ ] **Step 2: 寫失敗的測試** `src/App.test.tsx`：`render(<App />)` 後 `screen.getByText('民雄鐵路高架化')` 存在。
- [ ] **Step 3:** 執行 `npm test`，預期 FAIL（App 尚未顯示該文字）。
- [ ] **Step 4:** `App.tsx` 顯示標題 `民雄鐵路高架化`；`vite.config.ts` 設 `base: '/minsyong-cultural-atlas/'` 與 vitest `environment: 'jsdom'`；建立 `src/constants.ts` 匯出 `OFFICIAL_SITE_URL = 'https://dovoha.ccu.edu.tw/'`。
- [ ] **Step 5:** 執行 `npm test`、`npm run lint`、`npm run build`，預期全部通過。
- [ ] **Step 6:** 建立 `deploy.yml`：push 與 PR 時跑 lint、test、build；push 到 `main` 時用官方 Pages actions 上傳 `dist` 並部署。請使用者在 repo 設定把 Pages 來源改成 GitHub Actions。
- [ ] **Step 7:** 推到 `main`，到 `https://fishpersonn.github.io/minsyong-cultural-atlas/` 確認看到標題。
- [ ] **Step 8: Commit** `feat: 建立 Vite React 骨架與 GitHub Pages 部署`

---

### Task 2: 資料驗證與文章 ID

**Files:**
- Create: `src/types.ts`、`src/lib/articleId.ts`、`src/lib/parsePlaces.ts`、`src/data/railway.json`
- Test: `src/lib/articleId.test.ts`、`src/lib/parsePlaces.test.ts`

**Interfaces:**
- Produces:
  - `type Place = { id: string; title: string; summary: string; links: string[]; images: string[]; lng: number; lat: number; theme: string }`
  - `type SkippedItem = { index: number; reason: string }`
  - `type ParseResult = { places: Place[]; skipped: SkippedItem[] }`
  - `extractArticleId(url: string): string | null`
  - `parsePlaces(raw: unknown, theme: string): ParseResult`

- [ ] **Step 1:** 將 `/Users/fishperson/VScode/dovoha-Web-Crawle/2026-團隊研究調查-民雄鐵路高架化/MinxiongRailwayElevation_Output/民雄鐵路高架化.json` 複製為 `src/data/railway.json`。
- [ ] **Step 2: 寫失敗的測試** `articleId.test.ts`：
  - `extractArticleId('https://dovoha.ccu.edu.tw/p/405-1159-96220,c4204.php?Lang=zh-tw')` 為 `'96220'`
  - `extractArticleId('https://example.com/x')` 為 `null`
  - `extractArticleId('')` 為 `null`
- [ ] **Step 3: 寫失敗的測試** `parsePlaces.test.ts`：
  - 傳入 `railway.json`，`places.length` 為 24、`skipped.length` 為 0、24 個 `id` 互不相同。
  - 「民雄文化廊帶」在哪裡？訪談 這筆 `id` 為 `'87111'`，`links` 長度 2，`images` 長度 2。
  - 缺座標、座標為 `[0,0]`（超出合理範圍）、缺標題、缺 `查看更多`、非物件的項目，各自進 `skipped`，其餘仍被保留。
  - 傳入 `null`、`{}`、`{features: 'x'}` 時回傳 `{places: [], skipped: []}` 而不丟錯。
  - 兩筆有相同 ID 時，後者進 `skipped`（reason 含 `duplicate`）。
- [ ] **Step 4:** 執行 `npx vitest run src/lib`，預期 FAIL。
- [ ] **Step 5:** 實作 `extractArticleId`（正則 `-(\d+),c\d+`）與 `parsePlaces`：欄位對照 `name→title`、`摘要→summary`、`查看更多`/`查看更多2→links`、`圖片`/`圖片2→images`；經緯度取 `geometry.coordinates` 前兩項；範圍用 `constants.ts` 的值（本任務一併加入 `LNG_RANGE`、`LAT_RANGE`）。
- [ ] **Step 6:** 執行 `npx vitest run src/lib`，預期 PASS。
- [ ] **Step 7: Commit** `feat: 資料驗證與文章 ID 擷取`

---

### Task 3: 重疊點分組與初始視野

**Files:**
- Create: `src/lib/groupPlaces.ts`
- Modify: `src/types.ts`、`src/constants.ts`（加 `OUTLIER_KM = 10`）
- Test: `src/lib/groupPlaces.test.ts`

**Interfaces:**
- Consumes: `Place`。
- Produces:
  - `type PlaceGroup = { lng: number; lat: number; places: Place[] }`
  - `groupByLocation(places: Place[]): PlaceGroup[]`：座標完全相同者併為一組，保留輸入順序。
  - `initialBounds(places: Place[]): [[number, number], [number, number]]`：回傳 `[[西, 南], [東, 北]]`，排除距離座標中位數超過 `OUTLIER_KM` 公里的點；全部被排除或為空時，退回民雄車站附近的固定範圍。

- [ ] **Step 1: 寫失敗的測試**：用 `railway.json` 經 `parsePlaces` 的結果：
  - `groupByLocation(places)` 中存在一組含 3 筆，座標為 `(120.43203958702237, 23.558337047709617)`（農會倉庫相關）。
  - 所有組的 `places` 總數為 24。
  - `initialBounds(places)` 的北界小於 `23.6`、西界大於 `120.4`（台中與講堂那兩筆被排除在視野之外）。
  - `initialBounds([])` 回傳固定範圍，不丟錯。
- [ ] **Step 2:** 執行，預期 FAIL。
- [ ] **Step 3:** 實作兩個函式；距離用經緯度近似（球面公式或平面近似皆可，需處理緯度）。
- [ ] **Step 4:** 執行，預期 PASS。
- [ ] **Step 5: Commit** `feat: 重疊點分組與初始視野`

---

### Task 4: 網址 hash 同步

**Files:**
- Create: `src/lib/hash.ts`、`src/hooks/useSelectedId.ts`
- Test: `src/lib/hash.test.ts`、`src/hooks/useSelectedId.test.tsx`

**Interfaces:**
- Produces:
  - `parseHash(hash: string): string | null`：`'#p=96220'` 回 `'96220'`；`''`、`'#'`、`'#p='`、`'#p=abc'`（非純數字）、`'#x=1'` 回 `null`。
  - `buildHash(id: string | null): string`：`'96220'` 回 `'#p=96220'`；`null` 回 `''`。
  - `useSelectedId(): [string | null, (id: string | null) => void]`：初值取自目前網址；設定時用 `history.pushState` 更新；監聽 `popstate` 與 `hashchange`。

- [ ] **Step 1: 寫失敗的測試**：上述 `parseHash`／`buildHash` 全部案例；hook 測試：初始網址 `#p=96220` 時回 `'96220'`；呼叫 setter 後 `location.hash` 為 `#p=87111`；設為 `null` 後 hash 清空；手動改 `location.hash` 並觸發 `hashchange` 後 hook 值跟著變。
- [ ] **Step 2:** 執行，預期 FAIL。
- [ ] **Step 3:** 實作；`pushState` 時保留 `location.pathname + location.search`。
- [ ] **Step 4:** 執行，預期 PASS。
- [ ] **Step 5: Commit** `feat: 網址 hash 與選取狀態同步`

---

### Task 5: 地圖與標記

**Files:**
- Create: `src/components/MapView.tsx`、`src/components/MapFallback.tsx`、`src/components/SiteHeader.tsx`、`src/data/themes.ts`
- Modify: `src/App.tsx`、`src/constants.ts`（加 `BASEMAP_STYLE_URL`）
- Test: `src/components/MapFallback.test.tsx`、`src/components/MapView.test.tsx`

**Interfaces:**
- Consumes: `PlaceGroup`、`initialBounds`、`useSelectedId`。
- Produces:
  - `type Theme = { id: string; name: string; data: unknown }`；`themes: Theme[]`（目前只有鐵路高架化）。
  - `<MapView groups: PlaceGroup[]; bounds; selectedId: string | null; onSelect: (id: string | null) => void />`
  - `<MapFallback />`：顯示「你的瀏覽器不支援互動地圖」與指向 `OFFICIAL_SITE_URL` 的連結。
  - `<SiteHeader />`：固定顯示「前往大學路官網」，連結指向 `OFFICIAL_SITE_URL`，新分頁開啟。

- [ ] **Step 1: 寫失敗的測試**：`MapFallback` 渲染後有文字「你的瀏覽器不支援互動地圖」且有 `href` 為 `https://dovoha.ccu.edu.tw/`、`target="_blank"` 的連結。`MapView` 在 `maplibre-gl.Map` 建構時丟錯的情況下（測試中 mock 掉），渲染 `MapFallback` 而不是丟出錯誤。`SiteHeader` 有同樣的連結。
- [ ] **Step 2:** 執行，預期 FAIL。
- [ ] **Step 3:** 實作三個元件。`MapView` 在 `useEffect` 中建立地圖，`try/catch` 包住建構，失敗時設狀態顯示 `MapFallback`；初始視野用 `fitBounds`；每個 `PlaceGroup` 一個標記，組內多於 1 筆時標記上顯示數量；點標記呼叫 `onSelect`（單筆傳該地點 id，多筆傳第一筆 id）；`selectedId` 改變時 `flyTo` 該組座標。
- [ ] **Step 4:** 執行測試，預期 PASS。
- [ ] **Step 5:** `npm run dev`，在瀏覽器確認底圖載入、24 個點（合併後數量較少）都出現、點標記有反應。**若 OpenFreeMap Liberty 載入失敗，改用備案並更新 constants 與本計畫的 Global Constraints。**
- [ ] **Step 6: Commit** `feat: 地圖、標記與無地圖時的提示`

---

### Task 6: 地點卡片

**Files:**
- Create: `src/components/PlaceCard.tsx`、`public/placeholder.svg`（簡單預設圖）
- Test: `src/components/PlaceCard.test.tsx`

**Interfaces:**
- Consumes: `Place`、`PlaceGroup`。
- Produces: `<PlaceCard group: PlaceGroup; selectedId: string; onSelect: (id: string) => void; onClose: () => void />`。組內多筆時列出所有地點標題供切換；顯示被選地點的標題、圖片、摘要、官網連結。

- [ ] **Step 1: 寫失敗的測試**：
  - 單筆地點：顯示標題、摘要，圖片 `src` 為該筆第一張圖，連結 `href` 為第一個官網連結且有 `target="_blank"`、`rel` 含 `noopener`。
  - 2 個連結的地點：兩個連結都出現。
  - 圖片觸發 `error` 事件後，`src` 變成 `placeholder.svg`（以 `import.meta.env.BASE_URL` 組出）。
  - 地點 `links` 為空陣列時（以手造資料測），按鈕連到 `OFFICIAL_SITE_URL`。
  - 組內 3 筆：列出 3 個標題；點其中一個呼叫 `onSelect` 並帶該筆 id。
  - 按關閉鈕呼叫 `onClose`。
- [ ] **Step 2:** 執行，預期 FAIL。
- [ ] **Step 3:** 實作；官網連結文字為「到官網閱讀全文」；多連結時第二個文字為「到官網閱讀全文（2）」。
- [ ] **Step 4:** 執行，預期 PASS。
- [ ] **Step 5: Commit** `feat: 地點卡片與圖片備援`

---

### Task 7: 組裝與響應式版面

**Files:**
- Modify: `src/App.tsx`、`src/main.tsx`、新增 `src/App.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: 前面所有模組。
- Produces: 完整 `<App />`：載入資料 → `parsePlaces` → `groupByLocation`；`skipped` 非空時 `console.warn`；0 筆有效時顯示友善訊息加官網連結；`#p=` 對應不到地點時等同無選取。

- [ ] **Step 1: 寫失敗的測試**（mock `MapView` 為簡單元件以避開 WebGL）：
  - 網址 `#p=96220` 時顯示該地點卡片，標題含「從鐵路到電波」。
  - 網址 `#p=999999` 時不顯示卡片、不丟錯。
  - 網址 `#p=abc` 時同上。
  - 資料為空時（以 mock 的 themes 測）顯示友善訊息與官網連結。
  - 點關閉後 `location.hash` 為空。
- [ ] **Step 2:** 執行，預期 FAIL。
- [ ] **Step 3:** 實作 `App`；版面用 CSS：寬度小於 768px 時卡片固定在底部成抽屜（最高佔畫面 60%，可捲動），否則為左側固定寬度側欄；`SiteHeader` 固定在頂端。
- [ ] **Step 4:** 執行 `npm test`、`npm run lint`、`npm run build`，預期通過。
- [ ] **Step 5:** 以瀏覽器在手機尺寸與桌面尺寸檢查：點標記、卡片切換、關閉、上一頁、重新整理後狀態都正確；請使用者驗收。
- [ ] **Step 6: Commit** `feat: 組裝應用與響應式版面`

---

### Task 8: 上線與維護文件

**Files:**
- Create: `README.md`
- Modify: `.github/workflows/deploy.yml`（如有需要）

- [ ] **Step 1:** 寫 `README.md`（繁體中文）：專案簡介、`npm` 指令、如何更新資料（從爬蟲 repo 複製新的 JSON 到 `src/data/`）、如何新增一個主題（新增 JSON、在 `themes.ts` 登錄）、專屬網址格式、部署方式。
- [ ] **Step 2:** 合併到 `main`，確認 Actions 通過、正式網址可用。
- [ ] **Step 3:** 在正式網址用手機打開 `…/#p=96220`，確認直接定位並開啟該地點卡片；請使用者驗收。
- [ ] **Step 4: Commit** `docs: 新增 README 與維護說明`

---

## Self-Review 記錄

- **Spec 涵蓋**：目的與非目標（Global Constraints）、卡片內容（Task 6）、專屬網址（Task 4、7）、資料驗證（Task 2）、重疊點（Task 3、5、6）、離群點視野（Task 3）、圖片備援（Task 6）、官網備援連結（Task 6）、無 WebGL（Task 5）、手機與電腦（Task 7）、CI 與部署（Task 1、8）、維護文件（Task 8）。底圖備案在 Task 5 Step 5。
- **型別一致**：`Place`、`PlaceGroup`、`ParseResult`、`extractArticleId`、`parsePlaces`、`groupByLocation`、`initialBounds`、`parseHash`、`buildHash`、`useSelectedId` 的名稱與簽名在各任務中一致。
- **留給實作者**：視覺樣式、標記外觀、地圖動畫、測試 mock 方式。
