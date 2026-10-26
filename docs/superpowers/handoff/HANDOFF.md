# 交接：民雄鐵路高架化互動地圖（feat/railway-map）

日期：2026-10-26。從本機 Claude Code 交接到 Claude Code 網頁版。使用者在睡覺，請自主完成到「等使用者決定合併」為止，不要 push 到 `main`、不要合併。

## 先讀

1. 設計：`docs/superpowers/specs/2026-10-25-minxiong-railway-map-design.md`
2. 計畫：`docs/superpowers/plans/2026-10-26-minxiong-railway-map.md`
3. 本資料夾：`progress.md`（進度與所有 Ruling）、`global-constraints.md`、`implementer-rules.md`、`reviewer-rules.md`
4. 本檔下方「最終修正清單」

## 狀態

- 任務 1–8 全部完成並通過各自審查（`f45b823`..`58bc94b`），`npm test` 61/61、lint、build 通過。
- 整個分支最終審查：**With fixes**（見下）。
- 使用者在真實瀏覽器打開時看到「你的瀏覽器不支援互動地圖」→ 已查出根本原因（第 0 項）。

## 流程

- 使用 superpowers `subagent-driven-development` 的最終階段：派**一個**修正子代理處理下方全部項目（TDD），再派**一次**範圍內複審（re-review），殘留問題依規則裁定並記在 `progress.md`。
- UI 相關修改前載入 `frontend-design:frontend-design`。
- Conventional Commits，不加 attribution / Co-Authored-By。
- 完成後 push 到 `feat/railway-map`（不是 main），並開一個 PR 到 main 但**不要合併**；PR 說明列出所有 `Ruling:`（各附「若錯的代價」）與「仍需使用者在瀏覽器確認的項目」。

## 最終修正清單

### 0. CRITICAL — 地圖永遠載不出來，顯示 fallback
根本原因（已驗證）：maplibre-gl 6.16.0 以 `new URL('./maplibre-gl-worker.mjs', import.meta.url)` 載入 worker。Vite 開發時把套件預先打包到 `node_modules/.vite/deps/`（worker 網址 404），正式打包的 `dist/assets` 也沒有 worker 檔。地圖在 `load` 前觸發 `Error: Worker failed to load. Check that the worker URL is correct.`，於是顯示 MapFallback。瀏覽器 console 證據：`DEBUG map error loaded=false Worker failed to load. Check that the worker URL is correct.`

修法：`import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'`（package.json exports 允許 `./dist/*`；worker 檔沒有 import，可獨立載入），在任何 Map 建立前呼叫一次 `maplibregl.setWorkerUrl(workerUrl)`（MapView.tsx 模組層級，或小檔 `src/lib/maplibre.ts`）。
測試：MapView 測試斷言 `setWorkerUrl` 以含 `maplibre-gl-worker` 的字串、在 `Map` 建構前被呼叫。驗證：`npm run build` 後 `dist/assets` 內有 `maplibre-gl-worker-*.mjs`；`npx vite preview` 下該 worker 網址回 200。

### 1. Important — 選中的標記被卡片蓋住
`MapView.tsx` 的 `map.flyTo({ center })` 以整個容器置中；手機底部抽屜（max-h-[60dvh]）與 768–850px 寬的桌面左側 400px 面板會蓋住中心。修法：依 `window.matchMedia('(min-width: 768px)')` 給 padding——桌面 `{ left: 424, top: 0, right: 0, bottom: 0 }`，手機 `{ bottom: Math.round(container.clientHeight * 0.6), top: 0, left: 0, right: 0 }`。測試：兩種情況下 flyTo 的 padding 參數。

### 2. Important — 切換地點時卡片停在舊的捲動位置
App 渲染 PlaceCard 沒有 key。給卡片的捲動容器（或 App 裡的 `<PlaceCard>`）`key={place.id}`。測試：切換地點後是新的捲動容器（元素不同）或 scrollTop 為 0。

### 3. Minor（要做）— 已移除的地圖晚到的錯誤會觸發 fallback
error handler 改為 `if (loaded || removed) return`。測試：dispose 之後才發出的 error 不會顯示 fallback。

### 4. Minor（要做）— fallback 文字在網路/樣式失敗時不正確
沒有 WebGL（建構丟錯）維持「你的瀏覽器不支援互動地圖」；load 前錯誤改為「互動地圖暫時無法載入」。用 prop 區分（例如 `reason: 'unsupported' | 'load-failed'`），兩者都保留官網連結。更新測試。

### 5. Minor（要做）— CI 重複執行
`.github/workflows/deploy.yml`：`push` 限定 `branches: [main]`，保留 `pull_request`。

### 6. Minor（要做）— README 對象
README 約第 4 行改為「想認識民雄文化的外地人」（依設計文件）。

其餘最終審查的小問題（焦點管理、aria-pressed 語意、群組點擊重設、bundle 大小、shadcn 依賴、CJK 字型等）先不做，列在 PR 說明的「後續」。

## 使用者醒來後要做的事（寫進 PR 說明）

- 在瀏覽器確認：地圖與標記出現、點標記開卡片、`#p=96220` 直接定位、手機尺寸底部卡片可捲動且不蓋住選中點、版權標示可見。
- 決定是否合併 PR；合併後在 GitHub repo 設定把 Pages 來源改為「GitHub Actions」，確認 https://fishpersonn.github.io/minsyong-cultural-atlas/
