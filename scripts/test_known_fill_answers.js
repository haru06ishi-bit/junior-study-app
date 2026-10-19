const fs=require('fs'),assert=require('node:assert/strict');
const j=JSON.parse(fs.readFileSync('data/questions.json','utf8'));
const js=fs.readFileSync('data/questions.js','utf8');
const d=JSON.parse(js.slice('window.QUESTION_DATA = '.length).replace(/;\s*$/,''));
assert.deepEqual(j,d,'questions.json and questions.js must match');
const byId=id=>j.questions.find(q=>q.id===id);
assert.deepEqual(byId('v032_so_ms_fill_02').blanks,[['情報','情報化']]);
for(const id of ['v036sci_keirinkan_naturehuman_2','v036sci_tokyoshoseki_naturehuman_2'])assert.deepEqual(byId(id).blanks,[['再生']]);
console.log('PASS known fill answer aliases');
