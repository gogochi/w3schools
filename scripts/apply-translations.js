/**
 * 把 /tmp/w3s_translate/<lang>-<type>.json 的翻譯寫回主 JSON。
 * 用法：node scripts/apply-translations.js nodejs quiz
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');
const SRC_DIR = '/tmp/w3s_translate';

const lang = process.argv[2];
const type = process.argv[3];
if (!lang || !type) { console.error('usage: <lang> <quiz|exercises>'); process.exit(1); }

const srcFile = path.join(SRC_DIR, `${lang}-${type}.json`);
const inFile = path.join(D, `w3s-${lang}-${type}.json`);
const items = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));

let applied = 0, skipped = 0;

if (type === 'quiz') {
  const byUrl = new Map(items.map(it => [it.url + '#q' + it.number, it]));
  for (const q of data.questions) {
    const key = q.url + '#q' + q.number;
    const it = byUrl.get(key) || items.find(x => x.number === q.number);
    if (!it) continue;
    if (!it.prompt_zh) { skipped++; continue; }
    q.prompt_zh = it.prompt_zh;
    if (Array.isArray(it.options_translations)) {
      q.options_translations = it.options_translations;
      // 同步把 q.correct 設成對應正解選項的 value
      const correctTrans = it.options_translations.find(o => o.correct);
      if (correctTrans && (q.correct === null || q.correct === undefined)) {
        const optMatch = q.options.find(o => {
          const txtClean = o.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          return txtClean === correctTrans.text_en;
        });
        if (optMatch) q.correct = optMatch.value;
      }
    }
    applied++;
  }
} else {
  const byUrl = new Map(items.map(it => [it.url, it]));
  for (const arr of Object.values(data.topics)) {
    if (!Array.isArray(arr)) continue;
    for (const q of arr) {
      const it = byUrl.get(q.url);
      if (!it) continue;
      if (!it.prompt_zh) { skipped++; continue; }
      q.prompt_zh = it.prompt_zh;
      if (it.answer_zh) q.answer_zh = it.answer_zh;
      applied++;
    }
  }
}

fs.writeFileSync(inFile, JSON.stringify(data, null, 2));
console.log(`applied: ${applied}, skipped(empty): ${skipped} → ${inFile}`);
