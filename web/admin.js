import { LANGS, TYPE_MAP, loadJson, expandQuestion, parseId } from './lib.js?v=5';

const TYPES = ['ex', 'quiz', 'chal'];
const TYPE_LABEL = { ex: 'exercises', quiz: 'quiz', chal: 'challenges' };

const $ = (s) => document.querySelector(s);

const cart = new Map(); // id → {id, kind, prompt_zh, question}
const CART_KEY = 'cart';
const BASE_KEY = 'siteBase';

// Cache per topic of expanded items so re-clicking the same topic is fast.
const topicCache = new Map(); // `${lang}/${type}/${topic}` → items[]

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    raw.forEach(it => it && it.id && cart.set(it.id, it));
  } catch {}
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify([...cart.values()]));
}

function loadBase() {
  $('#base').value = localStorage.getItem(BASE_KEY) || '';
}
function saveBase() {
  localStorage.setItem(BASE_KEY, $('#base').value.trim());
  renderCart();
}

async function expandTopic(lang, type, topic) {
  const ck = `${lang}/${type}/${topic}`;
  if (topicCache.has(ck)) return topicCache.get(ck);
  const data = await loadJson(lang, type);
  const arr = (data && data.topics && data.topics[topic]) || [];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const ex = await expandQuestion(arr[i], lang);
    if (ex) out.push({ q: ex, idx: i, id: `${lang}:${type}:${topic}:${i}` });
  }
  topicCache.set(ck, out);
  return out;
}

async function buildTree() {
  const tree = $('#tree');
  tree.innerHTML = '';
  for (const lang of LANGS) {
    const langDet = document.createElement('details');
    const langSum = document.createElement('summary');
    langSum.textContent = `${lang}（計算中…）`;
    langDet.appendChild(langSum);
    tree.appendChild(langDet);

    let langTotal = 0;
    for (const type of TYPES) {
      const data = await loadJson(lang, type);
      if (!data || !data.topics) continue;

      const typeDet = document.createElement('details');
      const typeSum = document.createElement('summary');
      typeDet.appendChild(typeSum);

      const topics = Object.keys(data.topics).sort();
      let typeTotal = 0;
      for (const topic of topics) {
        const items = await expandTopic(lang, type, topic);
        const n = items.length;
        if (n === 0) continue;
        typeTotal += n;
        const counts = items.reduce((m, it) => (m[it.q._kind] = (m[it.q._kind] || 0) + 1, m), {});
        const summary = ['mcq', 'fitb', 'dragdrop', 'challenge'].filter(k => counts[k]).map(k => `${k}:${counts[k]}`).join(' ');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'topic';
        btn.textContent = `${topic} (${n}) — ${summary}`;
        btn.addEventListener('click', () => showItems(lang, type, topic, items));
        typeDet.appendChild(btn);
      }
      if (typeTotal === 0) continue;
      typeSum.textContent = `${TYPE_LABEL[type]} · ${typeTotal}`;
      langTotal += typeTotal;
      langDet.appendChild(typeDet);
    }

    if (langTotal === 0) {
      langSum.textContent = `${lang} (0)`;
      langDet.classList.add('empty');
    } else {
      langSum.textContent = `${lang} · ${langTotal}`;
    }
  }
}

function htmlToText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
}

function showItems(lang, type, topic, items) {
  const pane = $('#items');
  pane.innerHTML = '';

  const head = document.createElement('div');
  head.className = 'items__head';
  head.innerHTML = `<h2>${lang} / ${TYPE_LABEL[type]} / ${topic}</h2>`;
  const addAll = document.createElement('button');
  addAll.type = 'button';
  addAll.textContent = '全部加入';
  head.appendChild(addAll);
  pane.appendChild(head);

  items.forEach(({ q, id }) => {
    const card = document.createElement('section');
    card.className = `item item--${q._kind}`;

    const top = document.createElement('div');
    top.className = 'item__head';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `cb-${id}`;
    cb.checked = cart.has(id);
    cb.addEventListener('change', () => {
      if (cb.checked) cart.set(id, { id, kind: q._kind, prompt_zh: q.prompt_zh || '', question: q.question || '' });
      else cart.delete(id);
      saveCart();
      renderCart();
    });
    const lab = document.createElement('label');
    lab.htmlFor = cb.id;
    const badge = `<span class="kind-badge kind-${q._kind}">${q._kind}</span>`;
    lab.innerHTML = `<code>${id}</code> ${badge} ${q.prompt_zh || q.question || ''}`;
    top.append(cb, lab);
    card.appendChild(top);

    if (q.prompt_zh && q.question && q.prompt_zh !== q.question) {
      const en = document.createElement('div');
      en.className = 'item__en';
      en.textContent = q.question;
      card.appendChild(en);
    }

    if (q._kind === 'mcq') {
      const ol = document.createElement('ol');
      ol.className = 'item__opts';
      q.options.forEach((opt, oi) => {
        const li = document.createElement('li');
        li.innerHTML = opt;
        if (oi === q.correct) li.classList.add('correct');
        ol.appendChild(li);
      });
      card.appendChild(ol);
    } else if (q._kind === 'fitb') {
      const pre = document.createElement('pre');
      pre.className = 'item__code';
      pre.textContent = q.code;
      card.appendChild(pre);
      const sol = document.createElement('details');
      sol.className = 'item__sol';
      sol.innerHTML = `<summary>正解</summary><pre>${(q.solution || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`;
      card.appendChild(sol);
    } else if (q._kind === 'dragdrop') {
      const tpl = document.createElement('div');
      tpl.className = 'item__dd';
      tpl.innerHTML = q.template;
      card.appendChild(tpl);
      const opts = document.createElement('ol');
      opts.className = 'item__opts';
      q.options.forEach((opt) => {
        const li = document.createElement('li');
        li.innerHTML = opt;
        opts.appendChild(li);
      });
      card.appendChild(opts);
      const order = document.createElement('div');
      order.className = 'item__sol';
      const correctText = q.correct.map(oi => htmlToText(q.options[oi] || '')).join(' → ');
      order.innerHTML = `<strong>正確順序：</strong>${correctText}`;
      card.appendChild(order);
    } else if (q._kind === 'challenge') {
      const intro = document.createElement('div');
      intro.className = 'item__intro';
      intro.innerHTML = q.intro || '';
      card.appendChild(intro);
      if ((q.requirements || []).length) {
        const ul = document.createElement('ul');
        ul.className = 'item__reqs';
        q.requirements.forEach(r => {
          const li = document.createElement('li');
          li.innerHTML = r.label || r.id || '';
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }
      const sol = document.createElement('details');
      sol.className = 'item__sol';
      sol.innerHTML = `<summary>解答</summary><pre>${(q.solution || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`;
      card.appendChild(sol);
    }

    pane.appendChild(card);
  });

  addAll.addEventListener('click', () => {
    items.forEach(({ q, id }) => {
      cart.set(id, { id, kind: q._kind, prompt_zh: q.prompt_zh || '', question: q.question || '' });
      const cb = document.getElementById(`cb-${id}`);
      if (cb) cb.checked = true;
    });
    saveCart();
    renderCart();
  });
}

function buildUrl() {
  const base = ($('#base').value || '').trim();
  const ids = [...cart.keys()].join(',');
  if (!ids) return '';
  // Always target index.html so the preview link / copied URL never resolves
  // back to admin.html (when opened from this page with a relative URL).
  const target = `index.html?q=${encodeURIComponent(ids)}`;
  if (!base) return target;
  const sep = base.endsWith('/') ? '' : '/';
  return `${base}${sep}${target}`;
}

function renderCart() {
  const list = $('#cart-list');
  list.innerHTML = '';
  $('#cart-count').textContent = `(${cart.size})`;
  for (const it of cart.values()) {
    const li = document.createElement('li');
    const txt = document.createElement('span');
    const badge = it.kind ? `<span class="kind-badge kind-${it.kind}">${it.kind}</span> ` : '';
    txt.innerHTML = `<code>${it.id}</code> ${badge}${it.prompt_zh || it.question || ''}`;
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.textContent = '✕';
    rm.title = '移除';
    rm.addEventListener('click', () => {
      cart.delete(it.id);
      const cb = document.getElementById(`cb-${it.id}`);
      if (cb) cb.checked = false;
      saveCart();
      renderCart();
    });
    li.append(txt, rm);
    list.appendChild(li);
  }
  const url = buildUrl();
  $('#cart-url').value = url;
  const a = $('#cart-preview');
  if (url) { a.href = url; a.removeAttribute('aria-disabled'); }
  else { a.href = '#'; a.setAttribute('aria-disabled', 'true'); }
}

async function exportSummary() {
  const lines = [];
  for (const lang of LANGS) {
    for (const type of TYPES) {
      const data = await loadJson(lang, type);
      if (!data || !data.topics) continue;
      for (const topic of Object.keys(data.topics).sort()) {
        const items = await expandTopic(lang, type, topic);
        items.forEach(({ q, id }) => {
          const txt = (q.prompt_zh || q.question || '').replace(/\s+/g, ' ').slice(0, 120);
          lines.push(`${id}\t[${q._kind}]\t${txt}`);
        });
      }
    }
  }
  const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'w3s-question-summary.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const ID_GLOBAL_RE = /\b[a-z]+:(?:ex|quiz|chal):[\w-]+:\d+\b/g;

async function importLlm(text) {
  const found = [...new Set(text.match(ID_GLOBAL_RE) || [])];
  const added = [];
  const missing = [];
  for (const s of found) {
    const p = parseId(s);
    if (!p) { missing.push(s); continue; }
    const data = await loadJson(p.lang, p.type);
    const raw = data && data.topics && data.topics[p.topic] && data.topics[p.topic][p.idx];
    if (!raw) { missing.push(s); continue; }
    const ex = await expandQuestion(raw, p.lang);
    if (!ex) { missing.push(s); continue; }
    if (!cart.has(s)) {
      cart.set(s, { id: s, kind: ex._kind, prompt_zh: ex.prompt_zh || '', question: ex.question || '' });
      added.push(s);
    }
  }
  saveCart();
  renderCart();
  alert(`匯入完成：加入 ${added.length} 題；找不到 ${missing.length}：\n${missing.slice(0, 20).join('\n')}`);
}

$('#base').addEventListener('change', saveBase);
$('#cart-clear').addEventListener('click', () => {
  if (!confirm('清空購物車？')) return;
  cart.clear();
  saveCart();
  document.querySelectorAll('.item input[type=checkbox]').forEach(cb => { cb.checked = false; });
  renderCart();
});
$('#cart-copy').addEventListener('click', async () => {
  const url = buildUrl();
  if (!url) return;
  try { await navigator.clipboard.writeText(url); alert('已複製'); }
  catch { $('#cart-url').select(); document.execCommand('copy'); }
});
$('#export-summary').addEventListener('click', exportSummary);
$('#import-llm').addEventListener('click', () => {
  $('#llm-text').value = '';
  $('#llm-dialog').showModal();
});
$('#llm-dialog').addEventListener('close', () => {
  if ($('#llm-dialog').returnValue !== 'ok') return;
  const t = $('#llm-text').value;
  if (t.trim()) importLlm(t);
});

loadCart();
loadBase();
renderCart();
buildTree();
