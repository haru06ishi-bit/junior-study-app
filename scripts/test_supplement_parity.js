// Compare JavaScript-executed supplement IDs with the strict Python loader.
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(path.join(root, 'data')).filter(n => /^question-supplement-v.*\.js$/.test(n)).sort();
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const name of files) vm.runInContext(fs.readFileSync(path.join(root, 'data', name), 'utf8'), sandbox, {filename:name});
const jsExtras = (sandbox.window.QUESTION_SUPPLEMENTS || []).flatMap(s => s.questions || []).map(q => q.id);
const pyCode = 'import json,sys;sys.path.insert(0,"scripts");from question_bank_loader import load_questions;print(json.dumps([q["id"] for q in load_questions()],ensure_ascii=False))';
let output;
for (const cmd of ['python', 'python3']) {
  const r = cp.spawnSync(cmd, ['-c', pyCode], {cwd: root, encoding:'utf8'});
  if (!r.error) { if (r.status !== 0) throw new Error(r.stderr || 'Python loader failed'); output=r.stdout; break; }
}
if (!output) throw new Error('Python executable unavailable');
const pyIDs=JSON.parse(output.trim());
const base=JSON.parse(fs.readFileSync(path.join(root, 'data/questions.json'),'utf8')).questions.map(q=>q.id);
const expected=[...base,...jsExtras];
if (JSON.stringify(pyIDs)!==JSON.stringify(expected)) throw new Error('Browser/Python supplement question IDs differ');
if (new Set(expected).size!==expected.length) throw new Error('Duplicate question IDs');
console.log('PASS supplement parity: '+jsExtras.length+' supplement questions');
