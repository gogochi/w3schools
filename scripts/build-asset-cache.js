#!/usr/bin/env node
// Mirror referenced media (img/audio/video/css/iframe) used by challenge
// starter/solution code from W3Schools into data/assets/<lang>/<filename>.
//
// The frontend uses `<base href>` pointing at this local cache so previews
// don't depend on W3Schools staying online.
//
// Usage:
//   node scripts/build-asset-cache.js          # download missing files
//   node scripts/build-asset-cache.js --dry    # list refs only
//   node scripts/build-asset-cache.js --force  # refetch everything

const fs = require('node:fs');
const path = require('node:path');

const LANGS = ['html', 'css', 'js', 'c', 'nodejs', 'sql', 'git', 'vue'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const ASSETS_DIR = path.join(DATA_DIR, 'assets');
const DELAY_MS = 200;

function isExternal(u) {
  return /^(?:https?:)?\/\//i.test(u) || /^(?:mailto|javascript|data):/i.test(u);
}

function collectRefs(langFilter) {
  const refs = new Map(); // 'lang/file' → 'https://w3s.../lang/file'
  for (const lang of LANGS) {
    if (langFilter && !langFilter.has(lang)) continue;
    const f = path.join(DATA_DIR, `w3s-${lang}-challenges.json`);
    if (!fs.existsSync(f)) continue;
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const topic of Object.keys(d.topics || {})) {
      for (const q of d.topics[topic]) {
        for (const code of [q.starter || '', q.solution || '']) {
          for (const u of extractUrls(code)) {
            // skip absolute paths (W3Schools site-root) and page anchors
            if (u.startsWith('/')) continue;
            if (u.startsWith('#')) continue;
            if (u.includes('FIX_THIS_PATH')) continue;
            const key = `${lang}/${u}`;
            refs.set(key, `https://www.w3schools.com/${lang}/${u}`);
          }
        }
      }
    }
  }
  return refs;
}

function extractUrls(code) {
  const out = new Set();
  const reHtml = /(?:src|href)\s*=\s*['"]([^'"]+)['"]/gi;
  let m;
  while ((m = reHtml.exec(code))) if (!isExternal(m[1])) out.add(m[1]);
  const reCss = /url\s*\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi;
  while ((m = reCss.exec(code))) if (!isExternal(m[1])) out.add(m[1]);
  return [...out];
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const langArg = args.find(a => a.startsWith('--lang='));
  const langFilter = langArg ? new Set(langArg.slice('--lang='.length).split(',')) : null;

  const refs = collectRefs(langFilter);
  console.log(`refs: ${refs.size}`);
  if (dry) {
    [...refs.entries()].forEach(([k, v]) => console.log(`  ${k}  ←  ${v}`));
    return;
  }

  let ok = 0, skipped = 0, fail = 0;
  for (const [key, url] of refs) {
    const localPath = path.join(ASSETS_DIR, key);
    if (!force && fs.existsSync(localPath)) { skipped++; continue; }
    const tag = `[${ok + skipped + fail + 1}/${refs.size}] ${key}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (build-asset-cache)' } });
      if (!res.ok) { fail++; console.warn(`${tag} → HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      fs.writeFileSync(localPath, buf);
      ok++;
      console.log(`${tag} ${(buf.length / 1024).toFixed(1)} KB`);
      if (DELAY_MS > 0) await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (e) {
      fail++;
      console.warn(`${tag} ${e.message}`);
    }
  }
  console.log(`done. ok=${ok} skipped=${skipped} fail=${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); });
