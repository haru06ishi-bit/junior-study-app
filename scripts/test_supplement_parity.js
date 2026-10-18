// Verify data directory, HTML script load order, SW precache and Python loader parity.
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(path.join(root, 'data')).filter(n => /^question-supplement-v.*\.js$/.test(n)).sort();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const htmlFiles = [...html.matchAll(/<script\b[^>]*\bsrc=["']data\/(question-supplement-v[^"'?]+\.js)\?v=[^"']+["'][^>]*><\/script>/g)].map(m => m[1]);
const shell = sw.match(/const APP_SHELL\s*=\s*\[([\s\S]*?)\];/);
if (!shell) throw new Error('No SW APP_SHELL found');
const swFiles = [...shell[1].matchAll(/['"]\/data\/(question-supplement-v[^"'?]+\.js)\?v=[^"']+['"]/g)].map(m => m[1]);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
if (!same(files,htmlFiles) || !same(files,swFiles)) throw new Error('Supplement file list/order mismatch: data='+JSON.stringify(files)+' html='+JSON.stringify(htmlFiles)+' sw='+JSON.stringify(swFiles));
const sandbox={window:{}};
vm.createContext(sandbox);
for(const name of htmlFiles) vm.runInContext(fs.readFileSync(path.join(root,'data',name),'utf8'),sandbox,{filename:name});
const extras=(sandbox.window.QUESTION_SUPPLEMENTS||[]).flatMap(s=>s.questions||[]).map(q=>q.id);
const pyCode='import json,sys;sys.path.insert(0,"scripts");from question_bank_loader import load_questions;print(json.dumps([q["id"] for q in load_questions()],ensure_ascii=False))';
let output;
for(const cmd of ['python','python3']){
  const r=cp.spawnSync(cmd,['-c',pyCode],{cwd:root,encoding:'utf8'});
  if(!r.error){if(r.status!==0)throw new Error(r.stderr||'Python loader failed');output=r.stdout;break;}
}
if(!output)throw new Error('Python executable unavailable');
const py=JSON.parse(output.trim());
const base=JSON.parse(fs.readFileSync(path.join(root,'data/questions.json'),'utf8')).questions.map(q=>q.id);
const expected=[...base,...extras];
if(!same(py,expected))throw new Error('Browser/Python question IDs differ');
if(new Set(expected).size!==expected.length)throw new Error('Duplicate IDs');
console.log('PASS supplement parity: '+extras.length+' supplement questions');
