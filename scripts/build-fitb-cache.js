#!/usr/bin/env node
// Fetch fillintheblanks-ref question bodies from W3Schools and store them in
// data/fitb-cache.json so the web/ frontend can render them.
//
// Each ref in data/w3s-<lang>-exercises.json has shape
//   { fillintheblanks: "exercise_<topic><n>.htm", url, prompt_zh }
// Cache schema (already used by 36 existing entries):
//   { "<lang>/<filename>": { prompt, code, solution } }
//
// Usage:
//   node scripts/build-fitb-cache.js              # fetch missing entries
//   node scripts/build-fitb-cache.js --dry        # list todo only
//   node scripts/build-fitb-cache.js --lang=html  # filter languages (csv ok)
//   node scripts/build-fitb-cache.js --force      # refetch even if cached

const fs = require('node:fs');
const path = require('node:path');

const LANGS = ['html', 'css', 'js', 'c', 'nodejs', 'sql', 'git', 'vue'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'fitb-cache.json');
const DELAY_MS = 200;
const SAVE_EVERY = 25;

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&'); // last
}

function stripTags(html) {
  let s = html.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  return decodeEntities(s);
}

function extractDivById(html, id) {
  // Greedy until the matching </div>. The W3Schools .htm files don't have
  // nested <div>s inside these blocks, so a simple non-greedy match works.
  const re = new RegExp(`<div\\s[^>]*id\\s*=\\s*['"]${id.replace(/[\[\]]/g, '\\$&')}['"][^>]*>([\\s\\S]*?)<\\/div>`, 'i');
  const m = re.exec(html);
  return m ? m[1] : null;
}

function extractPrompt(html) {
  // All <p>...</p> at the top-level concatenated with newlines.
  const ps = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => stripTags(m[1]).trim());
  return ps.filter(Boolean).join('\n').trim();
}

function extractCode(html, id) {
  const inner = extractDivById(html, id);
  if (inner === null) return null;
  return decodeEntities(inner)
    .replace(/^\s*\n+/, '')
    .replace(/\n+\s*$/, '')
    .trimEnd();
}

function findRefs(langFilter) {
  const refs = [];
  for (const lang of LANGS) {
    if (langFilter && !langFilter.has(lang)) continue;
    const fp = path.join(DATA_DIR, `w3s-${lang}-exercises.json`);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const topic of Object.keys(data.topics || {})) {
      const arr = data.topics[topic];
      arr.forEach((q, idx) => {
        if (typeof q.fillintheblanks === 'string') {
          refs.push({ lang, topic, idx, filename: q.fillintheblanks });
        }
      });
    }
  }
  return refs;
}

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const langArg = args.find(a => a.startsWith('--lang='));
  const langFilter = langArg ? new Set(langArg.slice('--lang='.length).split(',')) : null;

  const cache = loadCache();
  const refs = findRefs(langFilter);
  const todo = force ? refs : refs.filter(r => !cache[`${r.lang}/${r.filename}`]);

  console.log(`refs: ${refs.length}  cached: ${refs.length - todo.length}  todo: ${todo.length}`);

  if (dry) {
    todo.slice(0, 20).forEach(r => console.log(`  ${r.lang}/${r.filename}  (${r.topic}#${r.idx})`));
    if (todo.length > 20) console.log(`  …+${todo.length - 20} more`);
    return;
  }

  let ok = 0, fail = 0, missing = 0;
  for (let i = 0; i < todo.length; i++) {
    const r = todo[i];
    const url = `https://www.w3schools.com/${r.lang}/${r.filename}`;
    const tag = `[${i + 1}/${todo.length}] ${r.lang}/${r.filename}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (build-fitb-cache)' } });
      if (!res.ok) { fail++; console.warn(`${tag} → HTTP ${res.status}`); continue; }
      const html = await res.text();
      const prompt = extractPrompt(html);
      const code = extractCode(html, 'assignmentcode');
      const solution = extractCode(html, 'correctcode')
        ?? extractCode(html, 'correctcode[0]')
        ?? extractCode(html, 'correctcode0');
      if (!prompt || !code || !solution) {
        missing++;
        console.warn(`${tag} missing fields p:${!!prompt} c:${!!code} s:${!!solution}`);
        continue;
      }
      cache[`${r.lang}/${r.filename}`] = { prompt, code, solution };
      ok++;
      if ((ok % SAVE_EVERY) === 0) {
        saveCache(cache);
        console.log(`${tag} ok (saved checkpoint, total ok=${ok})`);
      } else {
        console.log(`${tag} ok`);
      }
      if (DELAY_MS > 0) await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (e) {
      fail++;
      console.warn(`${tag} ${e.message}`);
    }
  }
  saveCache(cache);
  console.log(`done. ok: ${ok}  fail: ${fail}  missing-fields: ${missing}`);
}

main().catch(e => { console.error(e); process.exit(1); });
