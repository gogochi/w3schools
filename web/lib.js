// Shared module for student (quiz.js) and teacher (admin.js).
// Replace <user>/<repo> after the GitHub repo is created. For local dev with
// `python3 -m http.server` from the repo root, a same-origin '../data' fallback
// is also tried so you don't need to push before testing.

export const REPO_RAW = 'https://raw.githubusercontent.com/<user>/<repo>/main/data';
export const TYPE_MAP = { ex: 'exercises', quiz: 'quiz', chal: 'challenges' };
export const LANGS = ['html', 'css', 'js', 'c', 'nodejs', 'sql', 'git', 'vue'];

const cache = new Map();
let fitbCachePromise = null;
let fitbCacheData = null;

async function fetchJsonWithFallback(file) {
  const urls = [`../data/${file}`, `${REPO_RAW}/${file}`];
  let lastErr;
  for (const u of urls) {
    try {
      // cache: 'no-cache' so updates to data/*.json are visible without manual hard-reload.
      // Files are small enough that revalidation is cheap.
      const r = await fetch(u, { cache: 'no-cache' });
      if (!r.ok) { lastErr = new Error(`${u} → ${r.status}`); continue; }
      return await r.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error(`fetch failed: ${file}`);
}

// quiz JSON shape is {test, total, questions: [...]}; normalize to the same
// {topics: {main: [...]}} shape exercises use, with options flattened from
// [{value, text}] to [text]. Falls back to options_translations for correct.
function normalizeQuiz(j) {
  const items = (j.questions || []).map(q => {
    const options = (q.options || []).map(o => (o && typeof o === 'object') ? o.text : o);
    let correct = typeof q.correct === 'number' ? q.correct : null;
    if (correct === null && Array.isArray(q.options_translations)) {
      const idx = q.options_translations.findIndex(o => o && o.correct === true);
      if (idx >= 0) correct = idx;
    }
    return {
      question: q.question,
      options,
      correct,
      url: q.url,
      prompt_zh: q.prompt_zh,
      options_translations: q.options_translations,
    };
  });
  return { topics: { main: items } };
}

export async function loadJson(lang, type) {
  const key = `${lang}:${type}`;
  if (cache.has(key)) return cache.get(key);
  const file = `w3s-${lang}-${TYPE_MAP[type]}.json`;
  try {
    const j = await fetchJsonWithFallback(file);
    const out = (type === 'quiz') ? normalizeQuiz(j) : j;
    cache.set(key, out);
    return out;
  } catch (e) {
    cache.set(key, null);
    console.warn(`loadJson(${lang},${type}) failed:`, e);
    return null;
  }
}

export async function loadFitbCache() {
  if (fitbCacheData !== null) return fitbCacheData;
  if (!fitbCachePromise) {
    fitbCachePromise = (async () => {
      try {
        fitbCacheData = await fetchJsonWithFallback('fitb-cache.json');
      } catch (e) {
        console.warn('loadFitbCache failed:', e);
        fitbCacheData = {};
      }
      return fitbCacheData;
    })();
  }
  return fitbCachePromise;
}

const ID_RE = /^([a-z]+):(ex|quiz|chal):([\w-]+):(\d+)$/;

export function parseId(s) {
  const m = ID_RE.exec(s);
  if (!m) return null;
  return { lang: m[1], type: m[2], topic: m[3], idx: parseInt(m[4], 10), id: s };
}

// Identify the raw shape of a question. Returns one of:
// 'mcq' | 'dragdrop' | 'fitb-inline' | 'fitb-ref' | null
export function rawKind(q) {
  if (!q || typeof q !== 'object') return null;
  if (typeof q.starter === 'string' && Array.isArray(q.requirements)) return 'challenge';
  if (typeof q.fillintheblanks === 'string') return 'fitb-ref';
  if (q.fillintheblanks === true) return 'fitb-inline';
  if (q.draganddroptext && Array.isArray(q.options) && Array.isArray(q.correct)) return 'dragdrop';
  if (Array.isArray(q.options)) {
    if (typeof q.correct === 'number') return 'mcq';
    if (Array.isArray(q.correct) && q.correct.length === 1 && typeof q.correct[0] === 'number') return 'mcq';
  }
  return null;
}

// Expand a raw question into a unified renderable shape:
//   {_kind: 'mcq', question, options, correct: number}
//   {_kind: 'fitb', question, code, solution, alternatives: string[]}
//   {_kind: 'dragdrop', question, template, options, correct: number[]}
// All include url + prompt_zh (+ answer_zh for mcq) when present.
// Returns null if the question can't be rendered (e.g. fitb-ref with no cache hit).
export async function expandQuestion(q, lang) {
  const k = rawKind(q);
  if (!k) return null;
  if (k === 'mcq') {
    const correct = Array.isArray(q.correct) ? q.correct[0] : q.correct;
    return {
      _kind: 'mcq',
      question: q.question,
      options: q.options,
      correct,
      url: q.url,
      prompt_zh: q.prompt_zh,
      answer_zh: q.answer_zh,
    };
  }
  if (k === 'dragdrop') {
    return {
      _kind: 'dragdrop',
      question: q.draganddropquestion,
      template: q.draganddroptext,
      options: q.options,
      correct: q.correct,
      url: q.url,
      prompt_zh: q.prompt_zh,
    };
  }
  if (k === 'fitb-inline') {
    return {
      _kind: 'fitb',
      question: q.question,
      code: q.code,
      solution: q.solution,
      alternatives: q.alternatives || [],
      url: q.url,
      prompt_zh: q.prompt_zh,
    };
  }
  if (k === 'fitb-ref') {
    const fitb = await loadFitbCache();
    const key = `${lang}/${q.fillintheblanks}`;
    const entry = fitb && fitb[key];
    if (!entry) return null; // cache miss → not renderable
    return {
      _kind: 'fitb',
      question: entry.prompt,
      code: entry.code,
      solution: entry.solution,
      alternatives: [],
      url: q.url,
      prompt_zh: q.prompt_zh,
    };
  }
  if (k === 'challenge') {
    return {
      _kind: 'challenge',
      question: stripHtml(q.intro || '').slice(0, 200),
      intro: q.intro || '',
      starter: q.starter || '',
      solution: q.solution || '',
      requirements: q.requirements || [],
      commonMistakes: q.commonMistakes || [],
      url: q.url,
      prompt_zh: q.prompt_zh,
    };
  }
  return null;
}

function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function loadQuestionsByIds(idStrings) {
  const out = [];
  for (const s of idStrings) {
    const p = parseId(s);
    if (!p) { console.warn('bad id:', s); continue; }
    const data = await loadJson(p.lang, p.type);
    const arr = data && data.topics && data.topics[p.topic];
    const q = arr && arr[p.idx];
    if (!q) { console.warn('missing:', s); continue; }
    const ex = await expandQuestion(q, p.lang);
    if (!ex) { console.warn('cant expand:', s); continue; }
    out.push({ ...ex, _id: p.id, _parsed: p });
  }
  return out;
}
