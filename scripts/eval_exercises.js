const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Build a map of url → existing translation from the previous JSON,
// so re-scrape doesn't blow away prompt_zh / answer_zh.
function buildTranslationMap(outFile) {
  const map = new Map();
  if (!fs.existsSync(outFile)) return map;
  try {
    const old = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    for (const arr of Object.values(old.topics || {})) {
      if (!Array.isArray(arr)) continue;
      for (const q of arr) {
        if (!q.url) continue;
        const trans = {};
        if (q.prompt_zh) trans.prompt_zh = q.prompt_zh;
        if (q.answer_zh) trans.answer_zh = q.answer_zh;
        if (q.options_translations) trans.options_translations = q.options_translations;
        if (Object.keys(trans).length) map.set(q.url, trans);
      }
    }
  } catch (e) {
    console.warn(`[warn] could not load existing translations from ${outFile}: ${e.message}`);
  }
  return map;
}

function compileDir(dir, language, urlPrefix, transMap) {
  const out = { language, topics: {} };
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  for (const f of files) {
    const baseKey = f.replace(/\.js$/, '');           // e.g. "xrcise_intro"
    const topic = baseKey.replace(/^xrcise_/, '');    // e.g. "intro"
    let src = fs.readFileSync(path.join(dir, f), 'utf8');
    // 把 `const qobjects` / `let qobjects` 改成裸賦值，讓 sandbox 抓得到
    src = src.replace(/^\s*(const|let|var)\s+qobjects\s*=/m, 'qobjects =');
    const sandbox = { window: {}, console };
    sandbox.window.window = sandbox.window;
    try {
      vm.runInNewContext(src, sandbox, { filename: f, timeout: 5000 });
      const arr = sandbox.qobjects || sandbox.window.qobjects;
      if (!Array.isArray(arr)) {
        out.topics[topic] = { error: 'no qobjects array', sandboxKeys: Object.keys(sandbox).filter(k => k !== 'window' && k !== 'console') };
        continue;
      }
      out.topics[topic] = arr.map((q, i) => {
        const url = urlPrefix ? `${urlPrefix}${baseKey}${i + 1}` : undefined;
        const merged = url ? { ...q, url } : { ...q };
        // preserve any pre-existing translation from previous JSON
        if (url && transMap?.has(url)) Object.assign(merged, transMap.get(url));
        return merged;
      });
    } catch (e) {
      out.topics[topic] = { error: e.message };
    }
  }
  return out;
}

// Usage: node eval_exercises.js <lang> <inputDir> <outFile> [urlPrefix]
//   urlPrefix example: https://www.w3schools.com/nodejs/exercise.asp?x=
const lang = process.argv[2];
const dir = process.argv[3];
const outFile = process.argv[4];
const urlPrefix = process.argv[5] || '';
const transMap = buildTranslationMap(outFile);
const result = compileDir(dir, lang, urlPrefix, transMap);
fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
console.log(`preserved translations: ${transMap.size}`);

const topics = Object.entries(result.topics);
const errors = topics.filter(([, v]) => v.error);
const totalQ = topics.filter(([, v]) => Array.isArray(v)).reduce((s, [, a]) => s + a.length, 0);
console.log(`topics: ${topics.length}`);
console.log(`errors: ${errors.length}`);
console.log(`total questions: ${totalQ}`);
console.log(`output: ${outFile} (${fs.statSync(outFile).size} bytes)`);
if (errors.length) {
  console.log('errors:');
  for (const [k, v] of errors) console.log(`  ${k}: ${v.error}`);
}
