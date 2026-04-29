/**
 * 用 Claude API 批次翻譯所有缺 prompt_zh 的 exercises 題目。
 *
 * 需要環境變數 ANTHROPIC_API_KEY。
 * 安裝相依：npm install @anthropic-ai/sdk  （或在 package.json 加好）
 *
 * 用法：
 *   node scripts/translate-with-claude.js <lang> [topic]
 *   node scripts/translate-with-claude.js nodejs
 *   node scripts/translate-with-claude.js html forms
 *
 * Schema：題目寫進每題的 prompt_zh / answer_zh 欄位（重抓會 preserve）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const D = path.join(ROOT, 'data');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ERROR: set ANTHROPIC_API_KEY env var.');
  process.exit(1);
}

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '20', 10);

const lang = process.argv[2];
const topicFilter = process.argv[3];
if (!lang) { console.error('usage: <lang> [topic]'); process.exit(1); }

const inFile = path.join(D, `w3s-${lang}-exercises.json`);
if (!fs.existsSync(inFile)) { console.error(`no such file: ${inFile}`); process.exit(1); }

const stripTags = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function callClaude(items) {
  const prompt = `You are translating W3Schools programming exercise questions from English to Traditional Chinese (zh-tw, 繁體中文 used in Taiwan).

Rules:
- Translate the question concisely, keep the meaning
- Keep code identifiers (function names, HTML tags, CSS properties, SQL keywords) in original English form
- For "answer_en" fields, translate them too (skip if just a code snippet like "app.listen()")
- Output ONLY a JSON array, no commentary

Input items:
${JSON.stringify(items, null, 2)}

Output format (same length array, in same order):
[
  { "prompt_zh": "中文翻譯", "answer_zh": "答案翻譯或 null" },
  ...
]`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Claude API ${r.status}: ${t.slice(0, 300)}`);
  }
  const data = await r.json();
  const text = data.content?.[0]?.text || '';
  // Extract JSON from response (may have markdown fences)
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) throw new Error('no JSON array in response: ' + text.slice(0, 200));
  return JSON.parse(m[0]);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const todo = []; // { topic, qIndex, en, answer_en }

  for (const [topic, arr] of Object.entries(data.topics)) {
    if (!Array.isArray(arr)) continue;
    if (topicFilter && topic !== topicFilter) continue;
    arr.forEach((q, i) => {
      if (q.prompt_zh) return;
      const en = stripTags(q.question || q.draganddropquestion || (q.fillintheblanks ? `(fill template: ${q.fillintheblanks})` : ''));
      const answer_en = (typeof q.correct === 'number' && Array.isArray(q.options)) ? stripTags(q.options[q.correct] || '') : null;
      todo.push({ topic, qIndex: i, en, answer_en });
    });
  }

  console.log(`${lang}/${topicFilter || '*'}: ${todo.length} items to translate (batch=${BATCH_SIZE}, model=${MODEL})`);

  for (let off = 0; off < todo.length; off += BATCH_SIZE) {
    const batch = todo.slice(off, off + BATCH_SIZE);
    const input = batch.map(({ en, answer_en }) => ({ en, answer_en }));
    process.stdout.write(`  ${off + 1}-${off + batch.length}/${todo.length}… `);
    let translations;
    try {
      translations = await callClaude(input);
      if (translations.length !== batch.length) {
        throw new Error(`length mismatch: in=${batch.length} out=${translations.length}`);
      }
    } catch (e) {
      console.error('ERROR:', e.message);
      continue;
    }
    for (let i = 0; i < batch.length; i++) {
      const { topic, qIndex } = batch[i];
      const t = translations[i];
      const target = data.topics[topic][qIndex];
      if (t.prompt_zh) target.prompt_zh = t.prompt_zh;
      if (t.answer_zh) target.answer_zh = t.answer_zh;
    }
    // persist after each batch (resumable)
    fs.writeFileSync(inFile, JSON.stringify(data, null, 2));
    console.log('saved.');
  }
  console.log('done.');
}

main().catch(e => { console.error(e); process.exit(1); });
