/**
 * 從 data/w3s-*-exercises.json + data/w3s-nodejs-quiz.json + data/translations.json
 * 合併生成 docs/handout-mapping.md。
 *
 * 翻譯持久化在 data/translations.json，重抓題目不影響翻譯。
 *
 * 用法：node scripts/build-handout-mapping.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');

const ndj = JSON.parse(fs.readFileSync(path.join(D, 'w3s-nodejs-exercises.json'), 'utf8'));
const html = JSON.parse(fs.readFileSync(path.join(D, 'w3s-html-exercises.json'), 'utf8'));
const js = JSON.parse(fs.readFileSync(path.join(D, 'w3s-js-exercises.json'), 'utf8'));
const ndjQuiz = JSON.parse(fs.readFileSync(path.join(D, 'w3s-nodejs-quiz.json'), 'utf8'));

// fillintheblanks .htm 模板 cache (URL slug → {prompt, code, solution})
const FITB_CACHE_FILE = path.join(D, 'fitb-cache.json');
const FITB_CACHE = fs.existsSync(FITB_CACHE_FILE)
  ? JSON.parse(fs.readFileSync(FITB_CACHE_FILE, 'utf8'))
  : {};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121';

const LANG_FROM_URL = (url) => {
  const m = url.match(/w3schools\.com\/(html|css|js|nodejs|c)\//);
  return m ? m[1] : null;
};

async function fetchFitb(htmFile, lang) {
  const cacheKey = `${lang}/${htmFile}`;
  if (FITB_CACHE[cacheKey]) return FITB_CACHE[cacheKey];
  const url = `https://www.w3schools.com/${lang}/${htmFile}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const h = await r.text();
    const promptM = h.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const codeM = h.match(/<div id="assignmentcode">([\s\S]*?)<\/div>/);
    const solM = h.match(/<div id="correctcode">([\s\S]*?)<\/div>/);
    const result = {
      prompt: promptM ? promptM[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '',
      code: codeM ? codeM[1].trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '',
      solution: solM ? solM[1].trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '',
    };
    FITB_CACHE[cacheKey] = result;
    return result;
  } catch { return null; }
}

const decode = s => (s || '')
  .replace(/<br\s*\/?\s*>/gi, ' / ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

const stripTags = s => decode(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function fmtQuestion(q) {
  // returns { type, prompt, detail, url, zh }
  // 翻譯直接從題目本身讀（重抓會 preserve）
  let result = { url: q.url, zh: q.prompt_zh || null, answerZh: q.answer_zh || null };

  if (q.fillintheblanks) {
    result.type = 'FILL';
    const lang = LANG_FROM_URL(q.url);
    const data = lang ? await fetchFitb(q.fillintheblanks, lang) : null;
    result.prompt = data?.prompt || `(填空題：${q.fillintheblanks})`;
    result.detail = data?.code
      ? '`' + data.code.split('\n').filter(Boolean).join(' / ').slice(0, 100) + '`'
      : '';
  } else if (q.draganddropquestion) {
    result.type = 'DND';
    result.prompt = stripTags(q.draganddropquestion);
    if (q.options) {
      result.detail = '選項：' + q.options.map(o => `\`${stripTags(o)}\``).join(', ');
    }
  } else if (q.question) {
    result.type = 'MCQ';
    result.prompt = stripTags(q.question);
    const opts = (q.options || []).map(o => stripTags(o));
    if (typeof q.correct === 'number' && opts[q.correct]) {
      result.detail = `**答案：${opts[q.correct]}**`;
      result.answerEn = opts[q.correct];
    }
  } else {
    result.type = 'UNKNOWN';
    result.prompt = '';
    result.detail = '';
  }
  return result;
}

const SECTIONS = [
  {
    handout: '講義 1：Todo List Web API (get/post)',
    notion: 'https://www.notion.so/mcliu/Todo-List-Web-API-get-post-3494d6634bf680aabe60eb05bb3544e5',
    groups: [
      { theme: '為什麼設計 API / API First', topics: [], note: '概念性章節，無對應練習題。可以閱讀 Q4 (Quiz)。' },
      { theme: '建立 Express 專案 / 啟動 server', source: ndj, topics: ['express', 'get_started', 'intro'] },
      { theme: 'Express 路由 (app.get / app.post)', source: ndj, topics: ['rest_api'] },
      { theme: 'HTTP 概念 / 狀態碼 / 方法 (GET/POST/PUT/DELETE)', source: ndj, topics: ['http', 'https'] },
      { theme: '回應方法 (res.send / res.json / res.sendFile)', source: ndj, topics: ['rest_api'], note: '與「Express 路由」共用題目，可重做以強化 res 物件用法。' },
      { theme: '中介軟體 (express.json() / app.use)', source: ndj, topics: ['middleware'] },
      { theme: '讀取 GET query 與 POST body', source: ndj, topics: ['middleware', 'rest_api'], note: '同上，重點放在 req.query / req.body 對照。' },
      { theme: '前端 fetch + async/await', source: ndj, topics: ['async', 'async_await', 'promises'] },
      { theme: '模組系統 (type:module / import)', source: ndj, topics: ['modules_esm', 'modules'] },
      { theme: 'NPM / package.json', source: ndj, topics: ['npm', 'package_json'] },
    ],
  },
  {
    handout: '講義 2：Express + SQLite（電影台詞）',
    notion: 'https://www.notion.so/mcliu/Express-JS-SQLite-3514d6634bf680d8b6a2f47ba606796b',
    groups: [
      { theme: '建立 SQLite table (CREATE TABLE)', source: ndj, topics: ['mysql_create_table'], note: 'W3Schools 沒 SQLite 專屬 topic，但 MySQL CRUD 概念 100% 可遷移' },
      { theme: '新增資料 (INSERT)', source: ndj, topics: ['mysql_insert'] },
      { theme: '查詢資料 (SELECT + WHERE / LIKE)', source: ndj, topics: ['mysql_select', 'mysql_where'] },
      { theme: '更新資料 (UPDATE 票數+1)', source: ndj, topics: ['mysql_update'] },
      { theme: '排序與分頁 (ORDER BY / LIMIT)', source: ndj, topics: ['mysql_orderby', 'mysql_limit'] },
      { theme: '刪除資料 (DELETE)', source: ndj, topics: ['mysql_delete'] },
      { theme: 'MySQL 連線基礎（觀念遷移到 sqlite3）', source: ndj, topics: ['mysql', 'mysql_create_db'] },
      { theme: '檔案系統（資料庫檔位置）', source: ndj, topics: ['filesystem'] },
      { theme: 'HTML 表單 (form 標籤 / submit)', source: html, topics: ['forms', 'form_elements', 'form_input_types', 'forms_attributes'] },
      { theme: 'fetch + 表單提交 (POST + JSON.stringify)', source: js, topics: ['json'] },
      { theme: 'CORS / 同源政策', topics: [], note: 'W3Schools 沒對應 topic，可看 MDN「Same-origin policy」。' },
    ],
  },
];

const QUIZ_RELEVANT = [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 21, 22];

async function main() {
const out = [];
out.push('# Notion 講義 → W3Schools 題目對照表');
out.push('');
out.push('兩份 Notion 講義主題對應到 `data/w3s-*-exercises.json` 與 `data/w3s-nodejs-quiz.json` 的具體題目。');
out.push('每題附 W3Schools URL（可直接點過去寫程式）以及繁體中文翻譯。');
out.push('');
out.push('題型說明：**MCQ** 多選題（含答案）／ **FILL** 填空（補完程式碼）／ **DND** 拖拉填空。');
out.push('每題下方 `🌏` 為中文翻譯（持久化在 `data/translations.json`）。');
out.push('');

const missingTranslations = [];

for (const section of SECTIONS) {
  out.push(`## ${section.handout}`);
  out.push('');
  out.push(`Notion 連結：[${section.handout}](${section.notion})`);
  out.push('');

  for (const g of section.groups) {
    out.push(`### ${g.theme}`);
    out.push('');
    if (g.note) {
      out.push(`> ${g.note}`);
      out.push('');
    }
    if (!g.topics?.length) continue;

    for (const topic of g.topics) {
      const arr = g.source.topics[topic];
      if (!Array.isArray(arr)) continue;
      out.push(`**\`xrcise_${topic}\`** (${arr.length} 題)`);
      out.push('');
      for (let i = 0; i < arr.length; i++) {
        const f = await fmtQuestion(arr[i]);
        const promptShort = f.prompt.slice(0, 200);
        out.push(`- [${f.type}] ${promptShort}  [→ 開啟](${f.url})`);
        if (f.zh) {
          out.push(`  - 🌏 ${f.zh}`);
        } else {
          out.push(`  - 🌏 _(待翻譯)_`);
          missingTranslations.push(f.url);
        }
        if (f.detail) {
          out.push(`  - ${f.detail}`);
          if (f.answerEn && f.answerZh) out.push(`    - 🌏 ${f.answerZh}`);
        }
      }
      out.push('');
    }
  }
}

out.push('---');
out.push('');
out.push('## Node.js Quiz：對應講義知識點的 13 題');
out.push('');
out.push(`Quiz 連結：${ndjQuiz.questions[0].url}（25 題連續做完才能交卷）`);
out.push('');
const QUIZ_BASE = ndjQuiz.questions[0].url;
for (const num of QUIZ_RELEVANT) {
  const q = ndjQuiz.questions[num - 1];
  if (!q) continue;
  out.push(`- **Q${num}** ${stripTags(q.question)}`);
  if (q.prompt_zh) out.push(`  - 🌏 ${q.prompt_zh}`);
  else { out.push(`  - 🌏 _(待翻譯)_`); missingTranslations.push(`${QUIZ_BASE}#q${num}`); }
  const transOpts = q.options_translations || [];
  for (const opt of q.options) {
    const optEn = stripTags(opt.text);
    const optTrans = transOpts.find(o => o.text_en === optEn);
    const isCorrect = optTrans?.correct ?? (q.correct === opt.value);
    const prefix = isCorrect ? `**${optEn}** ✓` : optEn;
    const zh = optTrans?.text_zh ? ` 　🌏 ${optTrans.text_zh}` : '';
    out.push(`  - ${prefix}${zh}`);
  }
}
out.push('');

out.push('---');
out.push('');
out.push('## 推薦練習順序');
out.push('');
out.push('1. **後端骨架**：`xrcise_express` → `xrcise_http` → `xrcise_rest_api`');
out.push('2. **解析請求**：`xrcise_middleware`（req.body / express.json()）');
out.push('3. **前端串接**：`xrcise_promises` → `xrcise_async_await`（fetch）');
out.push('4. **HTML 表單**：`xrcise_forms` → `xrcise_form_elements` → `xrcise_form_input_types`');
out.push('5. **資料庫 CRUD**：`xrcise_mysql_create_table` → `_insert` → `_select` → `_where` → `_update`');
out.push('6. **模組系統**：`xrcise_modules_esm`（對應講義「type 改成 module」）');
out.push('7. **綜合驗收**：上方列出的 Node.js Quiz 13 題');

const result = out.join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'docs/handout-mapping.md'), result);
fs.writeFileSync(FITB_CACHE_FILE, JSON.stringify(FITB_CACHE, null, 2) + '\n');
console.log(`wrote: docs/handout-mapping.md (${result.length} chars)`);
console.log(`fitb cache: ${Object.keys(FITB_CACHE).length} entries → ${FITB_CACHE_FILE}`);
console.log(`missing translations: ${missingTranslations.length}`);
if (missingTranslations.length && missingTranslations.length < 20) {
  console.log('  missing URLs:');
  missingTranslations.forEach(u => console.log(`    ${u}`));
}
}

main().catch(e => { console.error(e); process.exit(1); });
