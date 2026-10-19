const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app.js','utf8');
const begin = source.indexOf('function displayQuestionText(q){');
const end = source.indexOf('function renderQuestion(){', begin);
assert(begin !== -1 && end > begin, 'displayQuestionText should exist');
const context = vm.createContext({});
vm.runInContext(source.slice(begin,end),context);
const display = context.displayQuestionText;
assert.equal(display({type:'fill',question:'日本の国会は（1）と (2) からなる。',blanks:['a','b']}),
 '日本の国会は【空欄1】と 【空欄2】 からなる。');
assert.equal(display({type:'fill',question:'（１）について説明しなさい。',blanks:['a']}),
 '【空欄1】について説明しなさい。');
assert.equal(display({type:'fill',question:'（3）は問題番号で、（1）が空欄。',blanks:['a']}),
 '（3）は問題番号で、【空欄1】が空欄。');
assert.equal(display({type:'choice',question:'（1）を選べ',choices:['a']}),'（1）を選べ');
assert.equal(display({type:'fill',question:'答えは？',blanks:['a']}),'答えは？');
assert.equal((source.match(/textContent=displayQuestionText\(q\)/g)||[]).length,2,'normal and mock quiz should use displayQuestionText');
assert(source.includes('displayQuestionText({...q,question:line})'),'passage markers should be highlighted');
assert(source.includes('問題文の【空欄1】【空欄2】'),'answer inputs should explain mapping');
console.log('PASS fill blank visibility regression (7 assertions)');
