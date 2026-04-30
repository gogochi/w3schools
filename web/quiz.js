import { loadQuestionsByIds } from './lib.js';

const GAS_URL = '<PASTE_APPS_SCRIPT_EXEC_URL_HERE>';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const ids = (params.get('q') || '').split(',').map(s => s.trim()).filter(Boolean);

let questions = [];

async function init() {
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

  const tpl = document.createElement('div');
  tpl.className = 'q__dd-template';
  // Split template HTML on runs of 3+ underscores; each run becomes a <select>.
  const segments = q.template.split(/(_{3,})/);
  segments.forEach((seg) => {
    if (/^_{3,}$/.test(seg)) {
      const sel = document.createElement('select');
      sel.className = 'dd-slot';
      sel.dataset.q = String(i);
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '— 選 —';
      sel.appendChild(empty);
      q.options.forEach((opt, oi) => {
        const o = document.createElement('option');
        o.value = String(oi);
        o.textContent = htmlToText(opt);
        sel.appendChild(o);
      });
      tpl.appendChild(sel);
    } else {
      const span = document.createElement('span');
      span.innerHTML = seg;
      tpl.appendChild(span);
    }
  });
  card.appendChild(tpl);

  const hint = document.createElement('div');
  hint.className = 'q__hint';
  hint.textContent = '提示：每個選項只用一次。';
  card.appendChild(hint);
  return card;
}

function render() {
  const wrap = $('#questions');
  wrap.innerHTML = '';
  questions.forEach((q, i) => {
    let card;
    if (q._kind === 'mcq') card = renderMcq(q, i);
    else if (q._kind === 'fitb') card = renderFitb(q, i);
    else if (q._kind === 'dragdrop') card = renderDragdrop(q, i);
    if (card) wrap.appendChild(card);
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
      const slots = [...document.querySelectorAll(`select.dd-slot[data-q="${i}"]`)];
      const sel = slots.map(s => s.value === '' ? -1 : parseInt(s.value, 10));
      if (sel.every(v => v === -1)) return;
      const ok = sel.length === q.correct.length && sel.every((v, j) => v === q.correct[j]);
      answers.push({
        id: q._id,
        kind: 'dragdrop',
        questionEn: q.question,
        selected: JSON.stringify(sel),
        correct: ok,
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
