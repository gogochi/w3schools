# W3Schools Challenge Checklist 實作分析

來源：https://www.w3schools.com/html/html_challenges_elements.asp

## 核心概念

「Checklist」不是真的 checkbox UI，而是按下 **Check Code** 按鈕後，
用 **regex 比對 textarea 字串** 來判斷每個任務是否完成，再把結果動態插入 `<ul>`。

判斷單位 = 一個 `requirement` 物件，每個對應一個檢查點。

## 資料結構

W3Schools 把每道題目的判斷規則放在 `window.CHALLENGE_DATA.challenges[id]`：

```js
{
  id: "elements_nesting",
  starter: "<!DOCTYPE html>\n<html>\n<body>\n\n<h1>My First Heading\n\n<!-- Add a paragraph here -->\n\n</html>\n",
  solution: "<!DOCTYPE html>\n<html>\n<body>\n\n<h1>My First Heading</h1>\n\n<p>My first<br> paragraph.</p>\n\n</body>\n</html>\n",

  requirements: [
    {
      id: "hasH1Close",
      type: "regex",
      pattern: "<h1>\\s*My First Heading\\s*</h1>",  // 嚴格：用來判定打勾
      flags: "i",
      linePattern: "</h1>",                          // 寬鬆：判斷使用者是否寫過這行
      lineFlags: "i",
      label: "Close the <h1> element with the correct end tag"
    },
    {
      id: "hasP",
      type: "regex",
      pattern: "<p>[\\s\\S]*My first[\\s\\S]*paragraph\\.[\\s\\S]*</p>",
      flags: "i",
      linePattern: "<p>",
      lineFlags: "i",
      label: "Add a <p> element with the text My first paragraph."
    },
    {
      id: "hasBr",
      type: "regex",
      pattern: "first\\s*<br\\s*/?>",
      flags: "i",
      linePattern: "<br",
      lineFlags: "i",
      label: "Inside the paragraph, add a <br> after the word first"
    },
    {
      id: "hasBodyClose",
      type: "regex",
      pattern: "<body>[\\s\\S]*</body>",
      flags: "i",
      linePattern: "</body>",
      lineFlags: "i",
      label: "Close the <body> element with the correct end tag"
    }
  ],

  commonMistakes: [
    {
      pattern: "<h1>My First Heading[^<]*<p>",   // 忘記 </h1> 直接接 <p>
      flags: "i",
      msg: "..."
    },
    {
      pattern: "</html>[\\s\\S]*</body>",         // </body> 寫在 </html> 後面
      flags: "i",
      msg: "..."
    }
  ]
}
```

### 兩條 regex 的角色

| 欄位 | 用途 |
|---|---|
| `pattern` | 嚴格判定，通過才打勾（綠色 ✓） |
| `linePattern` | 寬鬆判定，使用者「有寫到相關語法」即觸發。可以用來顯示 partial / hint，或在 commonMistakes 觸發前先確認「真的有寫」 |

`[\s\S]*` 是常用技巧：因為 JS regex 的 `.` 預設不匹配 `\n`，
要跨行比對就用 `[\s\S]*`（任意字元，含換行）。

## DOM 結構

```html
<div class="ch-card">

  <!-- 左側：題目說明 + 上方 ol（4 個提示步驟） -->
  <div class="ch-split">
    <div class="ch-instructions">
      <div class="ch-instr-head"></div>
      <div class="ch-meta">
        <ol>
          <li>Close the &lt;h1&gt; element ...</li>
          <li>Add a &lt;p&gt; element ...</li>
          <li>Inside the paragraph ...</li>
          <li>Close the &lt;body&gt; element ...</li>
        </ol>
      </div>
    </div>
  </div>

  <!-- 右側：編輯器 + 預覽 -->
  <div class="ch-editor-preview-grid">
    <div class="ch-workarea">
      <div class="ch-toolbar">
        <button class="ch-tab active">HTML</button>
        <button class="ch-btn ch-btn-primary">Check Code</button>
      </div>
      <textarea id="ta_elements_nesting" class="c-editor-input"></textarea>
    </div>
    <div class="ch-runner-wrap" id="chRunnerWrap">
      <iframe id="chRunnerIframe"></iframe>
    </div>
  </div>

  <!-- 解答區（一開始隱藏） -->
  <div class="ch-solutionbox" id="sol_elements_nesting"></div>

  <!-- 通過後的總結 -->
  <div class="ch-summary" id="sum_elements_nesting"></div>

  <!-- 下方 Checklist：按下 Check Code 後才 display:block -->
  <div class="ch-checkwrap" id="checkwrap_elements_nesting" style="display:none">
    <h4>Checklist</h4>
    <ul id="list_elements_nesting">
      <!-- JS 動態 append：
        <li class="pass">Close &lt;h1&gt; ...</li>
        <li class="fail">Add &lt;p&gt; ...</li>
      -->
    </ul>
  </div>

</div>
```

關鍵 class / id：
- `.ch-meta ol` — 上方提示步驟（靜態，題目給的）
- `.ch-checkwrap` — 結果 Checklist 容器，預設 `display:none`
- `#list_elements_nesting` — 動態填入結果的 `<ul>`
- `.ch-btn-primary` — Check Code 按鈕

## 檢查流程

按下 Check Code 時，`ChallengeEngine` 大致做：

```js
function check(challengeId) {
  const ch = CHALLENGE_DATA.challenges[challengeId];
  const code = document.querySelector(`#ta_${challengeId}`).value;

  // 1. 先掃 commonMistakes 顯示專屬錯誤訊息（可選）
  for (const m of ch.commonMistakes || []) {
    if (new RegExp(m.pattern, m.flags).test(code)) {
      showHint(m.msg);
    }
  }

  // 2. 對每條 requirement 跑 regex
  const ul = document.querySelector(`#list_${challengeId}`);
  ul.innerHTML = '';
  let allPassed = true;

  for (const r of ch.requirements) {
    const passed = new RegExp(r.pattern, r.flags).test(code);
    if (!passed) allPassed = false;

    const li = document.createElement('li');
    li.className = passed ? 'pass' : 'fail';
    li.textContent = r.label;
    ul.appendChild(li);
  }

  // 3. 顯示 Checklist 區塊
  document.querySelector(`#checkwrap_${challengeId}`).style.display = '';

  // 4. 全通過則顯示 summary、解鎖下一題
  if (allPassed) showSummary(challengeId);

  // 5. 同時把 code 注入預覽 iframe（runner）
  document.querySelector('#chRunnerIframe').srcdoc = code;
}
```

實際 `ChallengeEngine` 還做：
- `highlightCode` — 把錯誤 / 通過的行用 `linePattern` 對照後加底色
- `persistChecklist` — 用 localStorage 記住通過狀態（重新整理後保留）
- `setEditorDisabled` — 通過後鎖定編輯器

## 自己實作的最小範本

只需要：
1. 一份 challenges JSON
2. 一個 `checkCode()` 函式
3. 兩段 CSS（pass / fail 樣式）

### HTML

```html
<div class="ch-card">
  <div class="ch-meta">
    <ol id="instructions"></ol>
  </div>

  <textarea id="editor"></textarea>
  <button id="checkBtn">Check Code</button>
  <iframe id="preview"></iframe>

  <div class="ch-checkwrap" id="checkwrap" hidden>
    <h4>Checklist</h4>
    <ul id="checklist"></ul>
  </div>
</div>
```

### JS

```js
const challenge = {
  id: "demo",
  starter: "<!DOCTYPE html>\n<html>\n<body>\n\n<h1>My First Heading\n\n</html>\n",
  requirements: [
    { id: "h1",   label: "Close <h1>",        pattern: /<h1>\s*My First Heading\s*<\/h1>/i },
    { id: "p",    label: "Add <p>",            pattern: /<p>[\s\S]*My first[\s\S]*paragraph\.[\s\S]*<\/p>/i },
    { id: "br",   label: "<br> after first",   pattern: /first\s*<br\s*\/?>/i },
    { id: "body", label: "Close <body>",       pattern: /<body>[\s\S]*<\/body>/i },
  ],
};

const editor = document.querySelector('#editor');
const ol = document.querySelector('#instructions');
const ul = document.querySelector('#checklist');
const wrap = document.querySelector('#checkwrap');

editor.value = challenge.starter;
challenge.requirements.forEach(r => {
  const li = document.createElement('li');
  li.textContent = r.label;
  ol.appendChild(li);
});

document.querySelector('#checkBtn').addEventListener('click', () => {
  const code = editor.value;
  ul.innerHTML = '';
  for (const r of challenge.requirements) {
    const passed = r.pattern.test(code);
    const li = document.createElement('li');
    li.className = passed ? 'pass' : 'fail';
    li.textContent = r.label;
    ul.appendChild(li);
  }
  wrap.hidden = false;
  document.querySelector('#preview').srcdoc = code;
});
```

### CSS

```css
#checklist { list-style: none; padding: 0; }
#checklist li {
  padding: 6px 6px 6px 28px;
  position: relative;
  border-bottom: 1px solid #eee;
}
#checklist li::before {
  position: absolute;
  left: 6px;
  font-weight: bold;
}
#checklist li.pass::before { content: "✓"; color: #2ecc71; }
#checklist li.fail::before { content: "✗"; color: #e74c3c; }
#checklist li.pass { color: #2c3e50; }
#checklist li.fail { color: #999; }
```

## 設計重點 / 自己做的時候注意

1. **題目說明 vs 結果 Checklist 是兩塊**
   - 上方 `<ol>`（永遠顯示）= 任務描述
   - 下方 `<ul>`（按 Check 後才顯示）= 通過 / 失敗結果
   - W3Schools 的 `label` 在這兩處共用同一句

2. **regex 寫法**
   - 一律 `i` flag（不分大小寫）
   - 跨行用 `[\s\S]*` 而非 `.*`
   - 自閉合彈性 `<br\s*/?>` 同時相容 `<br>`、`<br/>`、`<br />`
   - 內容彈性 `My first[\s\S]*paragraph\.` 允許中間插入 `<br>`

3. **存題庫**
   - 別寫死在 JS 檔，建議用 JSON：`/challenges/elements_nesting.json`
   - 每題包含：`id`、`starter`、`solution`、`requirements[]`、`commonMistakes[]`、`intro` (HTML)、`title`

4. **state 管理**
   - 通過狀態用 `localStorage` 存：`checklist:elements_nesting = {h1:true,p:true,...}`
   - 全部 requirements 通過 → 顯示 summary、解鎖下一題

5. **預覽機制**
   - 用 `<iframe>.srcdoc = code` 即可即時渲染（沙箱化）
   - 加 `sandbox="allow-scripts"` 等屬性視需要

6. **編輯器**
   - W3Schools 用普通 `<textarea>` + 自製語法高亮
   - 想升級可換 CodeMirror 或 Monaco
   - 但 textarea 已能滿足 80% 場景

## 其他可用的判斷類型（W3Schools 沒用，但自己做時可加）

```js
{ type: "regex",  pattern: /.../, flags: "i" }              // 字串比對
{ type: "dom",    selector: "p",   minCount: 1 }            // DOM 解析後判斷
{ type: "domText", selector: "p",  text: "My first ..." }   // 元素文字內容
{ type: "domAttr", selector: "img", attr: "alt" }           // 屬性檢查
{ type: "fn",     check: (code, doc) => boolean }           // 自訂 fn
```

DOM 類型比 regex 嚴謹（不會被空格、換行、屬性順序影響），
但實作成本高（要 `DOMParser` 解析）。W3Schools 選 regex 是因為更容易撰寫題目。

## 參考檔案位置

- 專案 challenge 練習目錄：`HTML/Challenge/`、`CSS/Challenge/`
- 自己實作時可放：`HTML/Challenge/checklist-engine.js` + `challenges/*.json`
