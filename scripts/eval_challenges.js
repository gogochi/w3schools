const fs = require('fs');
const path = require('path');
const vm = require('vm');

function compileDir(dir, language) {
  const out = { language, topics: {} };
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  for (const f of files) {
    const topic = f.replace(/\.js$/, '');
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const sandbox = { window: {}, console };
    sandbox.window.window = sandbox.window;
    try {
      vm.runInNewContext(src, sandbox, { filename: f, timeout: 5000 });
      const data = sandbox.window.CHALLENGE_DATA;
      if (!data) {
        out.topics[topic] = { error: 'no CHALLENGE_DATA' };
        continue;
      }
      out.topics[topic] = data.challenges || data;
    } catch (e) {
      out.topics[topic] = { error: e.message };
    }
  }
  return out;
}

const lang = process.argv[2] || 'html';
const dir = process.argv[3];
const outFile = process.argv[4];
const result = compileDir(dir, lang);
fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

const topicCount = Object.keys(result.topics).length;
const errors = Object.entries(result.topics).filter(([, v]) => v.error);
const totalChallenges = Object.values(result.topics)
  .filter(v => Array.isArray(v))
  .reduce((sum, arr) => sum + arr.length, 0);
console.log(`topics: ${topicCount}`);
console.log(`errors: ${errors.length}`);
console.log(`total challenges: ${totalChallenges}`);
console.log(`output: ${outFile} (${fs.statSync(outFile).size} bytes)`);
if (errors.length) console.log('error topics:', errors.map(([k]) => k).join(', '));
