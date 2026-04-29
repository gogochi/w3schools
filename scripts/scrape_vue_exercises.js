/**
 * Vue exercises 跟其他語言不同：每題一個獨立 HTML 頁面（沒有外部 .js）。
 * URL: https://www.w3schools.com/vue/exercise.php?filename=exercise_<topic><N>
 * 從首頁 sidebar 抓所有 filename 列表，再逐頁 fetch + 解析 HTML：
 *   <div id="assignmenttext"><p>...</p>      → question (prompt)
 *   <div id="assignmentcode">...             → code (含 @() 占位符)
 *   <div id="correctcode">                   → solution
 *   <div id="correctcode2/3">                → 替代正解（如大小寫不同）
 *
 * 輸出格式跟 nodejs/sql/git 對齊：{language, topics: {topic: [{question, code, solution, url, ...}]}}
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121';
const BASE = 'https://www.w3schools.com/vue/';

const decode = s => (s || '')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&');

const stripTags = s => decode(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return await r.text();
}

function parseExercisePage(html) {
  // 題目（prompt）— `<div id="assignmenttext"><p>...</p>`
  const ptxt = html.match(/<div id="assignmenttext"[^>]*>([\s\S]*?)<\/div>/);
  let prompt = '';
  if (ptxt) {
    const pm = ptxt[1].match(/<p[^>]*>([\s\S]*?)<\/p>/);
    prompt = pm ? stripTags(pm[1]) : stripTags(ptxt[1]);
  }
  const codeM = html.match(/<div id="assignmentcode"[^>]*>([\s\S]*?)<\/div>/);
  const code = codeM ? decode(codeM[1].trim()) : '';
  const solutions = [];
  const solRe = /<div id="correctcode\d*"[^>]*>([\s\S]*?)<\/div>/g;
  let sm;
  while ((sm = solRe.exec(html)) !== null) {
    solutions.push(decode(sm[1].trim()));
  }
  return { prompt, code, solution: solutions[0] || '', alternatives: solutions.slice(1) };
}

function topicFromFilename(filename) {
  // exercise_intro1 → intro / exercise_directives14 → directives / exercise_computed-properties1 → computed-properties
  const m = filename.match(/^exercise_(.+?)\d+$/);
  return m ? m[1] : filename;
}

async function main() {
  // 1. fetch index page，從 sidebar 抓 filename 列表
  const indexHtml = await fetchText(`${BASE}vue_exercises.php`);
  const startMatch = indexHtml.match(/exercise\.php\?filename=(exercise_[a-z0-9_-]+)/);
  if (!startMatch) throw new Error('cannot find first exercise link in index');

  // 2. fetch first exercise page (它的 sidebar 含完整列表)
  const firstHtml = await fetchText(`${BASE}exercise.php?filename=${startMatch[1]}`);
  const filenames = Array.from(new Set(
    [...firstHtml.matchAll(/exercise\.php\?filename=(exercise_[a-z0-9_-]+)/g)].map(m => m[1])
  )).filter(fn => /\d+$/.test(fn));

  console.log(`found ${filenames.length} exercise pages`);

  // preserve translations from existing JSON
  const outFile = path.join(ROOT, 'data', 'w3s-vue-exercises.json');
  const transMap = new Map();
  if (fs.existsSync(outFile)) {
    try {
      const old = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      for (const arr of Object.values(old.topics || {})) {
        if (!Array.isArray(arr)) continue;
        for (const q of arr) {
          if (!q.url) continue;
          const trans = {};
          if (q.prompt_zh) trans.prompt_zh = q.prompt_zh;
          if (q.answer_zh) trans.answer_zh = q.answer_zh;
          if (Object.keys(trans).length) transMap.set(q.url, trans);
        }
      }
    } catch {}
  }

  // 3. fetch each page in parallel (concurrency = 8)
  const out = { language: 'vue', topics: {} };
  const CONCURRENCY = 8;
  let idx = 0, done = 0;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= filenames.length) return;
      const fn = filenames[i];
      const url = `${BASE}exercise.php?filename=${fn}`;
      try {
        const html = await fetchText(url);
        const parsed = parseExercisePage(html);
        const topic = topicFromFilename(fn);
        if (!out.topics[topic]) out.topics[topic] = [];
        const indexNum = parseInt(fn.match(/(\d+)$/)?.[1] || '0');
        const entry = {
          fillintheblanks: true,
          question: parsed.prompt,
          code: parsed.code,
          solution: parsed.solution,
          alternatives: parsed.alternatives,
          url,
          filename: fn,
          index: indexNum,
        };
        if (transMap.has(url)) Object.assign(entry, transMap.get(url));
        out.topics[topic].push(entry);
      } catch (e) {
        console.warn(`  fail ${fn}: ${e.message}`);
      }
      done++;
      if (done % 20 === 0) console.log(`  …${done}/${filenames.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // sort each topic by index
  for (const arr of Object.values(out.topics)) arr.sort((a, b) => a.index - b.index);

  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  const total = Object.values(out.topics).reduce((s, a) => s + a.length, 0);
  console.log(`wrote ${outFile} — topics=${Object.keys(out.topics).length} total=${total} preserved=${transMap.size}`);
}

main().catch(e => { console.error(e); process.exit(1); });
