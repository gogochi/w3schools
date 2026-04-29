/**
 * One-time migration:
 *   data/translations.json → 每題 JSON 直接加 prompt_zh / answer_zh / options_zh 欄位
 *
 * 之後 translations.json 會繼續存在當作 backup / 翻譯主編輯入口，但每次 build 都會把它 sync 回 JSON。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');
const TRANS = JSON.parse(fs.readFileSync(path.join(D, 'translations.json'), 'utf8'));

const langs = ['html', 'css', 'js', 'c', 'nodejs'];

function applyToExercises(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let patched = 0;
  for (const arr of Object.values(data.topics)) {
    if (!Array.isArray(arr)) continue;
    for (const q of arr) {
      const t = TRANS[q.url];
      if (!t) continue;
      if (t.prompt_zh && q.prompt_zh !== t.prompt_zh) { q.prompt_zh = t.prompt_zh; patched++; }
      if (t.answer_zh) q.answer_zh = t.answer_zh;
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return patched;
}

function applyToQuiz(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let patched = 0;
  if (!data.questions[0]) return 0;
  const baseUrl = data.questions[0].url;
  for (const q of data.questions) {
    const key = `${baseUrl}#q${q.number}`;
    const t = TRANS[key];
    if (!t) continue;
    if (t.prompt_zh) { q.prompt_zh = t.prompt_zh; patched++; }
    if (t.options) {
      // 將翻譯選項對應到實際 q.options，用 text_en 比對
      q.options_translations = t.options.map(opt => ({
        text_en: opt.text_en,
        text_zh: opt.text_zh,
        correct: opt.correct,
      }));
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return patched;
}

let total = 0;
for (const lang of langs) {
  const exFile = path.join(D, `w3s-${lang}-exercises.json`);
  if (fs.existsSync(exFile)) {
    const n = applyToExercises(exFile);
    if (n) console.log(`${lang} exercises: +${n} translations`);
    total += n;
  }
  const qzFile = path.join(D, `w3s-${lang}-quiz.json`);
  if (fs.existsSync(qzFile)) {
    const n = applyToQuiz(qzFile);
    if (n) console.log(`${lang} quiz: +${n} translations`);
    total += n;
  }
}
console.log(`total patched: ${total}`);
