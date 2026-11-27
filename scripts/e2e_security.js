// 実ブラウザでの安全性回帰テスト（v0.47.6）。
// 1) 細工したバックアップ／保存データによる XSS が起きない（追加・置き換え・直接書き込みの3経路、主要画面すべて）
// 2) 保存データが壊れても起動でき、元データの控えを残してから修復できる。正常なデータは消えない
// 3) 保存容量不足でも結果画面まで進み、利用者に知らせる。置き換えに失敗したら元に戻る
// 4) バックアップの「追加」で新しい学習履歴が消えない
// 5) 通常の利用で作ったデータを誤って「壊れている」と判定しない
// 既定はローカルの python http.server（CSPなし＝エスケープ層だけで防げることを確認）。
// E2E_BASE_URL=http://127.0.0.1:8788/ を指定すると wrangler pages dev（_headers の CSP あり）に対して実行する。
const {chromium}=require('playwright');
const cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
const root=path.resolve(__dirname,'..'),port=Number(process.env.E2E_PORT||8767);
const external=process.env.E2E_BASE_URL;const base=external||`http://127.0.0.1:${port}/`;
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'e2e-sec-'));
const P='<img src=x onerror="window.__xss=(window.__xss||0)+1" data-xss=1>';
const P2='"><svg onload="window.__xss=(window.__xss||0)+1" data-xss=1></svg>';
async function ready(){for(let i=0;i<80;i++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('server did not start');}
function evilData(realIds,wellTyped=false){
 const now=new Date().toISOString(),day=new Date(Date.now()+10*864e5).toISOString().slice(0,10);
 const s=v=>JSON.stringify(v);
 return {
  examPlans:s([{id:'e1',name:P,date:day,grade:2,units:['social/geography/world-overview'],materials:[P],purpose:P,auto:true},{id:'e2',name:P2,date:P,grade:P,units:[P]}]),
  mockExamResults:s([{id:'m1',examId:'e1',examName:P,at:now,grade:P,score:P,totalPoints:P,correct:P,total:P,rate:P,minutes:P,questionIds:realIds,answers:[{questionId:realIds[0],correct:false,answer:P}],pointsByQuestion:{[realIds[0]]:P}},{id:'m2',examId:'e1',examName:P2,at:now,grade:2,score:P,totalPoints:100,correct:1,total:2,rate:50,questionIds:realIds,answers:[],retryOf:'m1',rootAttemptId:'m1'}]),
  customQuestions:s([{id:'custom-x1',subject:'social',unit:'world-overview',field:'geography',grades:[P,1],type:'choice',question:P,choices:[P,P2,'c','d'],answer:0,explanation:P,textbookPublisher:P,materialIds:[P]},{id:'custom-x2',subject:P,unit:P,grades:[2],type:'text',question:P2,modelAnswer:P,explanation:P}]),
  studyHistory:s([{at:now,grade:P,subject:P,total:P,score:P,rate:P,mode:P,questionIds:[P],answerResults:[{questionId:P,correct:true,assist:P}],examId:P}]),
  missedQuestions:s([{questionId:P,count:P,lastAt:P}]),
  examStudyLogs:s([{id:P,examId:'e1',at:now,questionIds:[P],score:P,total:P,rate:P}]),
  paperDrafts:s([{id:P,createdAt:P,grade:P,subject:P,field:P,unit:P,text:P,questions:[{question:P}]}]),
  textbookStudyRanges:s([{id:P,title:P,pages:P,unitKeys:[P],subject:P}]),
  schoolTextbookPreference:s({district:P,overrides:{social:P,japanese:P}}),
  recallRecords:s({[P]:{stage:1,due:0,lastAt:P}}),
  lastQuizSelection:s({grade:P,subject:P,units:[P],count:P}),
  japaneseLearningPrefs:s({hardStart:P}),
  streakDays:wellTyped?'3':P,lastStudyDate:wellTyped?new Date().toISOString().slice(0,10):P
 };
}
async function visitAll(page){
 const go=async a=>{await page.evaluate(()=>goHome());await page.click(`[data-action=${a}]`);};
 await go('quiz');await page.locator('#subjectChoices .subject-btn',{hasText:'社会'}).click();
 const box=page.locator('#unitChoices input[type=checkbox]');if(await box.count())await box.first().check();
 await go('exam');if(await page.locator('.exam-plan-card .exam-edit').count()){await page.locator('.exam-plan-card .exam-edit').first().click();}
 await go('stats');const hist=page.locator('#mockExamHistory button, #mockExamHistory [data-result-id], #mockExamHistory .mock-history-item');if(await hist.count())await hist.first().click().catch(()=>{});
 await page.evaluate(()=>{const r=loadMockExamResults();if(r.length&&typeof showMockExamResultDetails==='function'){try{showMockExamResultDetails(r[r.length-1].id)}catch(e){}}});
 await go('manage');const edit=page.locator('#manageQuestionList [data-edit]');if(await edit.count())await edit.first().click();
 await go('textbooks');await go('backup');
 // 登録問題を実際に出題する
 await page.evaluate(()=>{const qs=state.questionBank.filter(q=>q.id&&q.id.startsWith('custom-x'));if(qs.length){state.session=qs;state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'quiz'};resetRecallSessionState();showView('playView');renderQuestion();}});
 if(await page.locator('#playView.active').count()){await page.click('#dontKnow').catch(()=>{});}
 await page.evaluate(()=>goHome());
}
async function assertNoXss(page,label){
 const r=await page.evaluate(()=>({flag:window.__xss||0,nodes:document.querySelectorAll('[data-xss]').length}));
 assert.deepEqual(r,{flag:0,nodes:0},`${label}: XSS executed or injected markup present`);
}
async function importBackup(page,data,mode){
 const file=path.join(TMP,`evil-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
 fs.writeFileSync(file,JSON.stringify({app:'30min-study',schemaVersion:1,exportedAt:P,data}));
 await page.evaluate(()=>goHome());await page.click('[data-action=backup]');
 await page.setInputFiles('#backupFile',file);
 await page.waitForSelector('#backupPreview:not([hidden])',{timeout:8000}).catch(async()=>{throw new Error('preview not shown: '+await page.locator('#importBackupStatus').textContent())});
 if(mode==='merge')await page.click('#mergeBackup');else await page.click('#replaceBackup');
}
async function newPage(browser,width){
 const ctx=await browser.newContext({viewport:{width,height:780}});const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_FAILED|net::/.test(m.text()))errors.push(m.text());});
 page.on('dialog',d=>d.accept());
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 await page.goto(base);await page.evaluate(()=>localStorage.clear());await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);
 return {ctx,page,errors};
}
async function quickQuiz(page,n=5){
 await page.evaluate(()=>goHome());await page.click('[data-action=quiz]');
 await page.locator('#gradeChoices .chip',{hasText:'中1'}).click();await page.locator('#subjectChoices .subject-btn',{hasText:'数学'}).click();
 await page.click('#selectWholeGradeRange');await page.locator(`#countChoices [data-count="${n}"]`).click();await page.click('#startQuiz');
 let g=0;while(await page.locator('#playView.active').count()&&g++<30){await page.click('#dontKnow');await page.click('#nextQuestion');}
}
async function run(width){
 const browser=await chromium.launch(process.env.E2E_BROWSER_CHANNEL?{channel:process.env.E2E_BROWSER_CHANNEL}:{});
 const results=[];
 try{
  // ---- 1. XSS（追加・置き換え・直接書き込み） ----
  for(const mode of['merge','replace','direct']){
   const {ctx,page,errors}=await newPage(browser,width);
   const realIds=await page.evaluate(()=>state.questionBank.filter(q=>q.subject==='social').slice(0,2).map(q=>q.id));
   const data=evilData(realIds,mode==='replace');
   if(mode==='direct'){await page.evaluate(d=>{for(const[k,v]of Object.entries(d))localStorage.setItem(k,v);},data);await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);}
   else{await importBackup(page,data,mode);await assertNoXss(page,`${mode} preview`);}
   await visitAll(page);await assertNoXss(page,`${mode} all views`);
   await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);await visitAll(page);await assertNoXss(page,`${mode} after reload`);
   assert.deepEqual(errors,[],`${mode}: page errors`);results.push(`xss-${mode}`);await ctx.close();
  }
  // ---- 2. 破損データでも起動・控え・修復 ----
  const corruptCases={missedQuestions:'{oops',studyHistory:'{"a":1}',customQuestions:'{"a":1}',mockExamResults:'"text"',examPlans:'[1,2',recallRecords:'[1]',schoolTextbookPreference:'{bad',streakDays:'abc'};
  for(const[key,raw]of Object.entries(corruptCases)){
   const {ctx,page,errors}=await newPage(browser,width);
   const valid=JSON.stringify([{questionId:'so001',count:2,lastAt:new Date().toISOString()}]);
   await page.evaluate(([key,raw,valid])=>{localStorage.setItem(key,raw);if(key!=='missedQuestions')localStorage.setItem('missedQuestions',valid);localStorage.setItem('streakDays',key==='streakDays'?raw:'4');},[key,raw,valid]);
   await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);
   assert.equal(await page.locator('#dataRepairBanner').isVisible(),true,`${key}: repair banner`);
   const q=await page.evaluate(k=>JSON.parse(localStorage.getItem('studyDataQuarantine')||'{}')[k]?.[0]?.raw,key);
   assert.equal(q,raw,`${key}: raw value copied to quarantine`);
   assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),raw,`${key}: original not modified before repair`);
   await quickQuiz(page,5);assert.equal(await page.locator('#resultView.active').count(),1,`${key}: quiz works with corrupt data`);
   await page.evaluate(()=>goHome());await page.click('[data-action=stats]');await page.evaluate(()=>goHome());
   if(await page.locator('#dataRepairBanner').isVisible())await page.click('#repairStoredData');
   assert.equal(await page.locator('#dataRepairBanner').isVisible(),false,`${key}: banner hidden after repair`);
   if(key!=='missedQuestions'){const kept=await page.evaluate(()=>JSON.parse(localStorage.getItem('missedQuestions')).some(x=>x.questionId==='so001'));assert(kept,`${key}: unrelated valid data kept`);}
   await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);
   assert.equal(await page.locator('#dataRepairBanner').isVisible(),false,`${key}: stays repaired`);
   assert.deepEqual(errors,[],`${key}: page errors`);await ctx.close();
  }
  results.push('corrupt-keys');
  {// 一部だけ不正な配列：正常な要素はすべて残る
   const {ctx,page,errors}=await newPage(browser,width);
   const now=new Date().toISOString();
   await page.evaluate(now=>localStorage.setItem('missedQuestions',JSON.stringify([{questionId:'a1',count:1,lastAt:now},null,{questionId:'a2',count:3},7,{nope:1},{questionId:'a3'}])),now);
   await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);
   await page.click('#repairStoredData');
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('missedQuestions')).map(x=>x.questionId)),['a1','a2','a3']);
   assert.deepEqual(errors,[]);await ctx.close();results.push('partial-repair');
  }
  // ---- 3. 保存容量不足 ----
  {
   const {ctx,page,errors}=await newPage(browser,width);
   await page.evaluate(()=>{const orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(window.__quotaKeys&&window.__quotaKeys.includes(k)){if(window.__quotaOnce)window.__quotaKeys=window.__quotaKeys.filter(x=>x!==k);throw new DOMException('The quota has been exceeded.','QuotaExceededError');}return orig.call(this,k,v);};window.__quotaKeys=['studyHistory','missedQuestions','recallRecords','streakDays','lastStudyDate'];});
   await quickQuiz(page,5);
   assert.equal(await page.locator('#resultView.active').count(),1,'quota: result view reached');
   assert.equal(await page.locator('#appNotice').isVisible(),true,'quota: notice shown');
   assert.match(await page.locator('#appNotice').textContent(),/保存容量/);
   assert.deepEqual(errors,[],'quota: page errors');
   // 置き換えの途中で失敗したら元に戻る
   await page.evaluate(()=>{window.__quotaKeys=[];localStorage.setItem('examPlans',JSON.stringify([{id:'keep',name:'元の計画',date:'2026-12-01',grade:2,units:[]}]));});
   const good={examPlans:JSON.stringify([{id:'new',name:'新しい計画',date:'2026-12-02',grade:2,units:[]}]),studyHistory:'[]'};
   await page.evaluate(()=>{window.__quotaKeys=['examPlans'];window.__quotaOnce=true;});
   await importBackup(page,good,'replace');
   await page.evaluate(()=>{window.__quotaKeys=[];});
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('examPlans'))[0].id),'keep','failed replace restores original data');
   await ctx.close();results.push('quota');
  }
  // ---- 4. バックアップ「追加」で新しい履歴が消えない／壊れた項目があると置き換え不可 ----
  {
   const {ctx,page,errors}=await newPage(browser,width);
   const mk=(i,off)=>({at:new Date(Date.UTC(2026,9,1)+(off+i)*36e5).toISOString(),grade:2,subject:'math',total:5,score:3,rate:60,mode:'quiz',questionIds:['q'+off+'-'+i]});
   await page.evaluate(h=>localStorage.setItem('studyHistory',JSON.stringify(h)),Array.from({length:300},(_,i)=>mk(i,1000)));
   await importBackup(page,{studyHistory:JSON.stringify(Array.from({length:50},(_,i)=>mk(i,0)))},'merge');
   const kept=await page.evaluate(()=>{const h=JSON.parse(localStorage.getItem('studyHistory'));return{len:h.length,newest:h.filter(x=>x.questionIds[0].startsWith('q1000')).length};});
   assert.deepEqual(kept,{len:300,newest:300},'merge keeps all newer local history');
   await page.evaluate(()=>goHome());await page.click('[data-action=backup]');
   const file=path.join(TMP,`partial-${Date.now()}.json`);fs.writeFileSync(file,JSON.stringify({app:'30min-study',schemaVersion:1,data:{studyHistory:'{oops',missedQuestions:'[]'}}));
   await page.setInputFiles('#backupFile',file);
   await page.waitForFunction(()=>/壊れていて読めない/.test(document.getElementById('backupPreview').textContent),null,{timeout:8000});
   assert.equal(await page.locator('#replaceBackup').isDisabled(),true,'replace disabled when a key is corrupt');
   assert.match(await page.locator('#backupPreview').textContent(),/壊れていて読めない/);
   // 完全に壊れたファイルは拒否
   for(const bad of['not json',JSON.stringify({app:'x'}),JSON.stringify({app:'30min-study',schemaVersion:1,data:[]}),JSON.stringify({app:'30min-study',schemaVersion:1,data:{studyHistory:5}})]){
    const f=path.join(TMP,`bad-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);await page.evaluate(()=>{document.getElementById('importBackupStatus').textContent='';});fs.writeFileSync(f,bad);await page.setInputFiles('#backupFile',f);
    await page.waitForFunction(()=>/読み込めませんでした/.test(document.getElementById('importBackupStatus').textContent),null,{timeout:8000});
    assert.match(await page.locator('#importBackupStatus').textContent(),/読み込めませんでした/);
    assert.equal(await page.locator('#backupImportActions').isVisible(),false,'actions hidden for rejected file');
   }
   assert.deepEqual(errors,[]);await ctx.close();results.push('merge-order');
  }
  // ---- 5. 通常利用のデータを誤判定しない（互換性） ----
  {
   const {ctx,page,errors}=await newPage(browser,width);
   await quickQuiz(page,5);
   await page.evaluate(()=>goHome());await page.click('[data-action=exam]');await page.locator('#autoExamCard summary').click();
   await page.selectOption('#autoExamGrade','2');await page.selectOption('#autoExamSubject','social');await page.click('#createAutoExamPlan');
   await page.locator('.exam-plan-card .exam-mock').click();await page.locator('[data-mock-count="10"]').click();await page.click('#startMockExam');
   let g=0;while(await page.locator('#playView.active').count()&&g++<15)await page.click('#dontKnow');
   // 旧版（v0.44.9 相当）の形のデータも追加
   await page.evaluate(()=>{const h=JSON.parse(localStorage.getItem('studyHistory'));h.unshift({at:'2026-10-01T09:00:00.000Z',grade:2,subject:'social',total:5,score:3,rate:60,mode:'quiz',questionIds:['so001'],answerResults:[{questionId:'so001',correct:true,dontKnow:false,answeredAt:'2026-10-01T09:00:00.000Z'}]});localStorage.setItem('studyHistory',JSON.stringify(h));localStorage.setItem('customQuestions',JSON.stringify([{id:'custom-1',subject:'social',unit:'world-overview',grades:[1],type:'word',question:'経線とは？',answers:['経線'],explanation:'',createdAt:'2026-10-01'}]));});
   const before=await page.evaluate(()=>Object.fromEntries(StorageGuard.GUARDED_KEYS.map(k=>[k,localStorage.getItem(k)])));
   await page.reload();await page.waitForFunction(()=>state.questionBank.length>0);
   assert.equal(await page.locator('#dataRepairBanner').isVisible(),false,'normal data must not be flagged');
   const after=await page.evaluate(()=>Object.fromEntries(StorageGuard.GUARDED_KEYS.map(k=>[k,localStorage.getItem(k)])));
   assert.deepEqual(after,before,'startup must not rewrite valid data');
   const backup=await page.evaluate(()=>backupDataSnapshot());assert(JSON.parse(backup.studyHistory).length>=2);
   assert.deepEqual(errors,[]);await ctx.close();results.push('compat');
  }
  console.log(`PASS security browser @${width}px (${results.join(', ')})${external?' [server: '+base+']':''}`);
 }finally{await browser.close();}
}
(async()=>{
 const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
 const server=external?null:cp.spawn(python,['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 try{await ready();for(const w of(process.env.E2E_WIDTHS||'320,375').split(',').map(Number))await run(w);}finally{server?.kill();fs.rmSync(TMP,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
