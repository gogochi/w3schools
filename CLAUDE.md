# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

W3Schools 題庫的 scraper + 已抓取的 JSON 資料集。涵蓋 7 種語言/技術 (HTML / CSS / JS / C / Node.js / Vue / SQL / Git) × 多種題型（challenges / exercises / quiz）。沒有 application code、test framework、build pipeline — 這是個 data + scripts repo。

## Common Commands

沒有 `npm install` / `package.json` — 三個腳本都用 Node 內建模組（`fs`, `path`, `vm`, `fetch`），Node 18+ 即可。

```bash
# 重抓 quiz（25-40 題 form POST 翻頁）
node scripts/scrape_quiz.js HTML CSS JS C NODEJS SQL GIT VUE
# 寫到 data/w3s-<lang>-quiz.json

# 重抓 challenges / exercises 是兩階段：先 curl 抓原始 .js，再 eval
TMP=$(mktemp -d)
mkdir -p "$TMP/html_chal"
# (用 curl 把 https://www.w3schools.com/html/html_challenge_<topic>.js 抓到 $TMP/html_chal/)
node scripts/eval_challenges.js html "$TMP/html_chal" data/w3s-html-challenges.json
node scripts/eval_exercises.js html "$TMP/html_ex"   data/w3s-html-exercises.json

# Vue exercises 用專用腳本（每題獨立 HTML，不走 xrcise_*.js）
node scripts/scrape_vue_exercises.js
```

完整 curl 流程在 `README.md` 的「重新抓取」段。

## Big Picture

### 為什麼資料抓取要兩階段（curl → vm.eval）

W3Schools 把 challenge / exercise 題庫存在外部 `.js` 檔，內容是**有效的 JavaScript 但不是純 JSON**：
- 字串用 `+` 拼接
- regex 用 literal `/.../i`
- key 沒加引號
- 有 `window.CHALLENGE_DATA = ...` 或 `qobjects = [...]` 這種賦值語句

所以不能 `JSON.parse`，必須用 `vm.runInNewContext(src, sandbox)` 讓它執行，再從 sandbox 拿 `CHALLENGE_DATA` / `qobjects`。`scripts/eval_*.js` 就是這個 pattern。

### URL pattern 的陷阱

1. **C / Vue 用 `.php`，其他用 `.asp`**：`scripts/scrape_quiz.js` 內 `PHP_TESTS = new Set(['C', 'VUE'])` 處理這分支。新增 .php-based 語言要更新這 set。
2. **目錄頁複數、data 路徑單數**：列表頁是 `html_challenges_<topic>.asp`，但對應 data 是 `html_challenge_<topic>.js`（少個 s）。Exercise 一致用 `xrcise_<topic>.js`。
3. **Vue quiz 真名是 `VUE` 不是 `V`**：Vue 介紹頁的 link 寫 `qtest=V`，但 server 只接受 `qtest=VUE`（V 會回 46 byte 空頁）。
4. **SQL exercises 用 `const qobjects = [...]`**：而非裸 `qobjects = [...]`，`vm.runInNewContext` 抓不到 const lexical binding。`eval_exercises.js` 已加 regex 把 `const|let|var qobjects` 前綴剝掉。

### Vue exercises 結構獨特

Vue 沒有外部 `xrcise_*.js` — **每題一個獨立 HTML 頁面**：
- URL: `https://www.w3schools.com/vue/exercise.php?filename=exercise_<topic><N>`
- 題目資料 inline 在 HTML：`<div id="assignmenttext"><p>...</p>` (prompt) + `<div id="assignmentcode">` (code 模板含 `@(N)` 占位符) + `<div id="correctcode[N]">` (多版本正解)
- 用 `scripts/scrape_vue_exercises.js` 專門處理（fetch 首題的 sidebar 取得所有 filename，再平行 fetch 每頁解析）
- 通用 `eval_exercises.js` 不能用於 Vue。

### Quiz 抓不到正解（除了 C）

W3Schools quiz 是 server-side 比對：每題 form POST、server 回下一題，最終結果頁**只回傳「9 of 25, 36%」這類總分，不揭示逐題正解**。所以 `scrape_quiz.js` 抓到的每題 `correct` 全是 `null`。

`data/w3s-c-quiz.json` 是唯一有正解的 — 25 題答案是先前手動標好（在外部 repo `playwright-crawler/scripts/save-w3c-quiz.ts` hardcoded），之後 merge 進新 JSON。

要補 HTML/CSS/JS quiz 答案只能手工或 LLM 標。

### Browser MCP 擋詞陷阱

W3Schools 頁面內容含 cookie / Set-Cookie / Base64 字串時，從 chrome MCP 工具（`mcp__claude-in-chrome__javascript_tool` 等）的回傳會被 `[BLOCKED: Cookie/query string data]` 擋掉。

**結論**：抓資料一律走 Node `fetch` + `curl`，不要在 browser console eval 整段 HTML。Browser tool 只用來「探索 DOM 結構與看 W3Schools 怎麼寫 JS」，實際抓資料用 Node。

### Quiz 用 Node fetch 而非 Playwright 的原因

`save-w3c-quiz.ts` (在外部 repo) 用 Playwright 開瀏覽器。`scripts/scrape_quiz.js` 用 Node `fetch` + 手動帶 `Cookie` header。後者更輕量，邏輯一樣（form POST + parse next-question HTML）。除非 W3Schools 改成 SPA，否則別退回 Playwright。

## JSON Schemas（簡）

- **Challenge** (`{language, topics: {topic: [{id, intro, starter, solution, requirements: [{type:"regex", pattern, flags, linePattern, label}], commonMistakes}]}}`)
  - `requirements[].pattern` = 嚴格 regex（決定 checkmark 是否打勾）；`linePattern` = 寬鬆 regex（"使用者有沒有寫過這行"）
  - 完整 checklist 機制分析在 `docs/w3schools-checklist.md`
- **Exercise** (`{language, topics: {topic: [...]}}`) 三種題型混合：
  - `{question, options, correct: number}` — mcq
  - `{fillintheblanks: "exercise_X.htm"}` — 字串引用外部模板，**沒展開**。要展開要 fetch 那個 .htm 檔，抽 `<p>` (prompt) + `<div id="assignmentcode">` (含 @() 占位符) + `<div id="correctcode">` (正解)
  - `{draganddroptext, draganddropquestion, options, correct: number[]}` — dragdrop
- **Quiz** (`{test, total, questions: [{number, question, options: [{value, text}], correct}]}`)
  - `option.value` 是 server 端 randomized id，每次重抓會變。穩定識別只能用 `option.text`

## File Layout

```
.
├── README.md
├── CLAUDE.md
├── data/
│   ├── w3s-<lang>-{challenges,exercises,quiz}.json   # 主資料（題目原文 + 翻譯內嵌）
│   ├── translations.json                              # 翻譯 backup（一次性匯出，現已 sync 到主 JSON）
│   └── fitb-cache.json                                # fillintheblanks 外部 .htm 模板快取
├── scripts/
│   ├── eval_challenges.js                             # 抓 challenges
│   ├── eval_exercises.js                              # 抓 exercises (HTML/CSS/JS/C/Node.js/SQL/Git)（重抓會 preserve prompt_zh）
│   ├── scrape_vue_exercises.js                        # 抓 Vue exercises（每題獨立 HTML 頁，特殊結構）
│   ├── scrape_quiz.js                                 # 抓 quiz（重抓會 preserve prompt_zh + correct）
│   ├── build-handout-mapping.js                       # 生 docs/handout-mapping.md（從主 JSON 讀翻譯）
│   ├── list-untranslated.js                           # 列出缺 prompt_zh 的題目
│   ├── migrate-translations-to-json.js                # 一次性：translations.json → 主 JSON
│   └── extract-translations-from-md.js                # 一次性：markdown → translations.json
└── docs/
    ├── w3schools-checklist.md                         # checklist 機制深度分析
    └── handout-mapping.md                             # 兩份 Notion 講義 → W3Schools 題目對照（含 zh-tw）
```

## Translation flow (zh-tw)

**翻譯直接內嵌在每題 JSON**，每題自包含。重抓爬蟲會自動 preserve 既有翻譯（用 `url` 為 key）。

每題 JSON 的翻譯欄位：

```jsonc
// exercises
{
  "question": "What is Express.js?",
  "options": [...],
  "correct": 1,
  "url": "https://www.w3schools.com/nodejs/exercise.asp?x=xrcise_express1",
  "prompt_zh": "Express.js 是什麼？",        // ← 題目翻譯
  "answer_zh": "Node.js 最熱門的網頁應用程式框架"  // ← MCQ 答案翻譯
}

// quiz
{
  "number": 5,
  "question": "How do you access query parameters...",
  "options": [{ "value": 1, "text": "req.query" }, ...],
  "correct": 1,
  "url": "https://...quiztest...?qtest=NODEJS",
  "prompt_zh": "Express.js 中如何存取 query parameters？",
  "options_translations": [          // ← 每選項翻譯
    { "text_en": "req.query", "text_zh": "...", "correct": true },
    ...
  ]
}
```

### 抓新題目時的翻譯責任

**抓題目時要順便翻譯。** 流程：

1. 跑爬蟲：`node scripts/eval_exercises.js <lang> <inputDir> data/w3s-<lang>-exercises.json <urlPrefix>` 或 `node scripts/scrape_quiz.js <TEST>`
   - 既有題目的 `prompt_zh` / `answer_zh` 會自動保留（按 `url` 比對）
2. 看新題目：`node scripts/list-untranslated.js <lang>` 列出缺翻譯的題目（含 url + 英文題目）
3. 為新題目補翻譯：
   - **手動翻譯**（quiz 等少量題目，或要精準對講義術語）：用 `scripts/dump-untranslated.js` 抽到 `/tmp/w3s_translate/<lang>-<type>.json`，填好 `prompt_zh` / `answer_zh` / `options_translations` 後跑 `scripts/apply-translations.js` 套回主 JSON
   - **LLM 自動翻譯**（exercises 大量題目）：`ANTHROPIC_API_KEY=... node scripts/translate-with-claude.js <lang> [topic]`，會直接在主 JSON 內補 prompt_zh/answer_zh 並每批存檔（可中斷續跑）
4. 重新生成 markdown：`node scripts/build-handout-mapping.js`
   - 應該顯示 `missing translations: 0`

### 翻譯品質要求

- **`prompt_zh`**：題目主文翻譯，**必填**
- **`answer_zh`**：MCQ 正解翻譯。語法/程式碼類答案（如 `app.listen()`、`req.query`）可省略
- **`options_translations[].text_zh`**：純語法的選項可填 `null`；解釋型選項一定要翻
- 程式碼、API 名稱、SDK 函式名保持原文（如 `app.use()` 不譯）

### 為什麼這樣設計

- **每題自包含**：給人讀 / 餵 LLM / 匯出他用都不需要 cross-file lookup
- **重抓不丟翻譯**：爬蟲腳本內建 `buildTranslationMap()` / `mergeOldTranslations()`，從舊 JSON 讀翻譯按 url merge
- **`translations.json` 現為 backup**：歷史上是主來源（從 `extract-translations-from-md.js` 抽的），現已用 `migrate-translations-to-json.js` sync 到主 JSON。可保留作為歸檔，但編輯應改主 JSON

## 命名約定

JSON 檔一律 `w3s-<lang>-<type>.json` 前綴（`w3s` = W3Schools）。歷史上曾用過 `w3c-` 前綴，已全部改為 `w3s-`，重抓腳本也指向新前綴 — 別再生 `w3c-*.json`。
