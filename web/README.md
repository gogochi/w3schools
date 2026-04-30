# web/ — Notion 嵌入式選擇題練習

兩個頁面 + 一支共用模組：

- `admin.html` — 老師端：樹狀題庫、購物車、產生 embed URL、LLM 匯出/匯入
- `index.html` — 學生端：根據 URL 的 `?q=` 列表渲染選擇題、提交到 Apps Script
- `lib.js` — 共用：fetch 題庫、`parseId`、`isMcq`、`loadQuestionsByIds`

後端是 `../apps-script/Code.gs`（GAS Web App）。

## 部署清單

### 1. 建 GitHub repo 並啟用 Pages

```bash
git init && git add . && git commit -m "init"
# 建 repo（gh 或網頁皆可）→ push
git remote add origin git@github.com:<USER>/<REPO>.git
git push -u origin main
```

GitHub → Settings → Pages → Source: **Deploy from a branch** → Branch `main` /
Folder `/web`。

### 2. 把 `lib.js` 的 raw URL 改成你的 repo

`web/lib.js` 第 6 行：
```js
export const REPO_RAW = 'https://raw.githubusercontent.com/<user>/<repo>/main/data';
```
（本機開發 `python3 -m http.server` 從 repo root 跑時會自動 fallback 到
`../data/`，可以先不改就測 admin/student 流程，只是寫 Sheet 那段要等部署。）

### 3. 建 Google Sheet 並部署 Apps Script

1. 在 Google Drive 建一個 Sheet，網址中間 `…/d/<SHEET_ID>/edit` 抄下 `<SHEET_ID>`。
2. 開 https://script.google.com/ → 新增專案 → 把 `apps-script/Code.gs` 整段貼進去 →
   填 `SHEET_ID` 常數。
3. **部署 → 新增部署作業**：
   - 類型：**網頁應用程式**
   - 執行身分：**我**
   - 存取權：**任何人**（別選「任何擁有 Google 帳戶」，否則學生會卡登入）
4. 把產出的 `.../exec` URL 貼到 `web/quiz.js` 的 `GAS_URL`。
5. （驗證連通）瀏覽器開 `<exec URL>`，應回 `{"ok":true,"msg":"GAS endpoint alive"}`。

> **改 `Code.gs` 後一定要重新部署**：Apps Script 的 Web App 是「綁版本」的，
> 直接編輯不會生效。每次都「部署 → 管理部署作業 → 鉛筆 → 版本：新版本」。

### 4. 在 admin 頁設定站台 base

部署後，admin.html 開起來在頂部「站台 base」欄填：
```
https://<user>.github.io/<repo>/
```
按 Tab 離開後會存到 localStorage。之後產生的 URL 就會是完整的 Pages URL，可以
直接複製貼到 Notion。

### 5. 貼到 Notion

在 Notion 的 web2026 頁，輸入 `/embed` 然後貼上 admin 產出的 URL；或用
`/link` 貼成卡片連結（學生點開新分頁）。

## 本機快速試（不需部署）

```bash
cd /path/to/repo            # repo root，有 data/ 資料夾
python3 -m http.server 8000
```

- admin：http://localhost:8000/web/admin.html
- 學生：http://localhost:8000/web/?q=html:ex:attributes:0,html:ex:colors:0,html:ex:colors:2

> 提醒：每個 topic array 同時混了 MCQ / fillintheblanks，`lib.js` 會自動跳過
> 非 MCQ 的 idx，所以 `html:ex:attributes:1`（fitb）即使寫進 URL 也不會渲染。
> 用 admin 頁挑題就不會踩到。

提交那段需要 GAS 部署完才會通。

## CORS / preflight 注意

學生端 `fetch` 用 `Content-Type: text/plain;charset=utf-8`、不帶任何自訂 header
（這就是「simple request」），瀏覽器不發 OPTIONS preflight，Apps Script
原生支援。**不要**改成 `application/json`，否則會 preflight 失敗。
