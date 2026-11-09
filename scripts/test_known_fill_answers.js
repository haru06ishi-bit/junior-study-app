const fs=require('fs'),assert=require('node:assert/strict');
const j=JSON.parse(fs.readFileSync('data/questions.json','utf8'));
const js=fs.readFileSync('data/questions.js','utf8');
const d=JSON.parse(js.slice('window.QUESTION_DATA = '.length).replace(/;\s*$/,''));
assert.deepEqual(j,d,'questions.json and questions.js must match');
const byId=id=>j.questions.find(q=>q.id===id);
assert.deepEqual(byId('v032_so_ms_fill_02').blanks,[['情報','情報化']]);
for(const id of ['v036sci_keirinkan_naturehuman_2','v036sci_tokyoshoseki_naturehuman_2'])assert.deepEqual(byId(id).blanks,[['再生']]);
console.log('PASS known fill answer aliases');

// Exercise the actual normalizer used by both quiz and mock-test grading.
const vm=require('node:vm'),app=fs.readFileSync('app.js','utf8');
const normalizer=app.match(/function normalizeText\(v\)\{[^\n]+\}/)[0];
const ctx={};vm.runInNewContext(normalizer,ctx);
assert.equal(ctx.normalizeText(' STUDY. '),ctx.normalizeText('study'));
assert.equal(ctx.normalizeText('ｄｏｎ’ｔ.'),ctx.normalizeText("don't"));
assert.notEqual(ctx.normalizeText('3.14'),ctx.normalizeText('314'));
assert.notEqual(ctx.normalizeText('were'),ctx.normalizeText('where'));
let fillCount=0;
for(const q of j.questions.filter(q=>q.subject==='english'&&q.type==='fill')){
  assert.match(q.question,/日本語：.+（各空欄は1語）/,'meaning and one-word instruction: '+q.id);
  assert.equal((q.question.split('日本語：')[0].match(/（\d+）/g)||[]).length>=q.blanks.length,true);
  fillCount++;
}
assert.equal(fillCount,201,'all existing English fill prompts audited');
const accepts=(id,word)=>byId(id).blanks[0].some(a=>ctx.normalizeText(a)===ctx.normalizeText(word));
for(const [id,words] of [
  ['v035_en_sanseido_g2_03_2',['study','learn.']],
  ['v034_san_e3_l1_01',['seen','watched']],
  ['v034_san_e3_l2_01',['studying','learning']],
  ['v034_san_e3_l4_02',['painted','drawn']],
  ['v034_tok_e3_u1_01',['eaten','had']],
  ['v034_kai_e3_p1_01',['eaten','had']],
  ['v034_san_e3_l3_01',['built','constructed']],
  ['v040_en_sanseido_1_05_2',['Can','Could','Will','Would']],
]) for(const word of words)assert(accepts(id,word),`${id}: ${word}`);
for(const word of ['finished','done','completed'])assert(byId('v030_en_fill_01').blanks[1].includes(word),word+' homework accepted');
assert(!byId('v030_en_fill_01').blanks[1].includes('did'),'wrong participle rejected');
assert(!accepts('v034_san_e3_l8_01','works'),'translation constrains lives, not works');
assert(!accepts('v034_san_e3_l1_01','saw'),'wrong participle rejected');
assert.deepEqual(byId('v034_kai_e3_p3_06').answers,[0,1]);
console.log(`PASS English fill meanings (${fillCount}), aliases, punctuation, and tell construction`);
