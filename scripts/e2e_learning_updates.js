// Local-only browser regression for the reimplemented learning improvements.
// Windows: E2E_BROWSER_CHANNEL=msedge; PYTHON=python (defaults on Windows).
const {chromium}=require('playwright');
const cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),port=Number(process.env.E2E_PORT||8766);
const base=`http://127.0.0.1:${port}/`;
async function ready(){for(let i=0;i<60;i++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('local test server did not start');}
async function noOverflow(page,label){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label}: horizontal overflow`);}
async function run(width){
 const browser=await chromium.launch(process.env.E2E_BROWSER_CHANNEL?{channel:process.env.E2E_BROWSER_CHANNEL}:{});
 try{
  const page=await browser.newPage({viewport:{width,height:780}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} (${m.location().url})`)});
  // Keep this regression entirely local; no AI or other external requests.
  await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  await page.goto(base);await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.waitForFunction(()=>state.questionBank.length>0);
  for(const [id,values,correct] of [
   ['v035_en_sanseido_g2_03_2',['learn.'],true],
   ['v030_en_fill_01',['has','completed.'],true],
   ['v034_tok_e3_u1_01',['had.'],true],
   ['v034_kai_e3_p1_01',['had'],true],
   ['v034_san_e3_l3_01',['constructed.'],true],
   ['v035_en_sanseido_g2_03_2',['learning'],false]
  ]){
   await page.evaluate(id=>{
    const q=state.questionBank.find(q=>q.id===id);if(!q)throw Error('missing '+id);
    state.subject='english';state.session=[q];state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'quiz'};resetRecallSessionState();showView('playView');renderQuestion();
   },id);
   assert.match(await page.locator('#questionText').textContent(),/日本語/);
   const inputs=page.locator('#answerArea input');assert.equal(await inputs.count(),values.length);
   for(let i=0;i<values.length;i++)await inputs.nth(i).fill(values[i]);
   await page.locator('#answerArea button',{hasText:'答える'}).click();
   assert.equal(await page.evaluate(()=>state.answers[0].correct),correct,`${id}: ${values}`);
   await noOverflow(page,'English');
  }
  await page.evaluate(()=>{goHome();state.answers=[];});await page.click('[data-action=quiz]');
  await page.locator('#gradeChoices .chip',{hasText:'中1'}).click();
  await page.locator('#subjectChoices .subject-btn',{hasText:'国語'}).click();
  await page.locator('#japaneseHardStart').check();
  assert.equal(await page.evaluate(()=>loadJapaneseLearningPrefs().hardStart),true);
  await page.fill('#unitSearch','古典');await page.click('#selectWholeGradeRange');
  assert.equal(await page.locator('#unitSearch').inputValue(),'','whole-grade action clears unit search');
  const boxes=page.locator('#unitChoices input[type=checkbox]');
  assert(await boxes.count()>0);assert.equal(await boxes.count(),await page.locator('#unitChoices input:checked').count(),'whole-grade action selects all units');
  const eligible=await page.evaluate(()=>({tagged:availableQuestions().filter(q=>questionMaterialIds(q).length).length,materials:state.quizMaterials.size}));
  assert.equal(eligible.materials,0);assert(eligible.tagged>0,'unselected Japanese material questions reachable');
  await noOverflow(page,'Japanese setup');
  await page.locator('#japaneseDifficultyRow').screenshot({path:path.join(process.env.E2E_SHOT_DIR||require('node:os').tmpdir(),`japanese-preference-${width}.png`)});
  await page.click('#startQuiz');
  assert.equal(await page.evaluate(()=>questionDifficulty(state.session[0])),2,'hard start begins at standard');
  await noOverflow(page,'Japanese play');
  // Use real choice data from one unit so self-graded writing does not reset the streak.
  await page.evaluate(()=>{
   localStorage.clear();state.questionBank=state.questionBank.filter(q=>q.subject==='japanese'&&q.unit==='classics'&&q.type==='choice');
   state.subject='japanese';state.grade=1;state.count=10;
   const sub=state.curriculum.subjects.find(s=>s.id==='japanese'),field=sub.fields.find(f=>f.units.some(u=>u.id==='classics'));
   state.units=new Set([unitKey('japanese',field.id,'classics')]);state.quizMaterials=new Set();setJapaneseHardStart(true);showView('quizView');renderQuiz();
  });
  await page.click('#startQuiz');const difficulties=[];
  for(let i=0;i<4;i++){
   difficulties.push(await page.evaluate(()=>questionDifficulty(state.session[state.index])));
   if(i<3){const answer=await page.evaluate(()=>state.session[state.index].answer);await page.click(`.answer-btn[data-original-index="${answer}"]`);await page.click('#nextQuestion');}
  }
  assert.deepEqual(difficulties,[2,2,2,3],'three actual correct answers raise the next difficulty');
  await page.evaluate(()=>{localStorage.setItem('japaneseLearningPrefs','{broken');goHome();});await page.reload();
  await page.click('[data-action=quiz]');await page.locator('#subjectChoices .subject-btn',{hasText:'国語'}).click();
  assert.equal(await page.locator('#japaneseHardStart').isChecked(),false,'corrupt preference safely defaults');
  await page.evaluate(()=>goHome());await page.click('[data-action=exam]');
  await page.locator('#autoExamCard summary').click();
  await page.selectOption('#autoExamGrade','2');await page.selectOption('#autoExamSubject','english');await page.selectOption('#autoExamPurpose','mock');
  await noOverflow(page,'Auto exam setup');
  await page.locator('#autoExamCard').screenshot({path:path.join(process.env.E2E_SHOT_DIR||require('node:os').tmpdir(),`auto-exam-setup-${width}.png`)});
  await page.click('#createAutoExamPlan');
  assert.match(await page.locator('#autoExamStatus').textContent(),/作りました/);
  const plan=await page.evaluate(()=>loadExamPlans()[0]);
  assert.equal(plan.auto,true);assert.equal(plan.grade,2);assert.equal(plan.purpose,'mock');
  assert(plan.units.length>0);assert(plan.units.every(k=>k.startsWith('english/')),'plan scopes stay in selected subject');
  const pool=await page.evaluate(()=>examQuestionPool(loadExamPlans()[0]).map(q=>({subject:q.subject,grades:q.grades})));
  assert(pool.length>0);assert(pool.every(q=>q.subject==='english'&&q.grades.includes(2)),'available pool honors grade and subject');
  assert.match(await page.locator('.exam-plan-card').textContent(),/学校のテスト範囲を推定したものではありません/);
  await noOverflow(page,'Auto exam plan');
  await page.locator('.exam-plan-card .exam-mock').click();await page.locator('[data-mock-count="10"]').click();await page.click('#startMockExam');
  assert.equal(await page.evaluate(()=>state.sessionContext.mode),'mockExam');
  assert(await page.evaluate(()=>state.session.every(q=>q.subject==='english'&&q.grades.includes(2))));
  let answered=0;
  while(await page.locator('#playView.active').count()&&answered++<15)await page.click('#dontKnow');
  assert.equal(await page.locator('#resultView.active').count(),1,'auto plan mock reaches results');
  await noOverflow(page,'Auto exam mock result');
  await page.evaluate(()=>openExamPlans());await page.locator('.exam-plan-card .exam-edit').click();
  await page.fill('#examName','範囲確認後の練習');await page.click('#saveExamPlan');
  const edited=await page.evaluate(()=>loadExamPlans()[0]);assert.equal(edited.id,plan.id);assert.equal(edited.name,'範囲確認後の練習');
  await page.reload();await page.click('[data-action=exam]');assert.match(await page.locator('.exam-plan-card').textContent(),/範囲確認後の練習/);
  assert.deepEqual(errors,[],'browser errors');
  console.log(`PASS learning updates browser @${width}px (English aliases, Japanese selection, prefs, auto exam, mock, editing, no overflow)`);
 }finally{await browser.close();}
}
(async()=>{
 const python=process.env.PYTHON||(process.platform==='win32'?'python':'python3');
 const server=cp.spawn(python,['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 try{await ready();for(const width of [320,375])await run(width);}finally{server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
