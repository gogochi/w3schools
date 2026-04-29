/**
 * 列出每個 JSON 內缺 prompt_zh 的題目（含 url + 英文題目原文）。
 * 用法：
 *   node scripts/list-untranslated.js                  # 統計
 *   node scripts/list-untranslated.js nodejs           # 列出 nodejs 全部未翻譯
 *   node scripts/list-untranslated.js nodejs express   # 只看 nodejs.express topic
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');

const langs = ['html', 'css', 'js', 'c', 'nodejs', 'sql', 'git', 'vue'];
const stripTags = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function questionPrompt(q) {
  return q.question || q.draganddropquestion || (q.fillintheblanks ? `(填空: ${q.fillintheblanks})` : '');
}

const filterLang = process.argv[2];
const filterTopic = process.argv[3];

let totalQ = 0, totalMissing = 0;
const summary = {};

for (const lang of langs) {
  if (filterLang && lang !== filterLang) continue;

  // exercises
  const exFile = path.join(D, `w3s-${lang}-exercises.json`);
  if (fs.existsSync(exFile)) {
    const d = JSON.parse(fs.readFileSync(exFile, 'utf8'));
    let langQ = 0, langMiss = 0;
    const missing = [];
    for (const [topic, arr] of Object.entries(d.topics)) {
      if (!Array.isArray(arr)) continue;
      if (filterTopic && topic !== filterTopic) continue;
      langQ += arr.length;
      for (const q of arr) {
        if (!q.prompt_zh) {
          langMiss++;
          missing.push({ topic, q });
        }
      }
    }
    summary[`${lang}-exercises`] = { total: langQ, missing: langMiss };
    totalQ += langQ;
    totalMissing += langMiss;

    if ((filterLang || filterTopic) && missing.length) {
      console.log(`\n=== ${lang} exercises (missing ${missing.length}/${langQ}) ===`);
      for (const { topic, q } of missing) {
        console.log(`  [${topic}] ${stripTags(questionPrompt(q)).slice(0, 100)}`);
        console.log(`    ${q.url}`);
      }
    }
  }

  // quiz
  const qzFile = path.join(D, `w3s-${lang}-quiz.json`);
  if (fs.existsSync(qzFile) && !filterTopic) {
    const d = JSON.parse(fs.readFileSync(qzFile, 'utf8'));
    let total = d.questions.length;
    let miss = d.questions.filter(q => !q.prompt_zh).length;
    summary[`${lang}-quiz`] = { total, missing: miss };
    totalQ += total;
    totalMissing += miss;

    if (filterLang && miss) {
      console.log(`\n=== ${lang} quiz (missing ${miss}/${total}) ===`);
      for (const q of d.questions) {
        if (q.prompt_zh) continue;
        console.log(`  Q${q.number}: ${stripTags(q.question).slice(0, 100)}`);
        console.log(`    ${q.url}`);
      }
    }
  }
}

console.log('\n=== Summary ===');
console.table(summary);
console.log(`Total: ${totalQ} questions, ${totalMissing} missing translations (${(100 * totalMissing / totalQ).toFixed(1)}%)`);
