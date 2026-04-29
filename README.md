# W3Schools 題庫資料 (JSON)

從 W3Schools 抓下來的題庫，分三類八檔。資料抓取日期：2026-04-29。

## 檔案總覽

| File | 來源頁面 | Topics | Items | 用途 |
|---|---|---:|---:|---|
| `w3s-html-challenges.json`  | `html/html_challenges.asp`  | 36  | 36   | 寫程式碼題（regex 比對） |
| `w3s-css-challenges.json`   | `css/css_challenges.asp`    | 62  | 62   | 寫程式碼題（regex 比對） |
| `w3s-c-challenges.json`     | `c/c_challenges.php`        | 17  | 17   | 寫程式碼題（regex 比對） |
| `w3s-html-exercises.json`   | `html/html_exercises.asp`   | 51  | 190  | 多選題 / 拖拉題 / 填空題 |
| `w3s-css-exercises.json`    | `css/css_exercises.asp`     | 151 | 779  | 多選題 / 拖拉題 / 填空題 |
| `w3s-js-exercises.json`     | `js/js_exercises.asp`       | 83  | 267  | 多選題 / 拖拉題 / 填空題 |
| `w3s-c-exercises.json`      | `c/c_exercises.php`         | 58  | 291  | 多選題 / 填空題 |
| `w3s-nodejs-exercises.json` | `nodejs/nodejs_exercises.asp` | 93 | 279 | 多選題 / 拖拉題 / 填空題 |
| `w3s-html-quiz.json`        | `quiztest/quiztest.asp?qtest=HTML`   | — | 40 | 單純多選題 |
| `w3s-css-quiz.json`         | `quiztest/quiztest.asp?qtest=CSS`    | — | 25 | 單純多選題 |
| `w3s-js-quiz.json`          | `quiztest/quiztest.asp?qtest=JS`     | — | 25 | 單純多選題 |
| `w3s-c-quiz.json`           | `quiztest/quiztest.php?qtest=C`      | — | 25 | 單純多選題（**含正解**） |
| `w3s-nodejs-quiz.json`      | `quiztest/quiztest.asp?qtest=NODEJS` | — | 25 | 單純多選題 |

合計 **約 1.2 MB / 2000+ 題**。每題都帶 `url` 欄位指向 W3Schools 原頁面。

## 目錄結構

```
.
├── README.md                      # 本檔
├── data/                          # 11 個題庫 JSON（上表）
├── scripts/                       # 重抓腳本
│   ├── eval_challenges.js
│   ├── eval_exercises.js
│   └── scrape_quiz.js
└── docs/
    └── w3schools-checklist.md     # checklist 機制深度分析
```

## 三種資料 Schema

### 1. Challenges

```jsonc
{
  "language": "html",
  "topics": {
    "elements": [
      {
        "id": "elements_nesting",
        "intro": "<HTML 描述>",
        "starter": "<!DOCTYPE html>...",
        "solution": "<!DOCTYPE html>...",
        "requirements": [
          {
            "id": "hasH1Close",
            "type": "regex",
            "pattern": "<h1>\\s*My First Heading\\s*</h1>",
            "flags": "i",
            "linePattern": "</h1>",
            "lineFlags": "i",
            "label": "Close the <h1> with </h1>"
          }
        ],
        "commonMistakes": [
          { "pattern": "...", "flags": "i", "msg": "..." }
        ]
      }
    ],
    "headings": [ /* ... */ ]
  }
}
```

每個分類目前只有 1 個 challenge（W3Schools 設計就是這樣）。
完整實作說明見 `../w3schools-checklist.md`。

### 2. Exercises

支援三種題型，由 `qobj` 上的不同欄位辨識：

#### 多選題（最常見）
```jsonc
{
  "question": "What does HTML stand for?",
  "options": ["...", "...", "Hyper Text Markup Language", "..."],
  "correct": 2
}
```

#### 拖拉填空題
```jsonc
{
  "draganddropquestion": "Drag the correct property...",
  "draganddroptext": "<code>div { ___: green; }</code>",
  "options": ["bg-color", "color", "opacity", "background-color"],
  "correct": [3]
}
```

#### 填空題（少見）
```jsonc
{
  "fillintheblanks": true,
  "question": "...",
  "correct": ["..."]
}
```

`correct` 欄位：多選題是 0-based 索引；拖拉題是索引陣列；填空是字串陣列。

### 3. Quiz

```jsonc
{
  "test": "HTML",
  "total": 40,
  "questions": [
    {
      "number": 1,
      "question": "What does HTML stand for?",
      "options": [
        { "value": 1, "text": "Home Tool Markup Language" },
        { "value": 2, "text": "Hyperlinks and Text Markup Language" },
        { "value": 3, "text": "Hyper Text Markup Language" }
      ],
      "correct": null
    }
  ]
}
```

> ⚠️ **正確答案 (`correct`) 預設為 null** — Quiz 系統把答案放在 server，不會回傳。
> **C quiz 例外**：`w3s-c-quiz.json` 的 25 題正解已從早期抓的扁平版本 merge 進去（用 question text 比對，全部 25 題對上）。
> 其他三個 quiz 要 1:1 重建需自行標答；對應 Exercises 中常有重疊題可對照（如「What does HTML stand for?」也在 `w3s-html-exercises.json` 的 `intro` topic）。

`option.value` 是原本 server 端的編號（不是 index），有時會被打亂順序。如果只在意 text 內容可以忽略 value。

## 資料來源拆解

W3Schools 把題庫存在以下檔案位置（純 JS 變數）：

```
# Challenges
https://www.w3schools.com/<lang>/<lang>_challenge_<topic>.js
  → window.CHALLENGE_DATA = { challenges: [...] }

# Exercises
https://www.w3schools.com/<lang>/xrcise_<topic>.js
  → qobjects = [ {question, options, correct}, ... ]

# Quiz
https://www.w3schools.com/quiztest/quiztest.asp?qtest=<TEST>
  → 沒有前端題庫，每次 form POST 翻頁
```

**注意**：
- `<lang>` 用法：`html` / `css` / `js` 走 `.asp`；`c` 走 `.php`。
- Challenges 的 data 路徑用**單數** `challenge_`，但目錄頁 URL 用**複數** `challenges_`。

## 重新抓取

腳本位於 `scripts/`，採兩階段：先用 `curl` 抓原始 `.js` 到暫存目錄，再用 `eval_*.js` 編譯成 JSON。

```bash
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121'
TMP=$(mktemp -d)

# === Challenges (HTML 為例，CSS/C 同模式) ===
mkdir -p "$TMP/html_chal"
curl -sL --compressed -H "User-Agent: $UA" \
  https://www.w3schools.com/html/html_challenges.asp \
  | grep -oE 'html_challenges_[a-z_]+\.asp' | sort -u \
  | sed 's/html_challenges_//;s/\.asp//' \
  | xargs -I{} curl -sL --compressed -H "User-Agent: $UA" \
      "https://www.w3schools.com/html/html_challenge_{}.js" \
      -o "$TMP/html_chal/{}.js"
node scripts/eval_challenges.js html "$TMP/html_chal" data/w3s-html-challenges.json

# === Exercises (同模式，xrcise_<topic>.js) ===
# 用 grep 從 html_exercises.asp 抽 topic，curl 抓 xrcise_*.js，再 eval
node scripts/eval_exercises.js html "$TMP/html_ex" data/w3s-html-exercises.json

# === Quiz (form POST 翻頁，腳本內含完整流程) ===
node scripts/scrape_quiz.js HTML CSS JS C
# 輸出寫到 data/w3s-<lang>-quiz.json
```

C 的 challenges/exercises 路徑改用 `.php` 後綴（其他語言是 `.asp`）；`scrape_quiz.js` 已內建分支。

## 為什麼是 JS 檔不是 JSON

W3Schools 的 challenge / exercise 資料是**有效 JS**而非純 JSON：
- 用 `+` 字串拼接
- regex 用 literal 形式 `/.../i`
- key 沒加引號
- 字尾掛 `}` 沒分號等等

所以 parse 必須走 `vm.runInNewContext(src, sandbox)` 而不是 `JSON.parse`。
sandbox 內 `qobjects` / `window.CHALLENGE_DATA` 都會被設定。

## 已知缺漏 / 待補

- **Quiz 正解**：所有 quiz 題目的 `correct` 都是 `null`（server 端比對，無法直接抓）。
- **CSS 部分 hyphen topic**：`xrcise_z-index`、`xrcise_max-width` 等用 hyphen 命名的題庫已收進 CSS exercises（共 7 個）。
- **JavaScript challenges**：W3Schools 沒有 JS challenges 頁面，原則上不存在這份資料（題目是 exercises 的 multiple-choice 形式）。
- **Quiz options 順序**：每次 server 渲染順序可能不同（因為 value 是 server 隨機 id），但 text 內容是穩定的。

## 引用 / 重製

資料來源是 W3Schools。重製或公開使用前請確認他們的條款。
這份檔案僅作個人學習與系統設計參考用。
