/**
 * 從 docs/handout-mapping.md 抽出 (url, prompt_zh, answer_zh, dnd-options-zh)
 * 寫入 data/translations.json，作為翻譯的持久化來源。
 *
 * 重抓題目時 JSON 會被覆寫，但 translations.json 保留 — markdown 生成時 merge by url。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MD = path.join(ROOT, 'docs/handout-mapping.md');
const OUT = path.join(ROOT, 'data/translations.json');

const md = fs.readFileSync(MD, 'utf8');
const lines = md.split('\n');

const translations = {};
let pendingUrl = null;
let pendingItem = null;
let lastTopLevel = null;

const URL_RE = /\[→ 開啟\]\((https?:\/\/[^)]+)\)/;
const ZH_RE = /^(\s*-\s*)🌏\s*(.+?)$/;
const ANSWER_RE = /^\s*-\s*\*\*答案：(.+?)\*\*/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // top-level item with url
  const urlMatch = line.match(URL_RE);
  if (urlMatch && (line.startsWith('- ') || line.startsWith('  -'))) {
    // commit previous pending item
    if (pendingUrl && pendingItem) {
      translations[pendingUrl] = pendingItem;
    }
    pendingUrl = urlMatch[1];
    pendingItem = {};
    lastTopLevel = 'prompt';
    continue;
  }

  if (!pendingUrl) continue;

  // detect indent level
  const indent = (line.match(/^(\s*)/) || [''])[1].length;

  // 🌏 line
  const zhMatch = line.match(ZH_RE);
  if (zhMatch) {
    const zh = zhMatch[2].trim();
    // 判斷是 prompt 翻譯還是 answer 翻譯：
    // - indent < 4 是 prompt 層
    // - indent >= 4 (在 **答案：** 下方) 是 answer 翻譯
    if (indent >= 4) {
      pendingItem.answer_zh = zh;
    } else {
      // prompt_zh 只取第一個出現的（題目主翻譯）
      if (!pendingItem.prompt_zh) pendingItem.prompt_zh = zh;
      else if (!pendingItem.note_zh) pendingItem.note_zh = zh;
    }
    continue;
  }

  // **答案：xxx** line
  const ansMatch = line.match(ANSWER_RE);
  if (ansMatch) {
    pendingItem.answer_en = ansMatch[1].trim();
    continue;
  }

  // 進入新的 - bullet 但沒 url 的情況：可能是 quiz options（無 url），略過此 commit
  if (/^- \*\*Q\d+\*\*/.test(line)) {
    if (pendingUrl && pendingItem) {
      translations[pendingUrl] = pendingItem;
      pendingUrl = null;
      pendingItem = null;
    }
  }
}

// final commit
if (pendingUrl && pendingItem) {
  translations[pendingUrl] = pendingItem;
}

// === 額外處理：Quiz 題目（沒 url 但有 Q 編號），用 base url + #qN 為 key ===
const QUIZ_BASE = 'https://www.w3schools.com/quiztest/quiztest.asp?qtest=NODEJS';
const quizSection = md.match(/## Node\.js Quiz：[\s\S]+?(?=^---|\Z)/m);
if (quizSection) {
  const block = quizSection[0];
  const re = /\*\*Q(\d+)\*\*\s+(.+?)\n\s*-\s*🌏\s*(.+?)\n([\s\S]*?)(?=\n- \*\*Q\d+\*\*|\n\n|---)/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const qn = parseInt(m[1]);
    const promptEn = m[2].trim();
    const promptZh = m[3].trim();
    const optsBlock = m[4];

    // 抽選項：每行  - text   🌏 翻譯  或 - **text** ✓
    const options = [];
    for (const optLine of optsBlock.split('\n')) {
      const o = optLine.match(/^\s*-\s*(?:\*\*)?(.+?)(?:\*\*)?(\s*✓)?\s*(?:　🌏\s*(.+?))?$/);
      if (!o) continue;
      const txt = o[1].trim().replace(/^\*\*|\*\*$/g, '');
      if (!txt || txt.startsWith('🌏')) continue;
      options.push({
        text_en: txt,
        text_zh: o[3] ? o[3].trim() : null,
        correct: !!o[2],
      });
    }

    translations[`${QUIZ_BASE}#q${qn}`] = {
      prompt_en: promptEn,
      prompt_zh: promptZh,
      options,
    };
  }
}

// 排序 keys 方便 diff
const sortedKeys = Object.keys(translations).sort();
const sorted = {};
for (const k of sortedKeys) sorted[k] = translations[k];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');

const exerciseCount = Object.keys(sorted).filter(k => !k.includes('#q')).length;
const quizCount = Object.keys(sorted).filter(k => k.includes('#q')).length;
console.log(`extracted: exercise translations=${exerciseCount} quiz=${quizCount}`);
console.log(`wrote: ${OUT}`);
