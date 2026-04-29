/**
 * Dump 待翻譯題目到 /tmp/translate-<lang>-<type>.json
 * 用法：
 *   node scripts/dump-untranslated.js nodejs quiz
 *   node scripts/dump-untranslated.js nodejs exercises
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');
const OUT_DIR = '/tmp/w3s_translate';
fs.mkdirSync(OUT_DIR, { recursive: true });

const stripTags = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const lang = process.argv[2];
const type = process.argv[3]; // 'quiz' or 'exercises'

if (!lang || !type) { console.error('usage: <lang> <quiz|exercises>'); process.exit(1); }

const inFile = path.join(D, `w3s-${lang}-${type}.json`);
const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const items = [];

if (type === 'quiz') {
  for (const q of data.questions) {
    if (q.prompt_zh) continue;
    const correctText = q.correct ? q.options.find(o => o.value === q.correct)?.text : null;
    items.push({
      number: q.number,
      url: q.url,
      en: stripTags(q.question),
      options_en: q.options.map(o => stripTags(o.text)),
      correct_value: q.correct,
      correct_text: correctText ? stripTags(correctText) : null,
      // === to-fill ===
      prompt_zh: '',
      options_translations: q.options.map(o => ({
        text_en: stripTags(o.text),
        text_zh: '',
        correct: q.correct === o.value,
      })),
    });
  }
} else {
  // exercises: nested topics
  for (const [topic, arr] of Object.entries(data.topics)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((q, i) => {
      if (q.prompt_zh) return;
      const en = stripTags(q.question || q.draganddropquestion || '');
      // For mcq with options + correct (number), capture correct option text
      let answer_en = null;
      if (typeof q.correct === 'number' && Array.isArray(q.options)) {
        answer_en = stripTags(q.options[q.correct] || '');
      }
      items.push({
        topic, index: i + 1, url: q.url,
        kind: q.fillintheblanks ? 'fill' : (q.draganddropquestion ? 'dnd' : 'mcq'),
        en: en || (q.fillintheblanks ? `(fill: ${q.fillintheblanks})` : ''),
        answer_en,
        // === to-fill ===
        prompt_zh: '',
        answer_zh: answer_en ? '' : null,
      });
    });
  }
}

const outFile = path.join(OUT_DIR, `${lang}-${type}.json`);
fs.writeFileSync(outFile, JSON.stringify(items, null, 2));
console.log(`dumped ${items.length} items → ${outFile}`);
