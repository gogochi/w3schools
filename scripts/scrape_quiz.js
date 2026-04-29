const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

function parsePage(html) {
  const m = (re) => html.match(re)?.[1];
  const question = m(/<p id="qtext">([\s\S]*?)<\/p>/);
  const qNum = m(/Question\s+(\d+)\s+of\s+(\d+)/);
  const total = html.match(/Question\s+\d+\s+of\s+(\d+)/)?.[1];
  const starttime = m(/name="starttime"\s+value="([^"]*)"/);
  const timestamp = m(/name="timestamp"\s+value="([^"]*)"/);
  const answers = m(/name="answers"\s+value="([^"]*)"/);
  const prevnumber = m(/name="prevnumber"\s+value="([^"]*)"/);
  const v = m(/action='[^']*v=(\d+)/);

  // 選項：按 label1, label2, label3, label4 順序，內含 radio value
  const labels = [];
  const labelRe = /<label[^>]*id='label(\d+)'[^>]*>([\s\S]*?)<\/label>/g;
  let lm;
  while ((lm = labelRe.exec(html)) !== null) {
    const labelId = lm[1];
    const inner = lm[2];
    const valM = inner.match(/value='(\d+)'/);
    const text = inner.replace(/<input[^>]*>/g, '').replace(/<span[^>]*><\/span>/g, '').trim();
    labels.push({ labelId: parseInt(labelId), value: valM ? parseInt(valM[1]) : null, text });
  }
  // sort by labelId
  labels.sort((a, b) => a.labelId - b.labelId);

  return { question, qNum, total, starttime, timestamp, answers, prevnumber, v, options: labels };
}

const PHP_TESTS = new Set(['C', 'VUE']);
const ext = (qtest) => PHP_TESTS.has(qtest.toUpperCase()) ? 'php' : 'asp';

async function fetchInitial(qtest) {
  const r = await fetch(`https://www.w3schools.com/quiztest/quiztest.${ext(qtest)}?qtest=${qtest}`, {
    headers: { 'User-Agent': UA },
  });
  return { html: await r.text(), cookies: r.headers.get('set-cookie') || '' };
}

async function postNext({ qtest, v, starttime, timestamp, answers, prevnumber, nextnumber, choice, cookies }) {
  const body = new URLSearchParams({
    starttime,
    timestamp,
    answers,
    nextnumber: String(nextnumber),
    prevnumber: String(prevnumber),
    quiz: String(choice),
  });
  const e = ext(qtest);
  const r = await fetch(`https://www.w3schools.com/quiztest/quiztest.${e}?qtest=${qtest}&v=${v}`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies,
      'Referer': `https://www.w3schools.com/quiztest/quiztest.${e}?qtest=${qtest}`,
    },
    body: body.toString(),
    redirect: 'follow',
  });
  return await r.text();
}

async function scrape(qtest) {
  console.log(`[${qtest}] starting…`);
  const init = await fetchInitial(qtest);
  let html = init.html;
  let parsed = parsePage(html);
  const total = parseInt(parsed.total);
  console.log(`[${qtest}] total questions: ${total}`);

  const questions = [];
  let cookies = init.cookies.split(',').map(c => c.split(';')[0].trim()).join('; ');

  const baseUrl = `https://www.w3schools.com/quiztest/quiztest.${ext(qtest)}?qtest=${qtest}`;
  for (let n = 1; n <= total; n++) {
    questions.push({
      number: n,
      question: parsed.question?.trim(),
      options: parsed.options.map(o => ({ value: o.value, text: o.text })),
      correct: null,
      url: baseUrl,
    });

    if (n < total) {
      // POST to advance: pick the first option (value of first label)
      const firstChoice = parsed.options[0]?.value || 1;
      html = await postNext({
        qtest,
        v: parsed.v,
        starttime: parsed.starttime,
        timestamp: parsed.timestamp,
        answers: parsed.answers,
        prevnumber: parsed.prevnumber,
        nextnumber: n + 1,
        choice: firstChoice,
        cookies,
      });
      parsed = parsePage(html);
      if (parseInt(parsed.prevnumber) !== n + 1) {
        console.warn(`[${qtest}] WARN: expected prevnumber=${n+1}, got ${parsed.prevnumber}`);
      }
    }
  }
  console.log(`[${qtest}] done. captured ${questions.length} questions.`);
  return { test: qtest, total, questions };
}

// Preserve translations from existing JSON: use prompt_zh and number/question key.
function mergeOldTranslations(newData, outFile) {
  if (!fs.existsSync(outFile)) return 0;
  let old;
  try { old = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch { return 0; }
  if (!old.questions) return 0;
  let merged = 0;
  // build lookup by question text (more stable than number, which can shift if W3S adds questions)
  const byText = new Map();
  for (const q of old.questions) {
    if (q.question && (q.prompt_zh || q.options_translations || q.correct !== null)) {
      byText.set(q.question.trim(), q);
    }
  }
  for (const q of newData.questions) {
    const oldQ = byText.get(q.question?.trim());
    if (!oldQ) continue;
    if (oldQ.prompt_zh) { q.prompt_zh = oldQ.prompt_zh; merged++; }
    if (oldQ.options_translations) q.options_translations = oldQ.options_translations;
    if (oldQ.correct !== null && oldQ.correct !== undefined) q.correct = oldQ.correct;
  }
  return merged;
}

(async () => {
  const tests = process.argv.slice(2);
  for (const qtest of tests) {
    const data = await scrape(qtest);
    const outFile = path.join(DATA_DIR, `w3s-${qtest.toLowerCase()}-quiz.json`);
    const merged = mergeOldTranslations(data, outFile);
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
    console.log(`[${qtest}] wrote ${outFile} (${fs.statSync(outFile).size} bytes), preserved ${merged} translations/answers`);
  }
})();
