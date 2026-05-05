import { loadQuestionsByIds } from './lib.js?v=5';

// Default to the local dev-server.py endpoint. For production GitHub Pages,
// replace with the deployed Apps Script /exec URL.
const GAS_URL = '/api/submit';
const SID_KEY = 'studentId';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const ids = (params.get('q') || '').split(',').map(s => s.trim()).filter(Boolean);

let questions = [];

function loadSid() {
  try {
    const saved = localStorage.getItem(SID_KEY) || '';
    if (saved) $('#sid').value = saved;
  } catch {}
}

async function init() {
  loadSid();
  $('#sid').addEventListener('change', () => {
    const v = $('#sid').value.trim();
    if (v) {
      try { localStorage.setItem(SID_KEY, v); } catch {}
    }
  });

  if (ids.length === 0) {
    $('#meta').textContent = '無題目（URL 缺少 ?q=...）';
    return;
  }
  questions = await loadQuestionsByIds(ids);
  if (questions.length === 0) {
    $('#meta').textContent = '題目載入失敗';
    return;
  }
  $('#meta').textContent = `共 ${questions.length} 題`;
  render();
}

function htmlToText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || '';
}

function makeHeader(q, i) {
  const card = document.createElement('section');
  card.className = `q q--${q._kind}`;
  card.dataset.i = String(i);

  const h = document.createElement('div');
  h.className = 'q__prompt';
  h.textContent = `${i + 1}. ${q.prompt_zh || q.question}`;
  card.appendChild(h);

  if (q.prompt_zh && q.question && q.prompt_zh !== q.question) {
    const en = document.createElement('div');
    en.className = 'q__en';
    en.textContent = q.question;
    card.appendChild(en);
  }
  return card;
}

function renderMcq(q, i) {
  const card = makeHeader(q, i);
  const opts = document.createElement('div');
  opts.className = 'q__opts';
  q.options.forEach((opt, oi) => {
    const id = `q${i}o${oi}`;
    const wrapL = document.createElement('label');
    wrapL.className = 'opt';
    wrapL.htmlFor = id;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `q${i}`;
    radio.id = id;
    radio.value = String(oi);
    const span = document.createElement('span');
    span.innerHTML = opt; // W3Schools options legitimately contain <code> markup
    wrapL.append(radio, span);
    opts.appendChild(wrapL);
  });
  card.appendChild(opts);
  return card;
}

function renderFitb(q, i) {
  const card = makeHeader(q, i);
  const pre = document.createElement('pre');
  pre.className = 'q__code';
  // q.code uses @(N) markers, where N is a width hint
  const parts = q.code.split(/@\((\d+)\)/);
  parts.forEach((part, j) => {
    if (j % 2 === 0) {
      const span = document.createElement('span');
      span.textContent = part;
      pre.appendChild(span);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'fitb-blank';
      input.dataset.q = String(i);
      input.size = String(Math.max(parseInt(part, 10) || 4, 4));
      input.spellcheck = false;
      input.autocapitalize = 'off';
      input.autocomplete = 'off';
      pre.appendChild(input);
    }
  });
  card.appendChild(pre);
  return card;
}

function renderDragdrop(q, i) {
  const card = makeHeader(q, i);

  // Options bar — drag or click to place into next empty slot.
  const optsBar = document.createElement('div');
  optsBar.className = 'dd-options';
  optsBar.dataset.q = String(i);
  q.options.forEach((opt, oi) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd-option';
    btn.dataset.qi = String(i);
    btn.dataset.oi = String(oi);
    btn.draggable = true;
    btn.innerHTML = opt;
    btn.addEventListener('click', () => placeOption(i, oi));
    btn.addEventListener('dragstart', (e) => {
      if (btn.disabled) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', `${i}:${oi}`);
      e.dataTransfer.effectAllowed = 'move';
      btn.classList.add('dragging');
    });
    btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
    optsBar.appendChild(btn);
  });
  // Drop on the options bar = move a filled slot's option back here.
  optsBar.addEventListener('dragover', (e) => {
    const data = e.dataTransfer.types.includes('text/plain');
    if (!data) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    optsBar.classList.add('drop-hover');
  });
  optsBar.addEventListener('dragleave', () => optsBar.classList.remove('drop-hover'));
  optsBar.addEventListener('drop', (e) => {
    e.preventDefault();
    optsBar.classList.remove('drop-hover');
    const raw = e.dataTransfer.getData('text/plain') || '';
    const m = raw.match(/^(\d+):(\d+)(?::slot(\d+))?$/);
    if (!m) return;
    const qi = parseInt(m[1], 10);
    const fromSlot = m[3] !== undefined ? parseInt(m[3], 10) : null;
    if (qi !== i || fromSlot === null) return; // only handles slot → bar
    clearSlot(i, fromSlot);
  });
  card.appendChild(optsBar);

  // Template: every run of 3+ underscores becomes a slot.
  const tpl = document.createElement('pre');
  tpl.className = 'q__dd-template';
  const segments = q.template.split(/(_{3,})/);
  let slotIdx = 0;
  segments.forEach((seg) => {
    if (/^_{3,}$/.test(seg)) {
      const slot = document.createElement('span');
      const si = slotIdx++;
      slot.className = 'dd-slot';
      slot.dataset.qi = String(i);
      slot.dataset.si = String(si);
      slot.dataset.oi = '';
      slot.textContent = '___';
      slot.addEventListener('click', () => clearSlot(i, si));
      // Filled slot is itself draggable (slot → slot, slot → options bar).
      slot.draggable = true;
      slot.addEventListener('dragstart', (e) => {
        if (slot.dataset.oi === '') { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', `${i}:${slot.dataset.oi}:slot${si}`);
        e.dataTransfer.effectAllowed = 'move';
        slot.classList.add('dragging');
      });
      slot.addEventListener('dragend', () => slot.classList.remove('dragging'));
      // Drop a button or another slot's content into this slot.
      slot.addEventListener('dragover', (e) => {
        if (!e.dataTransfer.types.includes('text/plain')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('drop-hover');
      });
      slot.addEventListener('dragleave', () => slot.classList.remove('drop-hover'));
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drop-hover');
        const raw = e.dataTransfer.getData('text/plain') || '';
        const m = raw.match(/^(\d+):(\d+)(?::slot(\d+))?$/);
        if (!m) return;
        const qi = parseInt(m[1], 10);
        const oi = parseInt(m[2], 10);
        const fromSlot = m[3] !== undefined ? parseInt(m[3], 10) : null;
        if (qi !== i) return;
        if (fromSlot !== null && fromSlot === si) return; // self
        if (fromSlot !== null) {
          // slot → slot: clear source first, then fill this slot (swap if needed)
          const srcSlot = card.querySelector(`.dd-slot[data-si="${fromSlot}"]`);
          if (!srcSlot) return;
          const srcOi = srcSlot.dataset.oi;
          srcSlot.dataset.oi = '';
          srcSlot.textContent = '___';
          if (slot.dataset.oi !== '') {
            // swap: put existing into source slot
            const existingOi = slot.dataset.oi;
            const existingBtn = card.querySelector(`.dd-option[data-oi="${existingOi}"]`);
            srcSlot.dataset.oi = existingOi;
            srcSlot.innerHTML = existingBtn ? existingBtn.innerHTML : existingOi;
          }
          slot.dataset.oi = String(srcOi);
          const srcBtn = card.querySelector(`.dd-option[data-oi="${srcOi}"]`);
          slot.innerHTML = srcBtn ? srcBtn.innerHTML : srcOi;
        } else {
          // option button → slot
          const btn = card.querySelector(`.dd-option[data-oi="${oi}"]`);
          if (!btn || btn.disabled) return;
          if (slot.dataset.oi !== '') {
            // replace: send existing back to options bar
            const existingOi = slot.dataset.oi;
            const existingBtn = card.querySelector(`.dd-option[data-oi="${existingOi}"]`);
            if (existingBtn) { existingBtn.classList.remove('used'); existingBtn.disabled = false; }
          }
          slot.dataset.oi = String(oi);
          slot.innerHTML = btn.innerHTML;
          btn.classList.add('used');
          btn.disabled = true;
        }
      });
      tpl.appendChild(slot);
    } else {
      const span = document.createElement('span');
      span.innerHTML = seg;
      tpl.appendChild(span);
    }
  });
  card.appendChild(tpl);

  const hint = document.createElement('div');
  hint.className = 'q__hint';
  hint.textContent = '拖曳或點選選項到空格；空格中的選項拖回上方/點擊可取消，也可拖到其他空格交換。';
  card.appendChild(hint);
  return card;
}

function placeOption(qi, oi) {
  const card = document.querySelector(`.q[data-i="${qi}"]`);
  if (!card) return;
  const btn = card.querySelector(`.dd-option[data-oi="${oi}"]`);
  if (!btn || btn.disabled) return;
  const slot = [...card.querySelectorAll('.dd-slot')].find(s => s.dataset.oi === '');
  if (!slot) return; // all slots filled
  slot.dataset.oi = String(oi);
  slot.innerHTML = btn.innerHTML;
  btn.classList.add('used');
  btn.disabled = true;
}

function clearSlot(qi, si) {
  const card = document.querySelector(`.q[data-i="${qi}"]`);
  if (!card) return;
  const slot = card.querySelector(`.dd-slot[data-si="${si}"]`);
  if (!slot || slot.dataset.oi === '') return;
  const oi = slot.dataset.oi;
  slot.dataset.oi = '';
  slot.textContent = '___';
  const btn = card.querySelector(`.dd-option[data-oi="${oi}"]`);
  if (btn) { btn.classList.remove('used'); btn.disabled = false; }
}

function render() {
  const wrap = $('#questions');
  wrap.innerHTML = '';
  questions.forEach((q, i) => {
    let card;
    if (q._kind === 'mcq') card = renderMcq(q, i);
    else if (q._kind === 'fitb') card = renderFitb(q, i);
    else if (q._kind === 'dragdrop') card = renderDragdrop(q, i);
    else if (q._kind === 'challenge') card = renderChallenge(q, i);
    if (card) wrap.appendChild(card);
  });
}

// Inject `<base href>` so relative URLs (img, link, script, audio/video, …)
// resolve to data/assets/<lang>/, the local mirror built by
// scripts/build-asset-cache.js. Keeps previews working offline and immune to
// W3Schools removing or renaming assets.
function challengeSrcdoc(code, lang) {
  if (!code) return '';
  const assetBase = new URL(`../data/assets/${lang}/`, location.href).href;
  const base = `<base href="${assetBase}">`;
  if (/<head[^>]*>/i.test(code)) {
    return code.replace(/<head[^>]*>/i, m => `${m}\n${base}`);
  }
  if (/<html[^>]*>/i.test(code)) {
    return code.replace(/<html[^>]*>/i, m => `${m}\n<head>${base}</head>`);
  }
  return base + code;
}

function renderChallenge(q, i) {
  const card = makeHeader(q, i);

  if (q.intro) {
    const intro = document.createElement('div');
    intro.className = 'q__intro';
    intro.innerHTML = q.intro;
    card.appendChild(intro);
  }

  // html / css starter is a full HTML document → render in an <iframe> preview.
  // C cannot run in the browser → no preview, just editor + checklist.
  const lang = q._parsed && q._parsed.lang;
  const hasPreview = lang === 'html' || lang === 'css';

  const wrap = document.createElement('div');
  wrap.className = 'q__challenge-wrap' + (hasPreview ? ' has-preview' : '');

  // Editor (textarea, monospace).
  const editorPane = document.createElement('div');
  editorPane.className = 'q__editor-pane';
  const editorLabel = document.createElement('div');
  editorLabel.className = 'q__pane-label';
  editorLabel.textContent = 'Code';
  editorPane.appendChild(editorLabel);
  const editor = document.createElement('textarea');
  editor.className = 'q__editor';
  editor.dataset.q = String(i);
  editor.value = q.starter || '';
  editor.spellcheck = false;
  editor.autocapitalize = 'off';
  editor.autocomplete = 'off';
  editor.rows = Math.max(10, Math.min(24, (q.starter || '').split('\n').length + 2));
  editorPane.appendChild(editor);
  wrap.appendChild(editorPane);

  // Live preview pane (html/css only).
  let preview = null;
  if (hasPreview) {
    const previewPane = document.createElement('div');
    previewPane.className = 'q__preview-pane';
    const previewLabel = document.createElement('div');
    previewLabel.className = 'q__pane-label';
    previewLabel.textContent = '預覽';
    previewPane.appendChild(previewLabel);
    preview = document.createElement('iframe');
    preview.className = 'q__preview';
    preview.dataset.q = String(i);
    preview.sandbox = 'allow-same-origin';   // static doc; no script execution
    preview.srcdoc = challengeSrcdoc(q.starter || '', lang);
    previewPane.appendChild(preview);
    wrap.appendChild(previewPane);
  }
  card.appendChild(wrap);

  // Live regex checklist.
  const list = document.createElement('ul');
  list.className = 'q__checklist';
  list.dataset.q = String(i);
  (q.requirements || []).forEach((r, ri) => {
    const li = document.createElement('li');
    li.dataset.ri = String(ri);
    li.dataset.passed = '0';
    li.innerHTML = `<span class="check">○</span> <span class="label">${r.label || r.id || ''}</span>`;
    list.appendChild(li);
  });
  card.appendChild(list);

  // Wire input: checklist updates immediately, preview is debounced.
  let previewTimer = null;
  editor.addEventListener('input', () => {
    updateChecklist(i);
    if (preview) {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        preview.srcdoc = challengeSrcdoc(editor.value, lang);
      }, 300);
    }
  });

  // Initial pass on the starter (most fail).
  setTimeout(() => updateChecklist(i), 0);
  return card;
}

function updateChecklist(qi) {
  const q = questions[qi];
  if (!q || q._kind !== 'challenge') return;
  const card = document.querySelector(`.q[data-i="${qi}"]`);
  if (!card) return;
  const editor = card.querySelector('textarea.q__editor');
  const items = card.querySelectorAll('ul.q__checklist > li');
  if (!editor || !items.length) return;
  const code = editor.value;
  items.forEach((li, ri) => {
    const r = q.requirements[ri];
    if (!r) return;
    let passed = false;
    try {
      const re = new RegExp(r.pattern, r.flags || '');
      passed = re.test(code);
    } catch { /* invalid regex */ }
    li.dataset.passed = passed ? '1' : '0';
    li.classList.toggle('passed', passed);
    const mark = li.querySelector('.check');
    if (mark) mark.textContent = passed ? '✓' : '○';
  });
}

function normalize(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function collect() {
  const sid = $('#sid').value.trim();
  const answers = [];
  questions.forEach((q, i) => {
    if (q._kind === 'mcq') {
      const checked = document.querySelector(`input[name="q${i}"]:checked`);
      if (!checked) return;
      const sel = parseInt(checked.value, 10);
      answers.push({
        id: q._id,
        kind: 'mcq',
        questionEn: q.question,
        selected: sel,
        correct: sel === q.correct,
      });
    } else if (q._kind === 'fitb') {
      const blanks = [...document.querySelectorAll(`input.fitb-blank[data-q="${i}"]`)];
      const vals = blanks.map(b => b.value);
      if (vals.every(v => !v.trim())) return;
      let bi = 0;
      const filled = q.code.replace(/@\(\d+\)/g, () => vals[bi++] || '');
      const ok = normalize(filled) === normalize(q.solution)
        || (q.alternatives || []).some(a => normalize(filled) === normalize(a));
      answers.push({
        id: q._id,
        kind: 'fitb',
        questionEn: q.question,
        selected: filled,
        correct: ok,
      });
    } else if (q._kind === 'dragdrop') {
      const card = document.querySelector(`.q[data-i="${i}"]`);
      const slots = card ? [...card.querySelectorAll('.dd-slot')] : [];
      const sel = slots.map(s => s.dataset.oi === '' ? -1 : parseInt(s.dataset.oi, 10));
      if (sel.every(v => v === -1)) return;
      const ok = sel.length === q.correct.length && sel.every((v, j) => v === q.correct[j]);
      answers.push({
        id: q._id,
        kind: 'dragdrop',
        questionEn: q.question,
        selected: JSON.stringify(sel),
        correct: ok,
      });
    } else if (q._kind === 'challenge') {
      const card = document.querySelector(`.q[data-i="${i}"]`);
      const editor = card ? card.querySelector('textarea.q__editor') : null;
      const code = editor ? editor.value : '';
      if (!code.trim() || code.trim() === (q.starter || '').trim()) return;
      const reqs = q.requirements || [];
      const passedIds = reqs.map(r => {
        try {
          const re = new RegExp(r.pattern, r.flags || '');
          return re.test(code) ? (r.id || '') : null;
        } catch { return null; }
      }).filter(x => x !== null);
      const ok = reqs.length > 0 && passedIds.length === reqs.length;
      answers.push({
        id: q._id,
        kind: 'challenge',
        questionEn: q.question,
        selected: code,
        correct: ok,
        meta: { passed: passedIds, total: reqs.length },
      });
    }
  });
  return { sid, answers };
}

async function submit() {
  const btn = $('#submit');
  const out = $('#result');
  out.textContent = '';
  const { sid, answers } = collect();
  if (!/^[A-Za-z0-9]{4,15}$/.test(sid)) {
    out.textContent = '學號格式錯誤（英數 4–15 碼）';
    return;
  }
  if (answers.length === 0) {
    out.textContent = '至少作答一題再提交';
    return;
  }
  // valid id → remember for future visits on the same browser
  try { localStorage.setItem(SID_KEY, sid); } catch {}
  btn.disabled = true;
  out.textContent = '提交中…';
  try {
    const r = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ studentId: sid, answers }),
    });
    const j = await r.json();
    if (j && j.ok) {
      const k = answers.filter(a => a.correct).length;
      out.textContent = `✓ 已提交 ${j.count} 題，答對 ${k} 題`;
    } else {
      out.textContent = `提交失敗：${(j && j.error) || r.status}`;
      btn.disabled = false;
    }
  } catch (e) {
    out.textContent = `網路錯誤：${e}`;
    btn.disabled = false;
  }
}

$('#submit').addEventListener('click', submit);
init();
