// 実ブラウザ（Playwright/Chromium）で「思い出す練習」を通しで操作する回帰テスト。
// 実行: node scripts/e2e_recall_practice.js   （playwright が require できる環境）
const {chromium}=require('playwright');
const cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const PORT=Number(process.env.E2E_PORT||8765);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitServer(url){for(let i=0;i<50;i++){try{const r=await fetch(url);if(r.ok)return;}catch{}await sleep(100);}throw new Error('server did not start');}
async function run(width){
  const browser=await chromium.launch();const page=await browser.newPage({viewport:{width,height:780}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const base=`http://127.0.0.1:${PORT}/`;
  await page.goto(base);await page.evaluate(()=>{localStorage.clear();});await page.reload();
  await page.click('[data-action=quiz]');
  // 英語では表示されない
  await page.locator('#subjectChoices .subject-btn',{hasText:'英語'}).click();
  assert.equal(await page.locator('#recallToggleRow').isVisible(),false,'toggle hidden for English');
  await page.locator('#gradeChoices .chip',{hasText:'中1'}).click();
  await page.locator('#subjectChoices .subject-btn',{hasText:'社会'}).click();
  assert.equal(await page.locator('#recallToggleRow').isVisible(),true,'toggle visible for social');
  assert.equal(await page.locator('#recallPractice').isChecked(),true,'social default on');
  const boxes=page.locator('#unitChoices input[type=checkbox]');const nb=await boxes.count();for(let i=0;i<nb;i++)await boxes.nth(i).check();
  assert.match(await page.locator('#recallToggleCount').textContent(),/\d+問が対応/);
  await page.locator('#countChoices [data-count="10"]').click();
  await page.click('#startQuiz');
  const seen={hint:false,free:false,choice:false,retry:false};let guard=0;
  while(await page.locator('#playView.active').count()&&guard++<60){
    const info=await page.evaluate(()=>{const q=state.session[state.index];return q?{retry:!!q.__retryOf,recall:recallActiveFor(q),type:q.type,answers:RecallLadder.primaryAnswers(q),hints:RecallLadder.hintSteps(q).length}:null});
    if(!info)break;
    if(info.recall){
      const inputs=page.locator('#answerArea input.answer-input');
      if(info.retry){
        assert.match(await page.locator('#quizProgress').textContent(),/ヒントなしで再挑戦/);
        assert.equal(await page.locator('#answerArea button',{hasText:'ヒントを見る'}).isVisible(),false,'no hints on retry');
        for(let i=0;i<info.answers.length;i++)await inputs.nth(i).fill(info.answers[i]);
        await page.locator('#answerArea button',{hasText:'答える'}).click();
        assert.match(await page.locator('#feedback strong').textContent(),/自力で思い出せた/);seen.retry=true;
      }else if(!seen.hint){
        for(let i=0;i<info.answers.length;i++)await inputs.nth(i).fill('ちがうこたえ');
        await page.locator('#answerArea button',{hasText:'答える'}).click();
        assert.equal(await page.locator('.recall-hint').isVisible(),true,'hint after wrong');
        assert.equal(await page.locator('#feedback').isVisible(),false,'not graded yet');
        for(let i=0;i<info.answers.length;i++)await inputs.nth(i).fill(info.answers[i]);
        await page.locator('#answerArea button',{hasText:'答える'}).click();
        assert.match(await page.locator('#feedback strong').textContent(),/ヒントあり/);
        assert.match(await page.locator('#feedback').textContent(),/ヒントなしでもう一度/);seen.hint=true;
      }else if(!seen.choice&&info.type==='choice'){
        await page.locator('#answerArea button',{hasText:'選択肢を見る'}).click();
        const correctText=await page.evaluate(()=>RecallLadder.correctChoiceText(state.session[state.index]));
        await page.locator('.recall-choices .answer-btn',{hasText:correctText}).first().click();
        assert.match(await page.locator('#feedback strong').textContent(),/選択肢を見て/);seen.choice=true;
      }else if(!seen.free){
        for(let i=0;i<info.answers.length;i++)await inputs.nth(i).fill(info.answers[i]);
        await page.locator('#answerArea button',{hasText:'答える'}).click();
        assert.match(await page.locator('#feedback strong').textContent(),/自力で思い出せた/);seen.free=true;
      }else{
        await page.click('#dontKnow');
      }
    }else{
      await page.click('#dontKnow');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert(overflow<=1,`horizontal overflow ${overflow}px at ${width}px`);
    await page.click('#nextQuestion');
  }
  assert.equal(await page.locator('#resultView.active').count(),1,'reached result');
  assert.equal(seen.hint&&seen.free&&seen.retry,true,'exercised hint/free/retry paths: '+JSON.stringify(seen));
  assert.match(await page.locator('#resultScore').textContent(),/\/ 10$/,'retries excluded from total');
  assert.equal(await page.locator('#resultRecall').isVisible(),true);
  const stored=await page.evaluate(()=>({rec:Object.keys(JSON.parse(localStorage.getItem('recallRecords')||'{}')).length,h:JSON.parse(localStorage.getItem('studyHistory')||'[]').at(-1)}));
  assert(stored.rec>0,'recall records saved');assert.equal(stored.h.recall,true);assert.equal(stored.h.total,10);assert.equal(stored.h.answerResults.length,10);
  assert(stored.h.answerResults.some(a=>a.assist==='hint'&&a.recallMode),'assist recorded');
  assert(stored.h.retryResults.length>=1,'retry results stored separately');
  // 学習記録
  // もう一度挑戦：再挑戦用のコピーが残らない（監査指摘2）
  await page.click('#retryQuiz');
  const again=await page.evaluate(()=>({copies:state.session.filter(q=>q.__retryOf).length,len:state.session.length,retry:(state.retryAnswers||[]).length}));
  assert.deepEqual(again,{copies:0,len:10,retry:0},'retryQuiz resets recall session');
  // 選択肢が出たあとでも、書いた答えを自己判定できる（監査指摘3）
  for(let k=0;k<12;k++){const ok=await page.evaluate(()=>{const q=state.session[state.index];return recallActiveFor(q)&&q.type==='choice'&&RecallLadder.hintSteps(q).length>0});if(ok)break;await page.click('#dontKnow');await page.click('#nextQuestion');}
  const steps=await page.evaluate(()=>RecallLadder.hintSteps(state.session[state.index]).length);
  for(let k=0;k<=steps;k++){await page.fill('#answerArea input.answer-input','べつのかきかた');await page.locator('#answerArea button',{hasText:'答える'}).click();}
  await page.locator('.recall-claim').click();await page.locator('.recall-self-judge button',{hasText:'同じ意味だった'}).click();
  assert.match(await page.locator('#feedback strong').textContent(),/自己判定/);
  const rec=await page.evaluate(()=>{const q=state.session[state.index];return JSON.parse(localStorage.getItem('recallRecords'))[q.id]});
  assert.notEqual(rec.lastAssist,'free','self-judged answer is not counted as unaided');
  await page.evaluate(()=>goHome());await page.click('[data-action=stats]');
  assert.match(await page.locator('#recallStats').textContent(),/自力で正解 \d+問/);
  // バックアップに含まれる
  const snap=await page.evaluate(()=>Object.keys(backupDataSnapshot()));assert(snap.includes('recallRecords'),'backup includes recallRecords');
  // 破損データでも落ちない
  await page.evaluate(()=>{localStorage.setItem('recallRecords','{broken');localStorage.setItem('recallPracticePrefs','[1]');});
  await page.reload();await page.click('[data-action=stats]');assert.match(await page.locator('#recallStats').textContent(),/自力で正解|記録されます/);
  await page.click('#statsView.active [data-back]');await page.click('[data-action=quiz]');
  assert(!errors.length,'console errors: '+errors.join(' | '));
  await page.screenshot({path:path.join(process.env.E2E_SHOT_DIR||require('node:os').tmpdir(),`recall-${width}.png`),fullPage:false});
  await browser.close();
  return seen;
}
(async()=>{
  const server=cp.spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
  try{await waitServer(`http://127.0.0.1:${PORT}/index.html`);for(const w of[320,375]){const s=await run(w);console.log(`PASS e2e recall practice @${w}px`,JSON.stringify(s));}}
  finally{server.kill();}
})().catch(e=>{console.error(e);process.exit(1);});
