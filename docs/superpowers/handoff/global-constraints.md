# Global Constraints (verbatim from plan)

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
- Conventional Commits；commit 訊息不加 attribution 行（不要加 Co-Authored-By）。
- 型別使用 TypeScript，`strict: true`。

# Controller rulings that bind implementers

- Do NOT push, do NOT merge, do NOT change GitHub settings. Commit only on the current branch `feat/railway-map`.
- No browser is available to you. Where the plan says to check in a browser, instead: run tests, lint, build; for the basemap, `curl -sI https://tiles.openfreemap.org/styles/liberty` must return HTTP 200.
- The visible text 民雄鐵路高架化 must remain on the page (Task 1's App test depends on it).
- Work only inside /Users/fishperson/VScode/minsyong-cultural-atlas/.claude/worktrees/railway-map. Do not cd elsewhere for git commands.

# UI stack (user request, 2026-10-26, applies from Task 5 on)

- Styling: Tailwind CSS. Components: shadcn/ui (built on Radix UI primitives) — e.g. Button, Sheet/Drawer for the mobile bottom card, Card, ScrollArea — added via the shadcn CLI into `src/components/ui/`. Use `@/` path alias as shadcn expects (configure in tsconfig + vite).
- Tailwind + shadcn setup is done at the start of Task 5 (first UI task) and committed separately: `chore: 加入 Tailwind 與 shadcn/ui`.
- Keep plan's component files (MapView, PlaceCard, MapFallback, SiteHeader, App) and their props/tests; shadcn components are building blocks inside them. App.css from Task 7 becomes Tailwind classes (a global CSS file for Tailwind + maplibre-gl CSS is fine).
- If a `frontend-design` skill is available to you, load it before writing UI code and follow it for visual design.
