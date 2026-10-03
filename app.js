const state={grade:2,subject:null,units:new Set(),count:5,curriculum:null,builtInQuestions:[],questionBank:[],session:[],index:0,score:0,answers:[],sessionContext:null,review:{grade:'all',subject:'all',field:'',units:new Set(),count:5},exam:{editId:null,grade:2,units:new Set()},importGrade:2,importQuestions:[],importPages:[],manageEditId:null,pdfAssetBase:null,pdfWorkerUrl:null,ocrScriptUrl:null,textbookData:null};
const SHIZUOKA_TEXTBOOK_FALLBACK={version:'2026-10-shizuoka-r7-r10',prefecture:'静岡県',validFrom:2025,validTo:2028,publishers:{sanseido:{name:'三省堂'},mitsumura:{name:'光村図書'},'kyoiku-shuppan':{name:'教育出版'}},districts:[{id:'kamo',name:'賀茂',publisher:'sanseido',municipalities:['下田市','東伊豆町','河津町','南伊豆町','松崎町','西伊豆町']},{id:'tagata',name:'田方',publisher:'mitsumura',municipalities:['三島市','熱海市','伊東市','伊豆市','伊豆の国市','函南町']},{id:'sunto-numazu',name:'駿東沼津',publisher:'sanseido',municipalities:['沼津市','裾野市','御殿場市','清水町','長泉町','小山町']},{id:'fuji',name:'富士',publisher:'kyoiku-shuppan',municipalities:['富士市','富士宮市']},{id:'shizuoka',name:'静岡',publisher:'sanseido',municipalities:['静岡市']},{id:'shida',name:'志太',publisher:'kyoiku-shuppan',municipalities:['焼津市','藤枝市','島田市']},{id:'haibara',name:'榛原',publisher:'mitsumura',municipalities:['牧之原市','吉田町','川根本町']},{id:'ogasa',name:'小笠',publisher:'mitsumura',municipalities:['掛川市','御前崎市','菊川市']},{id:'iwata-shuchi',name:'磐田周智',publisher:'mitsumura',municipalities:['森町','袋井市','磐田市']},{id:'hamamatsu',name:'浜松',publisher:'mitsumura',municipalities:['浜松市']},{id:'kosai',name:'湖西',publisher:'mitsumura',municipalities:['湖西市']} ]};
const views=[...document.querySelectorAll('.view')];
let cameraStream=null;
let facingMode='environment';
let importedObjectUrls=[];

function showView(id){
  views.forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
  window.scrollTo({top:0,behavior:'instant'});
}
function goHome(){stopCamera();showView('homeView');renderDailyPlanPreview()}

document.querySelectorAll('[data-back]').forEach(b=>b.onclick=goHome);
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>showView(b.dataset.nav));
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(b.dataset.action));
function handleAction(action){
 if(action==='quiz'){showView('quizView');renderQuiz();}
 else if(action==='exam'){openExamPlans();}
 else if(action==='daily'){startDailyStudy();}
 else if(action==='import'){showView('importView');}
 else if(action==='review'){openReview();}
 else if(action==='stats'){openStats();}
 else if(action==='manage'){openManage();}
 else if(action==='backup'){openBackup();}
 else alert('この機能は今後追加します。');
}

async function init(){
 state.textbookData=window.JAPANESE_TEXTBOOK_DATA||SHIZUOKA_TEXTBOOK_FALLBACK;
 initJapaneseTextbookSelectors();
 try{
   // index.html を直接開いた場合でも動くよう、同梱JSデータを優先する。
   if(window.CURRICULUM_DATA && window.QUESTION_DATA){
     state.curriculum=window.CURRICULUM_DATA;
     state.builtInQuestions=[...(window.QUESTION_DATA.questions||[])];refreshQuestionBank();
     renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();
     document.getElementById('dataVersion').textContent=`単元 ${state.curriculum.version} / 問題 ${window.QUESTION_DATA.version}`;
   }else{
     const [cr,qr]=await Promise.all([fetch('data/curriculum.json'),fetch('data/questions.json')]);
     if(!cr.ok||!qr.ok)throw new Error('data load failed');
     state.curriculum=await cr.json();
     const qdata=await qr.json();
     state.builtInQuestions=[...(qdata.questions||[])];refreshQuestionBank();
     renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();
     document.getElementById('dataVersion').textContent=`単元 ${state.curriculum.version} / 問題 ${qdata.version}`;
   }
 }catch(error){
   console.error(error);
   document.getElementById('selectionSummary').textContent='学習データを読み込めませんでした。';
 }
 document.getElementById('streakDays').textContent=localStorage.getItem('streakDays')||0;
}
function renderQuiz(){if(!state.curriculum)return;renderGrades();renderSubjects();initJapaneseTextbookSelectors();renderJapaneseTextbookPanel();renderUnits();updateSummary();}
function renderGrades(){const el=document.getElementById('gradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.grade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.grade=g;state.units.clear();renderQuiz()};el.append(b)})}
function renderSubjects(){const el=document.getElementById('subjectChoices');el.innerHTML='';state.curriculum.subjects.forEach(s=>{const b=document.createElement('button');b.className='subject-btn'+(state.subject===s.id?' selected':'');b.innerHTML=`<span>${s.icon}</span><strong>${s.name}</strong>`;b.onclick=()=>{state.subject=s.id;state.units.clear();renderQuiz()};el.append(b)})}
function loadJapaneseTextbookPreference(){
 try{return JSON.parse(localStorage.getItem('japaneseTextbookPreference')||'{}')||{}}catch{return{}}
}
function saveJapaneseTextbookPreference(pref){localStorage.setItem('japaneseTextbookPreference',JSON.stringify(pref));}
function currentJapanesePublisher(){return loadJapaneseTextbookPreference().publisher||'';}
function publisherLabel(id){return state.textbookData?.publishers?.[id]?.name||id||'';}
function initJapaneseTextbookSelectors(){
 const data=state.textbookData, district=document.getElementById('japaneseDistrict'), publisher=document.getElementById('japanesePublisher');
 if(!data||!district||!publisher)return;
 district.innerHTML='<option value="">地区を選択</option>'+data.districts.map(d=>`<option value="${d.id}">${d.name}地区</option>`).join('');
 publisher.innerHTML='<option value="">教科書会社を選択</option>'+Object.entries(data.publishers).map(([id,p])=>`<option value="${id}">${p.name}</option>`).join('');
 const pref=loadJapaneseTextbookPreference();district.value=pref.district||'';publisher.value=pref.publisher||'';
 district.onchange=()=>{
  const d=data.districts.find(x=>x.id===district.value);const next={...loadJapaneseTextbookPreference(),district:district.value||'',publisher:d?.publisher||publisher.value||''};
  if(d)publisher.value=d.publisher;saveJapaneseTextbookPreference(next);renderJapaneseTextbookPanel();renderUnits();updateSummary();
 };
 publisher.onchange=()=>{const pref2={...loadJapaneseTextbookPreference(),publisher:publisher.value||''};saveJapaneseTextbookPreference(pref2);renderJapaneseTextbookPanel();renderUnits();updateSummary();};
}
function renderJapaneseTextbookPanel(){
 const card=document.getElementById('japaneseTextbookCard');if(!card)return;const show=state.subject==='japanese';card.hidden=!show;if(!show)return;
 const data=state.textbookData;if(!data)return;const pref=loadJapaneseTextbookPreference();const district=document.getElementById('japaneseDistrict'),publisher=document.getElementById('japanesePublisher');
 if(district&&district.value!==String(pref.district||''))district.value=pref.district||'';if(publisher&&publisher.value!==String(pref.publisher||''))publisher.value=pref.publisher||'';
 const d=data.districts.find(x=>x.id===(district?.value||pref.district));const mun=document.getElementById('japaneseDistrictMunicipalities');
 if(mun)mun.textContent=d?`対象市町：${d.municipalities.join('・')}`:'採択地区が分からない場合は、教科書会社だけ手動で選べます。';
 const suggestion=document.getElementById('japanesePublisherSuggestion');if(suggestion){if(d){suggestion.hidden=false;suggestion.innerHTML=`<strong>自動候補：${publisherLabel(d.publisher)}</strong><span>令和7〜10年度の静岡県採択結果</span>`;}else suggestion.hidden=true;}
}
function matchesJapaneseTextbook(q){
 if(q?.subject!=='japanese')return true;const tagged=q.textbookPublisher||q.publisher||'common';if(tagged==='common'||!tagged)return true;const selected=currentJapanesePublisher();return !selected||tagged===selected;
}
function unitKey(subjectId,fieldId,unitId){return `${subjectId}/${fieldId}/${unitId}`}
function renderUnits(){
 const el=document.getElementById('unitChoices');el.innerHTML='';
 if(!state.subject){el.innerHTML='<p class="help">先に教科を選んでください。</p>';return}
 const subject=state.curriculum.subjects.find(s=>s.id===state.subject);
 const q=(document.getElementById('unitSearch')?.value||'').trim().toLowerCase();
 subject.fields.forEach(f=>{
   const fieldUnits=f.units.filter(u=>u.grades.includes(state.grade));
   if(!fieldUnits.length)return;
   const visibleUnits=fieldUnits.filter(u=>{const label=`${f.name} ${u.name} ${(u.topics||[]).join(' ')}`;return !q||label.toLowerCase().includes(q)});
   if(!visibleUnits.length)return;
   const group=document.createElement('div');group.className='unit-group';
   const head=document.createElement('div');head.className='unit-group-head';
   const title=document.createElement('h4');title.textContent=f.name;head.append(title);
   const fieldKeys=visibleUnits.map(u=>unitKey(subject.id,f.id,u.id));
   const allSelected=fieldKeys.every(k=>state.units.has(k));
   const bulk=document.createElement('button');bulk.type='button';bulk.className='unit-bulk-btn';bulk.textContent=allSelected?'この分野をすべて解除':'この分野をすべて選択';
   bulk.onclick=()=>{if(allSelected)fieldKeys.forEach(k=>state.units.delete(k));else fieldKeys.forEach(k=>state.units.add(k));renderUnits();updateSummary();};
   head.append(bulk);group.append(head);
   visibleUnits.forEach(u=>{
     const key=unitKey(subject.id,f.id,u.id);
     const available=state.questionBank.filter(x=>x.subject===subject.id&&x.unit===u.id&&x.grades.includes(state.grade)&&matchesJapaneseTextbook(x)).length;
     const row=document.createElement('label');row.className='unit-item';
     row.innerHTML=`<input type="checkbox" ${state.units.has(key)?'checked':''}><span><strong>${u.name}</strong><small>${(u.topics||[]).join('・')}</small><em>${available?`${available}問収録`:'問題追加予定'}</em></span>`;
     row.querySelector('input').onchange=e=>{e.target.checked?state.units.add(key):state.units.delete(key);renderUnits();updateSummary()};group.append(row);
   });
   el.append(group);
 });
 if(!el.children.length)el.innerHTML='<p class="help">検索条件に一致する単元がありません。</p>';
}
function selectedUnitIds(){return [...state.units].map(k=>k.split('/')[2]);}
function availableQuestions(){
 if(!state.subject)return[];
 const ids=new Set(selectedUnitIds());
 return state.questionBank.filter(q=>q.subject===state.subject&&ids.has(q.unit)&&q.grades.includes(state.grade)&&matchesJapaneseTextbook(q));
}

function questionDifficulty(q){const d=Number(q?.difficulty)||1;return Math.max(1,Math.min(3,d));}
function difficultyLabel(q){return({1:'基礎',2:'標準',3:'応用'})[questionDifficulty(q)]||'基礎';}
function questionAttemptStats(){
 const map=new Map();
 for(const h of studyHistory()){
  for(const a of h.answerResults||[]){
   const x=map.get(a.questionId)||{attempts:0,correct:0,lastAt:null};
   x.attempts++;if(a.correct)x.correct++;const at=a.answeredAt||h.at;if(at&&(!x.lastAt||new Date(at)>new Date(x.lastAt)))x.lastAt=at;map.set(a.questionId,x);
  }
 }
 return map;
}
function unitAccuracyMap(){
 const qmap=new Map(state.questionBank.map(q=>[q.id,q])),groups=new Map();
 for(const h of studyHistory())for(const a of h.answerResults||[]){const q=qmap.get(a.questionId);if(!q)continue;const key=`${q.subject}/${q.unit}`;const x=groups.get(key)||{total:0,correct:0};x.total++;if(a.correct)x.correct++;groups.set(key,x);}
 const out=new Map();for(const [k,x] of groups)out.set(k,x.total?x.correct/x.total:null);return out;
}
function smartQuestionOrder(pool){
 const attempts=questionAttemptStats(), mastery=unitAccuracyMap();
 const missed=new Map((JSON.parse(localStorage.getItem('missedQuestions')||'[]')||[]).map(x=>[x.questionId,x]));
 const now=Date.now();
 return [...pool].map(q=>{
  const st=attempts.get(q.id)||{attempts:0,correct:0,lastAt:null};const acc=mastery.get(`${q.subject}/${q.unit}`);
  const target=acc==null?1:acc<0.6?1:acc<0.8?2:3;const diff=questionDifficulty(q);
  let score=0;
  if(missed.has(q.id))score+=58+Math.min(12,(missed.get(q.id).count||1)*2);
  if(!st.attempts)score+=42;
  score+=Math.max(0,14-Math.abs(diff-target)*7);
  if(st.lastAt){const days=Math.max(0,(now-new Date(st.lastAt).getTime())/86400000);score+=Math.min(18,days);if(days<1)score-=38;else if(days<3)score-=20;else if(days<7)score-=8;}
  score-=Math.min(12,st.attempts*2);
  score+=Math.random()*5;
  return{q,score};
 }).sort((a,b)=>b.score-a.score).map(x=>x.q);
}
function pickSmartQuestions(pool,count){const ordered=smartQuestionOrder(pool);return count==='all'?ordered:ordered.slice(0,Math.min(Number(count)||0,ordered.length));}
function updateSummary(){
 const s=state.curriculum?.subjects.find(x=>x.id===state.subject);const n=availableQuestions().length;
 const book=state.subject==='japanese'&&currentJapanesePublisher()?`・${publisherLabel(currentJapanesePublisher())}`:'';document.getElementById('selectionSummary').textContent=s?`中${state.grade}・${s.name}${book}・${state.units.size}単元を選択 / 現在${n}問出題可能`:'学年・教科・単元を選んでください。';
}
document.getElementById('unitSearch').addEventListener('input',renderUnits);
document.getElementById('countChoices').addEventListener('click',e=>{const b=e.target.closest('[data-count]');if(!b)return;document.querySelectorAll('[data-count]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.count=b.dataset.count==='all'?'all':Number(b.dataset.count);updateSummary()});
document.getElementById('startQuiz').onclick=()=>{
 if(!state.subject||!state.units.size){alert('教科と単元を選んでください。');return}
 const pool=availableQuestions();if(!pool.length){alert('選んだ単元には、まだ問題が登録されていません。別の単元を選ぶか、紙テストから問題を追加してください。');return}
 const limit=state.count==='all'?'all':Math.min(state.count,pool.length);
 state.session=pickSmartQuestions(pool,limit);state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'quiz'};
 localStorage.setItem('lastQuizSelection',JSON.stringify({grade:state.grade,subject:state.subject,units:[...state.units],count:state.count}));
 showView('playView');renderQuestion();
};

function renderQuestion(){
 const q=state.session[state.index];if(!q){finishQuiz();return}
 const s=state.curriculum.subjects.find(x=>x.id===q.subject);
 document.getElementById('quizProgress').textContent=`${state.index+1} / ${state.session.length}`;
 document.getElementById('quizSubject').textContent=`${s?.icon||''} ${s?.name||''} ・ ${difficultyLabel(q)}`;
 document.getElementById('questionText').textContent=q.question;
 document.getElementById('answerArea').innerHTML='';document.getElementById('feedback').hidden=true;document.getElementById('nextQuestion').hidden=true;document.getElementById('dontKnow').disabled=false;
 const area=document.getElementById('answerArea');
 if(q.type==='choice'){
   (q.choices||[]).forEach((c,i)=>{const b=document.createElement('button');b.className='answer-btn';b.textContent=c;b.onclick=()=>gradeChoiceAnswer(i,b);area.append(b)});
 }else if(q.type==='word'){
   const input=document.createElement('input');input.type='text';input.className='answer-input';input.placeholder='答えを入力';input.autocomplete='off';
   const submit=document.createElement('button');submit.className='primary';submit.type='button';submit.textContent='答える';submit.onclick=()=>gradeWordAnswer(input.value);
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit.click()}});area.append(input,submit);setTimeout(()=>input.focus(),0);
 }else if(q.type==='text'){
   const ta=document.createElement('textarea');ta.rows=5;ta.className='answer-textarea';ta.placeholder='文章で答えを書いてください。';
   const check=document.createElement('button');check.className='primary';check.type='button';check.textContent='模範解答を確認';check.onclick=()=>showTextSelfCheck(ta.value);area.append(ta,check);
 }else{
   area.innerHTML='<p class="help">この問題形式にはまだ対応していません。</p>';
 }
}
function finishAnswer(correct,dontKnow=false,answerLabel=''){
 const q=state.session[state.index];if(correct)state.score++;
 state.answers.push({questionId:q.id,correct,dontKnow,answeredAt:new Date().toISOString()});
 document.getElementById('dontKnow').disabled=true;
 const fb=document.getElementById('feedback');fb.hidden=false;fb.className='feedback '+(correct?'ok':'ng');
 const label=answerLabel||formatCorrectAnswer(q);fb.innerHTML=`<strong>${correct?'正解！':'復習しよう'}</strong><p>答え：${escapeHtml(label)}</p><p>${escapeHtml(q.explanation||'')}</p>`;appendAiExplanationControl(fb,q);
 document.getElementById('nextQuestion').hidden=false;if(!correct)saveMissed(q,dontKnow);
}
function formatCorrectAnswer(q){if(q.type==='choice')return q.choices?.[q.answer]??'';if(q.type==='word')return acceptedTextAnswers(q).join(' / ');return q.modelAnswer||q.answerText||'';}
function renderAiExplanation(target,text){
 target.replaceChildren();
 const normalized=String(text||'').replace(/\r\n?/g,'\n').trim();
 if(!normalized){target.textContent='AI解説を取得できませんでした。';return;}
 const lines=normalized.split('\n');
 let list=null;
 for(const raw of lines){
  const line=raw.trim();
  if(!line){list=null;continue;}
  if(/^【[^】]+】$/.test(line)){
   list=null;const h=document.createElement('h4');h.className='ai-section-title';h.textContent=line;target.append(h);continue;
  }
  if(/^[・•-]\s*/.test(line)){
   if(!list){list=document.createElement('ul');list.className='ai-bullet-list';target.append(list)}
   const li=document.createElement('li');li.textContent=line.replace(/^[・•-]\s*/,'');list.append(li);continue;
  }
  list=null;const p=document.createElement('p');p.textContent=line;target.append(p);
 }
}
function appendAiExplanationControl(host,q){
 const wrap=document.createElement('div');wrap.className='ai-explain-box';
 const btn=document.createElement('button');btn.type='button';btn.className='secondary ai-explain-btn';btn.textContent='✨ AIで詳しく解説';
 const note=document.createElement('p');note.className='ai-privacy-note';note.textContent='押したときだけ、問題文と正解をCloudflare Workers AIへ送信します。氏名・テスト名・学習履歴は送信しません。';
 const out=document.createElement('div');out.className='ai-explain-result';out.hidden=true;
 btn.onclick=async()=>{
  btn.disabled=true;btn.textContent='AIが考えています…';out.hidden=false;out.textContent='解説を作成しています。';
  try{
   const subject=state.curriculum?.subjects.find(x=>x.id===q.subject)?.name||'';
   const payload={grade:Number(q.grades?.[0]||state.grade||2),subject,question:String(q.question||'').slice(0,1200),answer:String(formatCorrectAnswer(q)||'').slice(0,800),choices:Array.isArray(q.choices)?q.choices.slice(0,6).map(x=>String(x).slice(0,300)):[]};
   const res=await fetch('/api/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);
   renderAiExplanation(out,data.explanation||'AI解説を取得できませんでした。');
   btn.textContent='AI解説を更新';btn.disabled=false;
  }catch(err){
   console.error(err);out.textContent='AI解説を取得できませんでした。通常の解説を利用してください。';btn.textContent='もう一度試す';btn.disabled=false;
  }
 };
 wrap.append(btn,note,out);host.append(wrap);
}
function gradeChoiceAnswer(answer,button=null,dontKnow=false){const q=state.session[state.index];const correct=!dontKnow&&answer===q.answer;document.querySelectorAll('.answer-btn').forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');if(button===b&&!correct)b.classList.add('wrong')});finishAnswer(correct,dontKnow);}
function gradeWordAnswer(value,dontKnow=false){const q=state.session[state.index];const correct=!dontKnow&&acceptedTextAnswers(q).some(a=>normalizeText(a)===normalizeText(value));document.querySelectorAll('#answerArea input,#answerArea button').forEach(x=>x.disabled=true);finishAnswer(correct,dontKnow);}
function showTextSelfCheck(userText){const q=state.session[state.index];document.querySelectorAll('#answerArea textarea,#answerArea button').forEach(x=>x.disabled=true);document.getElementById('dontKnow').disabled=true;const fb=document.getElementById('feedback');fb.hidden=false;fb.className='feedback';fb.innerHTML=`<strong>模範解答</strong><p>${escapeHtml(q.modelAnswer||q.answerText||'')}</p><p>${escapeHtml(q.explanation||'')}</p><p class="help">自分の答えと比べて判定してください。</p><div class="self-check-row"><button id="selfOk" class="primary" type="button">できた</button><button id="selfNg" class="secondary" type="button">できなかった</button></div>`;appendAiExplanationControl(fb,q);document.getElementById('selfOk').onclick=()=>{fb.querySelector('.self-check-row').remove();finishAnswer(true,false)};document.getElementById('selfNg').onclick=()=>{fb.querySelector('.self-check-row').remove();finishAnswer(false,false)};}
function gradeAnswer(answer,button=null,dontKnow=false){const q=state.session[state.index];if(q.type==='choice')gradeChoiceAnswer(answer,button,dontKnow);else if(q.type==='word')gradeWordAnswer('',dontKnow);else finishAnswer(false,true);}
function saveMissed(q,dontKnow){const arr=JSON.parse(localStorage.getItem('missedQuestions')||'[]');const old=arr.find(x=>x.questionId===q.id);if(old){old.count=(old.count||1)+1;old.lastAt=new Date().toISOString();old.dontKnow=old.dontKnow||dontKnow}else arr.push({questionId:q.id,count:1,lastAt:new Date().toISOString(),dontKnow});localStorage.setItem('missedQuestions',JSON.stringify(arr));}
document.getElementById('dontKnow').onclick=()=>gradeAnswer(null,null,true);
document.getElementById('nextQuestion').onclick=()=>{state.index++;renderQuestion()};
document.getElementById('quitQuiz').onclick=()=>{if(confirm('この小テストを終了しますか？'))goHome()};
function finishQuiz(){
 const total=state.session.length;const rate=total?Math.round(state.score/total*100):0;
 document.getElementById('resultScore').textContent=`${state.score} / ${total}`;document.getElementById('resultRate').textContent=`正答率 ${rate}%`;
 const history=JSON.parse(localStorage.getItem('studyHistory')||'[]');history.push({at:new Date().toISOString(),grade:state.grade,subject:state.subject,total,score:state.score,rate,mode:state.sessionContext?.mode||'quiz',examId:state.sessionContext?.examId||null,questionIds:state.session.map(q=>q.id),answerResults:state.answers.map(a=>({questionId:a.questionId,correct:!!a.correct,dontKnow:!!a.dontKnow,answeredAt:a.answeredAt}))});localStorage.setItem('studyHistory',JSON.stringify(history.slice(-300)));
 if(state.sessionContext?.examId){const logs=loadExamStudyLogs();logs.push({id:crypto.randomUUID?.()||String(Date.now()),examId:state.sessionContext.examId,at:new Date().toISOString(),questionIds:state.session.map(q=>q.id),score:state.score,total,rate});localStorage.setItem('examStudyLogs',JSON.stringify(logs.slice(-300)));}
 updateStreak();showView('resultView');
}
function updateStreak(){const today=new Date().toISOString().slice(0,10);const last=localStorage.getItem('lastStudyDate');let streak=Number(localStorage.getItem('streakDays')||0);if(last!==today){const y=new Date();y.setDate(y.getDate()-1);streak=last===y.toISOString().slice(0,10)?streak+1:1;localStorage.setItem('lastStudyDate',today);localStorage.setItem('streakDays',streak)}document.getElementById('streakDays').textContent=streak;renderDailyPlanPreview();}
document.getElementById('backHomeResult').onclick=goHome;
document.getElementById('retryQuiz').onclick=()=>{state.index=0;state.score=0;state.answers=[];state.session=[...state.session].sort(()=>Math.random()-.5);showView('playView');renderQuestion()};
function loadCustomQuestions(){
 try{return JSON.parse(localStorage.getItem('customQuestions')||'[]')}catch{return []}
}
function saveCustomQuestions(items){localStorage.setItem('customQuestions',JSON.stringify(items));refreshQuestionBank();}
function refreshQuestionBank(){state.questionBank=[...state.builtInQuestions,...loadCustomQuestions()];}
function normalizeText(v){return String(v??'').normalize('NFKC').trim().replace(/\s+/g,'').toLowerCase();}
function acceptedTextAnswers(q){return (q.answers?.length?q.answers:[q.answerText]).filter(Boolean);}
function getMissedPool(){
 const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]');
 const ids=new Set(missed.map(x=>x.questionId));
 return state.questionBank.filter(q=>ids.has(q.id));
}
function openReview(){
 if(!getMissedPool().length){alert('まだ復習する問題はありません。小テストで間違えた問題がここにたまります。');return}
 state.review.units.clear();showView('reviewView');renderReviewFilters();
}
function renderReviewFilters(){
 const pool=getMissedPool();
 const ge=document.getElementById('reviewGradeChoices');ge.innerHTML='';
 ['all',1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.review.grade===g?' selected':'');b.textContent=g==='all'?'すべて':`中${g}`;b.onclick=()=>{state.review.grade=g;state.review.subject='all';state.review.field='';state.review.units.clear();renderReviewFilters()};ge.append(b)});
 const byGrade=pool.filter(q=>state.review.grade==='all'||q.grades.includes(state.review.grade));
 const se=document.getElementById('reviewSubjectChoices');se.innerHTML='';
 const all=document.createElement('button');all.className='subject-btn'+(state.review.subject==='all'?' selected':'');all.innerHTML='<span>📚</span><strong>すべて</strong>';all.onclick=()=>{state.review.subject='all';state.review.field='';state.review.units.clear();renderReviewFilters()};se.append(all);
 state.curriculum.subjects.filter(sub=>byGrade.some(q=>q.subject===sub.id)).forEach(sub=>{const b=document.createElement('button');b.className='subject-btn'+(state.review.subject===sub.id?' selected':'');b.innerHTML=`<span>${sub.icon}</span><strong>${sub.name}</strong>`;b.onclick=()=>{state.review.subject=sub.id;state.review.field='';state.review.units.clear();renderReviewFilters()};se.append(b)});
 renderReviewFieldAndUnits();updateReviewSummary();
}
function renderReviewFieldAndUnits(){
 const fs=document.getElementById('reviewField');fs.innerHTML='<option value="">すべての分野</option>';
 const ue=document.getElementById('reviewUnitChoices');ue.innerHTML='';
 if(state.review.subject==='all'){ue.innerHTML='<p class="help">教科を選ぶと、分野・単元でも絞れます。</p>';return}
 const sub=state.curriculum.subjects.find(s=>s.id===state.review.subject);if(!sub)return;
 const relevantFields=sub.fields.filter(f=>f.units.some(u=>getMissedPool().some(q=>q.subject===sub.id&&q.unit===u.id&&(state.review.grade==='all'||q.grades.includes(state.review.grade)))));
 relevantFields.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.name;fs.append(o)});fs.value=state.review.field;
 const fields=state.review.field?relevantFields.filter(f=>f.id===state.review.field):relevantFields;
 fields.forEach(f=>f.units.forEach(u=>{const count=getMissedPool().filter(q=>q.subject===sub.id&&q.unit===u.id&&(state.review.grade==='all'||q.grades.includes(state.review.grade))).length;if(!count)return;const key=unitKey(sub.id,f.id,u.id);const row=document.createElement('label');row.className='unit-item';row.innerHTML=`<input type="checkbox" ${state.review.units.has(key)?'checked':''}><span><strong>${u.name}</strong><small>${f.name}</small><em>${count}問</em></span>`;row.querySelector('input').onchange=e=>{e.target.checked?state.review.units.add(key):state.review.units.delete(key);updateReviewSummary()};ue.append(row)}));
 if(!ue.children.length)ue.innerHTML='<p class="help">この条件に復習問題はありません。</p>';
}
document.getElementById('reviewField').addEventListener('change',e=>{state.review.field=e.target.value;state.review.units.clear();renderReviewFieldAndUnits();updateReviewSummary()});
document.getElementById('reviewCountChoices').addEventListener('click',e=>{const b=e.target.closest('[data-review-count]');if(!b)return;document.querySelectorAll('[data-review-count]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.review.count=b.dataset.reviewCount==='all'?'all':Number(b.dataset.reviewCount);updateReviewSummary()});
function filteredReviewPool(){
 let pool=getMissedPool().filter(q=>state.review.grade==='all'||q.grades.includes(state.review.grade));
 if(state.review.subject!=='all')pool=pool.filter(q=>q.subject===state.review.subject);
 if(state.review.field&&state.review.subject!=='all'){const sub=state.curriculum.subjects.find(s=>s.id===state.review.subject);const f=sub?.fields.find(x=>x.id===state.review.field);const ids=new Set((f?.units||[]).map(u=>u.id));pool=pool.filter(q=>ids.has(q.unit))}
 if(state.review.units.size){const ids=new Set([...state.review.units].map(k=>k.split('/')[2]));pool=pool.filter(q=>ids.has(q.unit))}
 return pool;
}
function updateReviewSummary(){const n=filteredReviewPool().length;document.getElementById('reviewSummary').textContent=`現在 ${n}問が条件に一致しています。`;}
document.getElementById('startFilteredReview').onclick=()=>{const pool=filteredReviewPool();if(!pool.length){alert('この条件に復習問題はありません。');return}const limit=state.review.count==='all'?'all':Math.min(state.review.count,pool.length);state.session=pickSmartQuestions(pool,limit);state.index=0;state.score=0;state.answers=[];state.sessionContext={mode:'review'};showView('playView');renderQuestion();};


function loadExamPlans(){try{return JSON.parse(localStorage.getItem('examPlans')||'[]')}catch{return[]}}
function saveExamPlans(items){localStorage.setItem('examPlans',JSON.stringify(items));renderExamPlanList();renderDailyPlanPreview();}
function loadExamStudyLogs(){try{return JSON.parse(localStorage.getItem('examStudyLogs')||'[]')}catch{return[]}}
function dateOnlyLocal(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function daysUntil(dateStr){if(!dateStr)return null;const [y,m,d]=dateStr.split('-').map(Number);const target=new Date(y,m-1,d);const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((target-today)/86400000);}
function examUnitIds(plan){return new Set((plan.units||[]).map(k=>k.split('/')[2]));}
function examQuestionPool(plan){const ids=examUnitIds(plan);return state.questionBank.filter(q=>ids.has(q.unit)&&q.grades.includes(plan.grade));}
function subjectForUnitKey(key){return key.split('/')[0];}
function examSubjectCount(plan){return new Set((plan.units||[]).map(subjectForUnitKey)).size;}
function examProgress(plan){
 const pool=examQuestionPool(plan);if(!pool.length)return{attempted:0,total:0,percent:0};
 const ids=new Set(pool.map(q=>q.id));const attempted=new Set();loadExamStudyLogs().filter(x=>x.examId===plan.id).forEach(l=>(l.questionIds||[]).forEach(id=>{if(ids.has(id))attempted.add(id)}));
 return{attempted:attempted.size,total:pool.length,percent:Math.round(attempted.size/pool.length*100)};
}
function openExamPlans(){showView('examView');renderExamPlanList();}
function renderExamPlanList(){
 const el=document.getElementById('examPlanList');if(!el||!state.curriculum)return;const plans=loadExamPlans().sort((a,b)=>String(a.date).localeCompare(String(b.date)));el.innerHTML='';
 if(!plans.length){el.innerHTML='<div class="empty-card"><strong>まだ定期テストが登録されていません</strong><p>テスト日と範囲を登録すると、今日やる問題を自動で作れます。</p></div>';return}
 plans.forEach(plan=>{const days=daysUntil(plan.date);const prog=examProgress(plan);const card=document.createElement('article');card.className='exam-plan-card';
  const dayLabel=days===0?'今日':days>0?`あと${days}日`:`${Math.abs(days)}日前に終了`;
  card.innerHTML=`<div class="exam-plan-top"><div><p class="eyebrow">${escapeHtml(plan.date||'日付未設定')}</p><h3>${escapeHtml(plan.name||'定期テスト')}</h3></div><span class="exam-countdown ${days<0?'past':''}">${dayLabel}</span></div><p class="help">中${plan.grade}・${examSubjectCount(plan)}教科・${(plan.units||[]).length}単元</p><div class="progress-track"><span style="width:${prog.percent}%"></span></div><p class="exam-progress">このテスト向け学習 ${prog.attempted}/${prog.total}問</p><div class="exam-card-actions"><button class="primary exam-study" type="button">今日の学習を始める</button><button class="secondary exam-edit" type="button">編集</button><button class="secondary exam-delete" type="button">削除</button></div>`;
  card.querySelector('.exam-study').disabled=days<0;card.querySelector('.exam-study').onclick=()=>startExamStudy(plan.id);card.querySelector('.exam-edit').onclick=()=>openExamEditor(plan.id);card.querySelector('.exam-delete').onclick=()=>deleteExamPlan(plan.id);el.append(card);
 });
}
function openExamEditor(id=null){
 const existing=id?loadExamPlans().find(x=>x.id===id):null;state.exam.editId=id;state.exam.grade=existing?.grade||2;state.exam.units=new Set(existing?.units||[]);showView('examEditView');
 document.getElementById('examEditTitle').textContent=existing?'テストを編集':'テストを登録';document.getElementById('examName').value=existing?.name||'';document.getElementById('examDate').value=existing?.date||'';renderExamGrades();renderExamRanges();updateExamEditSummary();
}
function renderExamGrades(){const el=document.getElementById('examGradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.exam.grade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.exam.grade=g;state.exam.units.clear();renderExamGrades();renderExamRanges();updateExamEditSummary()};el.append(b)})}
function renderExamRanges(){
 const el=document.getElementById('examRangeChoices');el.innerHTML='';state.curriculum.subjects.forEach(sub=>{
  const allUnits=[];sub.fields.forEach(f=>f.units.filter(u=>u.grades.includes(state.exam.grade)).forEach(u=>allUnits.push({field:f,unit:u})));if(!allUnits.length)return;
  const details=document.createElement('details');details.className='exam-subject-group';details.open=false;const selected=allUnits.filter(x=>state.exam.units.has(unitKey(sub.id,x.field.id,x.unit.id))).length;
  details.innerHTML=`<summary><span>${sub.icon} <strong>${sub.name}</strong></span><em>${selected}/${allUnits.length}単元</em></summary><div class="exam-unit-grid"></div>`;
  const grid=details.querySelector('.exam-unit-grid');
  sub.fields.forEach(field=>{
    const fieldUnits=field.units.filter(u=>u.grades.includes(state.exam.grade));if(!fieldUnits.length)return;
    const fieldWrap=document.createElement('div');fieldWrap.className='exam-field-group';
    const fieldHead=document.createElement('div');fieldHead.className='unit-group-head';const h=document.createElement('strong');h.textContent=field.name;fieldHead.append(h);
    const keys=fieldUnits.map(u=>unitKey(sub.id,field.id,u.id));const allFieldSelected=keys.every(k=>state.exam.units.has(k));
    const bulk=document.createElement('button');bulk.type='button';bulk.className='unit-bulk-btn';bulk.textContent=allFieldSelected?'分野をすべて解除':'分野をすべて選択';
    bulk.onclick=e=>{e.preventDefault();e.stopPropagation();if(allFieldSelected)keys.forEach(k=>state.exam.units.delete(k));else keys.forEach(k=>state.exam.units.add(k));renderExamRanges();updateExamEditSummary();};fieldHead.append(bulk);fieldWrap.append(fieldHead);
    fieldUnits.forEach(unit=>{const key=unitKey(sub.id,field.id,unit.id);const available=state.questionBank.filter(q=>q.subject===sub.id&&q.unit===unit.id&&q.grades.includes(state.exam.grade)&&matchesJapaneseTextbook(q)).length;const row=document.createElement('label');row.className='unit-item';row.innerHTML=`<input type="checkbox" ${state.exam.units.has(key)?'checked':''}><span><strong>${unit.name}</strong><small>${field.name}</small><em>${available}問</em></span>`;row.querySelector('input').onchange=e=>{e.target.checked?state.exam.units.add(key):state.exam.units.delete(key);renderExamRanges();updateExamEditSummary()};fieldWrap.append(row)});
    grid.append(fieldWrap);
  });
  el.append(details);
 });
}
function updateExamEditSummary(){const el=document.getElementById('examEditSummary');if(!el)return;const subjectCount=new Set([...state.exam.units].map(subjectForUnitKey)).size;const ids=new Set([...state.exam.units].map(k=>k.split('/')[2]));const qCount=state.questionBank.filter(q=>ids.has(q.unit)&&q.grades.includes(state.exam.grade)).length;el.textContent=`${subjectCount}教科・${state.exam.units.size}単元を選択 / 現在${qCount}問出題可能`;}
function saveCurrentExamPlan(){const name=document.getElementById('examName').value.trim();const date=document.getElementById('examDate').value;if(!name){alert('テスト名を入力してください。');return}if(!date){alert('テスト日を選んでください。');return}if(!state.exam.units.size){alert('出題範囲を1単元以上選んでください。');return}let plans=loadExamPlans();const item={id:state.exam.editId||crypto.randomUUID?.()||String(Date.now()),name,date,grade:state.exam.grade,units:[...state.exam.units],updatedAt:new Date().toISOString()};const i=plans.findIndex(x=>x.id===item.id);if(i>=0)plans[i]={...plans[i],...item};else plans.push({...item,createdAt:new Date().toISOString()});saveExamPlans(plans);state.exam.editId=null;openExamPlans();}
function deleteExamPlan(id){const p=loadExamPlans().find(x=>x.id===id);if(!p)return;if(!confirm(`「${p.name}」を削除しますか？`))return;saveExamPlans(loadExamPlans().filter(x=>x.id!==id));localStorage.setItem('examStudyLogs',JSON.stringify(loadExamStudyLogs().filter(x=>x.examId!==id)));}
function buildExamSession(plan,count=20){
 const pool=examQuestionPool(plan);if(!pool.length)return[];return pickSmartQuestions(pool,Math.min(count,pool.length));
}
function startExamStudy(id){const plan=loadExamPlans().find(x=>x.id===id);if(!plan)return;const session=buildExamSession(plan,20);if(!session.length){alert('このテスト範囲には出題できる問題がありません。');return}state.session=session;state.index=0;state.score=0;state.answers=[];state.grade=plan.grade;state.subject=null;state.sessionContext={mode:'exam',examId:plan.id};showView('playView');renderQuestion();}
function studyHistory(){try{return JSON.parse(localStorage.getItem('studyHistory')||'[]')}catch{return[]}}
function answeredQuestionIds(){const ids=new Set();studyHistory().forEach(h=>(h.questionIds||[]).forEach(id=>ids.add(id)));return ids;}
function shuffleCopy(items){return [...items].sort(()=>Math.random()-.5)}
function takeUnique(target,source,count,used){for(const q of smartQuestionOrder(source)){if(target.length>=count)break;if(used.has(q.id))continue;used.add(q.id);target.push(q)}}
function buildDailySession(count=20){
 const future=loadExamPlans().filter(p=>daysUntil(p.date)>=0).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 const plan=future[0]||null;const pool=plan?examQuestionPool(plan):state.questionBank;if(!pool.length)return{plan:null,session:[],stats:{missed:0,unseen:0,review:0}};
 const missedIds=new Set((JSON.parse(localStorage.getItem('missedQuestions')||'[]')||[]).map(x=>x.questionId));
 const seen=plan?new Set(loadExamStudyLogs().filter(x=>x.examId===plan.id).flatMap(x=>x.questionIds||[])):answeredQuestionIds();
 const missed=pool.filter(q=>missedIds.has(q.id));const unseen=pool.filter(q=>!missedIds.has(q.id)&&!seen.has(q.id));const review=pool.filter(q=>!missedIds.has(q.id)&&seen.has(q.id));
 const target=Math.min(count,pool.length),session=[],used=new Set();
 // 20問なら目安として、苦手8・未学習8・復習4。足りない枠は他カテゴリで補う。
 takeUnique(session,missed,Math.min(target,8),used);takeUnique(session,unseen,Math.min(target,16),used);takeUnique(session,review,target,used);
 if(session.length<target)takeUnique(session,pool,target,used);
 const stats={missed:session.filter(q=>missedIds.has(q.id)).length,unseen:session.filter(q=>!missedIds.has(q.id)&&!seen.has(q.id)).length,review:session.filter(q=>!missedIds.has(q.id)&&seen.has(q.id)).length};
 return{plan,session,stats};
}
function todayStudyCount(){const today=dateOnlyLocal();return studyHistory().filter(h=>dateOnlyLocal(new Date(h.at))===today).reduce((sum,h)=>sum+(Number(h.total)||0),0)}
function renderDailyPlanPreview(){
 const card=document.getElementById('dailyPlanCard');if(!card||!state.curriculum||!state.questionBank.length)return;const built=buildDailySession(20);const {plan,session,stats}=built;
 const title=document.getElementById('dailyPlanTitle'),lead=document.getElementById('dailyPlanLead'),badge=document.getElementById('dailyPlanBadge'),hero=document.getElementById('dailyHeroSubtitle');
 if(plan){const d=daysUntil(plan.date);title.textContent=`${plan.name}まで${d===0?'今日':`あと${d}日`}`;lead.textContent='登録したテスト範囲から、苦手と未学習を優先して出題します。';hero.textContent=`${plan.name}を優先して20問`;}else{title.textContent='苦手と未学習をバランスよく';lead.textContent='定期テスト予定がないため、全教科から苦手と未学習を優先します。';hero.textContent='苦手・未学習を優先して20問';}
 badge.textContent=`${session.length}問`;document.getElementById('dailyPlanStats').innerHTML=`<div class="daily-stat"><strong>${stats.missed}</strong><small>苦手</small></div><div class="daily-stat"><strong>${stats.unseen}</strong><small>未学習</small></div><div class="daily-stat"><strong>${stats.review}</strong><small>復習</small></div>`;
 const counts={};session.forEach(q=>counts[q.subject]=(counts[q.subject]||0)+1);const mix=document.getElementById('dailySubjectMix');mix.innerHTML='';Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([sid,n])=>{const sub=state.curriculum.subjects.find(s=>s.id===sid);if(!sub)return;const span=document.createElement('span');span.className='daily-subject-pill';span.textContent=`${sub.icon} ${sub.name} ${n}問`;mix.append(span)});
 const done=todayStudyCount(),goal=20,pct=Math.min(100,Math.round(done/goal*100));document.getElementById('todayProgressBar').style.width=`${pct}%`;document.getElementById('todayProgressText').textContent=done>=goal?`今日 ${done}問クリア ✓`:`今日 ${done}/${goal}問`;
}
function startDailyStudy(){
 const built=buildDailySession(20);if(!built.session.length){alert('出題できる問題がありません。');return}state.session=built.session;state.index=0;state.score=0;state.answers=[];state.grade=built.plan?.grade||state.grade;state.subject=null;state.sessionContext={mode:'daily',examId:built.plan?.id||null};showView('playView');renderQuestion();
}
document.getElementById('createExamPlan').onclick=()=>openExamEditor();
document.getElementById('cancelExamEditTop').onclick=openExamPlans;document.getElementById('cancelExamEdit').onclick=openExamPlans;document.getElementById('saveExamPlan').onclick=saveCurrentExamPlan;document.getElementById('clearExamUnits').onclick=()=>{state.exam.units.clear();renderExamRanges();updateExamEditSummary();};


function openStats(){showView('statsView');renderStatsDashboard();}
function statsQuestionMap(){return new Map(state.questionBank.map(q=>[q.id,q]));}
function statsSubjectName(id){const s=state.curriculum?.subjects.find(x=>x.id===id);return s?`${s.icon} ${s.name}`:'不明';}
function statsUnitInfo(q){
 const subject=state.curriculum?.subjects.find(s=>s.id===q?.subject);if(!subject)return null;
 for(const field of subject.fields||[]){const unit=(field.units||[]).find(u=>u.id===q.unit);if(unit)return{subject,field,unit};}
 return null;
}
function detailedAnswerRecords(){
 const map=statsQuestionMap(),out=[];
 for(const h of studyHistory())for(const a of h.answerResults||[]){const q=map.get(a.questionId);if(q)out.push({...a,at:a.answeredAt||h.at,question:q});}
 return out;
}
function aggregateSubjectStats(){
 const result=new Map();
 const add=(sid,total,correct)=>{if(!sid||!total)return;const x=result.get(sid)||{total:0,correct:0};x.total+=total;x.correct+=correct;result.set(sid,x)};
 const map=statsQuestionMap();
 for(const h of studyHistory()){
  if(Array.isArray(h.answerResults)&&h.answerResults.length){for(const a of h.answerResults){const q=map.get(a.questionId);if(q)add(q.subject,1,a.correct?1:0)}}
  else if(h.subject)add(h.subject,Number(h.total)||0,Number(h.score)||0);
 }
 return result;
}
function modeLabel(mode){return({quiz:'小テスト',review:'苦手復習',exam:'定期テスト',daily:'今日の30分'})[mode]||'学習';}
function formatStudyDate(iso){const d=new Date(iso);if(Number.isNaN(d.getTime()))return'';return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
function renderStatsDashboard(){
 if(!state.curriculum)return;
 const history=studyHistory();
 const total=history.reduce((n,h)=>n+(Number(h.total)||0),0),correct=history.reduce((n,h)=>n+(Number(h.score)||0),0),rate=total?Math.round(correct/total*100):0;
 const streak=Number(localStorage.getItem('streakDays')||0);const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]').length;
 const summary=document.getElementById('statsSummary');
 summary.innerHTML=`<div class="stats-summary-card"><small>解いた問題</small><strong>${total}</strong><span>問</span></div><div class="stats-summary-card"><small>正答率</small><strong>${rate}</strong><span>%</span></div><div class="stats-summary-card"><small>連続学習</small><strong>${streak}</strong><span>日</span></div><div class="stats-summary-card"><small>苦手問題</small><strong>${missed}</strong><span>問</span></div>`;
 renderWeeklyStudy(history);renderSubjectStats();renderWeakUnitStats();renderRecentHistory(history);
}
function renderWeeklyStudy(history){
 const days=[];const now=new Date();now.setHours(0,0,0,0);
 for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push({date:dateOnlyLocal(d),label:['日','月','火','水','木','金','土'][d.getDay()],count:0});}
 history.forEach(h=>{const day=days.find(x=>x.date===dateOnlyLocal(new Date(h.at)));if(day)day.count+=Number(h.total)||0});
 const max=Math.max(1,...days.map(d=>d.count)),sum=days.reduce((n,d)=>n+d.count,0);document.getElementById('statsWeekTotal').textContent=`合計 ${sum}問`;
 const el=document.getElementById('weeklyStudyChart');el.innerHTML='';
 days.forEach(d=>{const item=document.createElement('div');item.className='week-bar-item';item.innerHTML=`<span class="week-count">${d.count||''}</span><div class="week-bar-track"><span style="height:${Math.max(d.count?8:2,Math.round(d.count/max*100))}%"></span></div><small>${d.label}</small>`;el.append(item)});
}
function renderSubjectStats(){
 const stats=aggregateSubjectStats(),el=document.getElementById('subjectStats');el.innerHTML='';
 const rows=[...stats.entries()].sort((a,b)=>b[1].total-a[1].total);
 if(!rows.length){el.innerHTML='<p class="help">まだ教科別の学習記録がありません。</p>';return;}
 rows.forEach(([sid,x])=>{const rate=x.total?Math.round(x.correct/x.total*100):0;const row=document.createElement('div');row.className='subject-stat-row';row.innerHTML=`<div class="subject-stat-head"><strong>${escapeHtml(statsSubjectName(sid))}</strong><span>${x.correct}/${x.total}問・${rate}%</span></div><div class="progress-track"><span style="width:${rate}%"></span></div>`;el.append(row)});
}
function renderWeakUnitStats(){
 const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]'),map=statsQuestionMap(),groups=new Map();
 for(const m of missed){const q=map.get(m.questionId),info=statsUnitInfo(q);if(!q||!info)continue;const key=`${q.subject}/${q.unit}`;const x=groups.get(key)||{count:0,subject:info.subject,field:info.field,unit:info.unit};x.count++;groups.set(key,x);}
 const el=document.getElementById('weakUnitStats');el.innerHTML='';const rows=[...groups.values()].sort((a,b)=>b.count-a.count).slice(0,8);
 if(!rows.length){el.innerHTML='<p class="help">現在、苦手として登録されている問題はありません。</p>';return;}
 rows.forEach(x=>{const row=document.createElement('div');row.className='weak-unit-row';row.innerHTML=`<div><strong>${x.subject.icon} ${escapeHtml(x.unit.name)}</strong><small>${escapeHtml(x.subject.name)} ＞ ${escapeHtml(x.field.name)}</small></div><span>${x.count}問</span>`;el.append(row)});
}
function renderRecentHistory(history){
 const el=document.getElementById('recentStudyHistory');el.innerHTML='';const rows=[...history].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,10);
 if(!rows.length){el.innerHTML='<p class="help">まだ学習履歴がありません。小テストを解くとここに記録されます。</p>';return;}
 rows.forEach(h=>{const row=document.createElement('div');row.className='history-row';const subj=h.subject?statsSubjectName(h.subject):'複数教科';row.innerHTML=`<div><strong>${escapeHtml(modeLabel(h.mode))}</strong><small>${escapeHtml(formatStudyDate(h.at))}・${escapeHtml(subj)}</small></div><span>${Number(h.score)||0}/${Number(h.total)||0}・${Number(h.rate)||0}%</span>`;el.append(row)});
}

function fillImportSubjects(){
 const sel=document.getElementById('importSubject');state.curriculum.subjects.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=`${s.icon} ${s.name}`;sel.append(o)});
 renderImportGrades();renderImportQuestions();
}
function renderImportGrades(){const el=document.getElementById('importGradeChoices');el.innerHTML='';[1,2,3].forEach(g=>{const b=document.createElement('button');b.className='chip'+(state.importGrade===g?' selected':'');b.textContent=`中${g}`;b.onclick=()=>{state.importGrade=g;renderImportGrades();updateImportFields()};el.append(b)})}
function updateImportFields(){
 const sid=document.getElementById('importSubject').value;const fs=document.getElementById('importField');const us=document.getElementById('importUnit');fs.innerHTML='<option value="">分野を選択</option>';us.innerHTML='<option value="">単元を選択</option>';if(!sid)return;const sub=state.curriculum.subjects.find(s=>s.id===sid);sub.fields.forEach(f=>{if(!f.units.some(u=>u.grades.includes(state.importGrade)))return;const o=document.createElement('option');o.value=f.id;o.textContent=f.name;fs.append(o)});
}
document.getElementById('importSubject').addEventListener('change',updateImportFields);
document.getElementById('importField').addEventListener('change',()=>{const sid=document.getElementById('importSubject').value;const fid=document.getElementById('importField').value;const us=document.getElementById('importUnit');us.innerHTML='<option value="">単元を選択</option>';const f=state.curriculum.subjects.find(s=>s.id===sid)?.fields.find(x=>x.id===fid);(f?.units||[]).filter(u=>u.grades.includes(state.importGrade)).forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=u.name;us.append(o)})});
function newImportQuestion(text=''){return{id:crypto.randomUUID?.()||String(Date.now()+Math.random()),type:'choice',question:text,choices:['','','',''],answer:0,answers:[''],modelAnswer:'',explanation:''}}

// OCR結果から、タイトル・氏名欄・注意書きなどを除き、問題部分を抽出する。
// AIや外部APIへ本文を送らず、端末内のルール処理だけで動作する。
// OCRは「問 1.」「問　1」「Q 1」「1 .」のように番号の周囲へ空白を入れることがあるため、
// 問題番号の検出前に文字幅・空白を正規化する。
const QUESTION_START_RE=/^\s*(?:(?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}|[0-9０-９]{1,3})\s*[.．、:：)）\-]?\s*/i;
const EMBEDDED_QUESTION_RE=/(?:^|\s)((?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}\s*[.．、:：)）\-]?)/gi;
const CHOICE_RE=/^\s*(?:([A-DＡ-Ｄa-d]|[ア-エ])\s*[.．、:：)）]?|([①②③④])|([1-4１-４])\s*[)）])\s*(.+?)\s*$/;
function normalizeOcrLine(line){return String(line||'').normalize('NFKC').replace(/[\u00a0\u3000]/g,' ').replace(/\s+/g,' ').trim();}
function compactJapaneseSpacing(text){
 let t=String(text||'');
 // 日本語文字同士の間にOCRが挿入した不要な空白だけを除去する。
 const jp='\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff';
 const re=new RegExp(`([${jp}])\\s+([${jp}])`,'g');
 let prev='';
 while(prev!==t){prev=t;t=t.replace(re,'$1$2');}
 return t.replace(/\s+([、。！？・])/g,'$1').replace(/([（「『])\s+/g,'$1').replace(/\s+([）」』])/g,'$1').trim();
}
function isPageMarker(line){return /^-+\s*[0-9０-９]+\s*ページ目\s*-+$/i.test(line);}
function isLikelyFooterOrNote(line){
 const t=normalizeOcrLine(line);
 return !t||/^[-－—―_=＿]{3,}$/.test(t)||/^\d+\s*\/\s*\d+$/.test(t)||/^ページ\s*\d+$/i.test(t)||/^※/.test(t)||/^(氏名|名前|学年|組|番号|日付|得点|点数)\s*[：:].*$/.test(t)||/^(答え|解答)(?:\s*[：:]\s*[_＿-]*)?\s*$/.test(t);
}
function stripQuestionNumber(text){return String(text||'').replace(QUESTION_START_RE,'').trim();}
function splitPagesFromOcr(raw){
 const lines=String(raw||'').replace(/\r/g,'').split('\n');
 const pages=[];let current=[];
 for(const line of lines){
  if(isPageMarker(normalizeOcrLine(line))){if(current.some(x=>x.trim()))pages.push(current);current=[];continue}
  current.push(line);
 }
 if(current.some(x=>x.trim()))pages.push(current);
 return pages.length?pages:[lines];
}
function ensureQuestionStartsOnOwnLine(raw){
 // OCRによって「答え 問 2. ...」のように同一行へ連結された場合にも対応する。
 return String(raw||'').replace(/([^\n])\s+((?:問\s*|Q\s*|Ｑ\s*)[0-9０-９]{1,3}\s*[.．、:：)）\-]?\s*)/gi,'$1\n$2');
}
function extractQuestionBlocks(raw){
 const blocks=[];
 for(const rawPage of splitPagesFromOcr(ensureQuestionStartsOnOwnLine(raw))){
  let lines=rawPage.map(normalizeOcrLine).filter(Boolean);
  const firstQuestion=lines.findIndex(line=>QUESTION_START_RE.test(line));
  // 問題番号が見つかったページは、それ以前をタイトル・氏名欄などとして除外。
  if(firstQuestion>=0)lines=lines.slice(firstQuestion);
  let current=[];
  for(const line of lines){
   if(QUESTION_START_RE.test(line)){
    if(current.length)blocks.push(current.join('\n').trim());
    current=[line];
   }else if(current.length){
    // 問題開始後の「答え」、脚注、ページ番号等は登録対象にしない。
    if(!isLikelyFooterOrNote(line))current.push(line);
   }
  }
  if(current.length)blocks.push(current.join('\n').trim());
 }
 // 問題番号をまったく認識できなかったときだけ、空行区切りをフォールバックにする。
 if(!blocks.length){
  return String(raw||'').split(/\n\s*\n+/).map(x=>x.trim()).filter(x=>x&&!isLikelyFooterOrNote(x));
 }
 return blocks;
}
function inferImportedQuestion(block){
 const lines=String(block||'').split('\n').map(normalizeOcrLine).filter(Boolean).filter(x=>!isLikelyFooterOrNote(x));
 if(!lines.length)return newImportQuestion('');
 lines[0]=stripQuestionNumber(lines[0]);
 const choices=[];const body=[];
 for(const line of lines){
  const m=line.match(CHOICE_RE);
  if(m&&body.length){choices.push(compactJapaneseSpacing(m[4]));}
  else body.push(compactJapaneseSpacing(line));
 }
 const questionText=compactJapaneseSpacing(body.join(' '));
 const q=newImportQuestion(questionText);
 if(choices.length>=2){
  q.type='choice';q.choices=choices.slice(0,4);while(q.choices.length<4)q.choices.push('');q.answer=0;
 }else if(/(?:説明|理由|根拠|考え|述べ|文章で|詳しく|なぜ)/.test(questionText)){
  q.type='text';q.modelAnswer='';
 }else{
  q.type='word';q.answers=[''];
 }
 return q;
}
function splitRecognizedText(){
 const text=document.getElementById('ocrText').value.trim();
 if(!text){alert('先に読み取り結果または手入力の文章を用意してください。');return}
 const blocks=extractQuestionBlocks(text);
 state.importQuestions=blocks.map(inferImportedQuestion).filter(q=>q.question.trim());
 const status=document.getElementById('ocrStatus');
 if(status)status.textContent=state.importQuestions.length
  ?`問題番号を基準に${state.importQuestions.length}問へ分割しました。タイトル・氏名欄・「答え」・ページ番号は除外しています。問題文・解答形式・正解を確認して修正してください。`
  :'問題を自動抽出できませんでした。OCR結果を修正するか「＋ 問題を手動追加」を使ってください。';
 renderImportQuestions();
}
function renderImportQuestions(){const el=document.getElementById('importQuestionEditor');el.innerHTML='';state.importQuestions.forEach((q,idx)=>{const card=document.createElement('div');card.className='import-question-card';card.innerHTML=`<div class="import-question-head"><strong>問題 ${idx+1}</strong><button type="button" class="remove-question" aria-label="問題を削除">削除</button></div><label>解答形式<select data-iq="type"><option value="choice" ${q.type==='choice'?'selected':''}>選択</option><option value="word" ${q.type==='word'?'selected':''}>単語・短答</option><option value="text" ${q.type==='text'?'selected':''}>文章・記述</option></select></label><textarea data-iq="question" rows="3" placeholder="問題文">${escapeHtml(q.question)}</textarea><div data-type-area></div><textarea data-iq="explanation" rows="2" placeholder="解説（任意）">${escapeHtml(q.explanation)}</textarea>`;
 const renderType=()=>{const a=card.querySelector('[data-type-area]');a.innerHTML='';if(q.type==='choice'){a.className='choice-editor';a.innerHTML=q.choices.map((c,i)=>`<label><input type="radio" name="ans-${q.id}" value="${i}" ${q.answer===i?'checked':''}><input type="text" data-choice="${i}" value="${escapeAttr(c)}" placeholder="選択肢 ${String.fromCharCode(65+i)}"></label>`).join('');a.querySelectorAll('[data-choice]').forEach(x=>x.oninput=e=>q.choices[Number(e.target.dataset.choice)]=e.target.value);a.querySelectorAll('input[type=radio]').forEach(x=>x.onchange=e=>q.answer=Number(e.target.value));}else if(q.type==='word'){a.innerHTML=`<label>正解（複数ある場合は | で区切る）<input type="text" data-answer-word value="${escapeAttr((q.answers||[]).join(' | '))}" placeholder="例：源頼朝 | みなもとのよりとも"></label>`;a.querySelector('[data-answer-word]').oninput=e=>q.answers=e.target.value.split('|').map(x=>x.trim()).filter(Boolean);}else{a.innerHTML=`<label>模範解答<textarea data-model-answer rows="4" placeholder="文章・記述問題の模範解答">${escapeHtml(q.modelAnswer||'')}</textarea></label>`;a.querySelector('[data-model-answer]').oninput=e=>q.modelAnswer=e.target.value;}};
 card.querySelector('[data-iq="question"]').oninput=e=>q.question=e.target.value;card.querySelector('[data-iq="explanation"]').oninput=e=>q.explanation=e.target.value;card.querySelector('[data-iq="type"]').onchange=e=>{q.type=e.target.value;renderType()};card.querySelector('.remove-question').onclick=()=>{state.importQuestions.splice(idx,1);renderImportQuestions()};renderType();el.append(card)});}
function escapeHtml(v){return String(v).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}
function escapeAttr(v){return escapeHtml(v).replace(/"/g,'&quot;')}
document.getElementById('splitQuestions').onclick=splitRecognizedText;document.getElementById('addImportQuestion').onclick=()=>{state.importQuestions.push(newImportQuestion());renderImportQuestions()};
function releaseImportedObjectUrls(){importedObjectUrls.forEach(url=>URL.revokeObjectURL(url));importedObjectUrls=[];}
function renderImportPreview(message='取り込んだページを確認してください。文字がぼやけている場合は撮り直してください。'){
 const area=document.getElementById('previewArea'),list=document.getElementById('pagePreviewList'),summary=document.getElementById('fileSummary');
 list.innerHTML='';
 state.importPages.forEach((page,i)=>{const card=document.createElement('div');card.className='page-preview-card';const img=document.createElement('img');img.src=page.src;img.alt=`取り込みページ ${i+1}`;const cap=document.createElement('small');cap.textContent=page.label||`${i+1}ページ目`;card.append(img,cap);list.append(card)});
 area.hidden=!state.importPages.length;
 summary.textContent=state.importPages.length?`${state.importPages.length}ページを取り込みました。`:'';
 document.getElementById('imageStatus').textContent=state.importPages.length?message:'';
}
function clearPreview(){releaseImportedObjectUrls();state.importPages=[];document.getElementById('previewArea').hidden=true;document.getElementById('pagePreviewList').innerHTML='';document.getElementById('fileSummary').textContent='';document.getElementById('paperImage').value='';document.getElementById('imageStatus').textContent='';}
function addObjectUrl(file,label){const url=URL.createObjectURL(file);importedObjectUrls.push(url);state.importPages.push({src:url,label,type:'image'});}
function loadScriptOnce(src,key){return new Promise(resolve=>{if(key&&window[key]){resolve(true);return}const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(existing.dataset.loaded==='1')resolve(true);else{existing.addEventListener('load',()=>resolve(true),{once:true});existing.addEventListener('error',()=>resolve(false),{once:true})}return}const sc=document.createElement('script');sc.src=src;sc.crossOrigin='anonymous';sc.onload=()=>{sc.dataset.loaded='1';resolve(true)};sc.onerror=()=>resolve(false);document.head.append(sc)});}
async function loadPdfLibrary(){
 if(window.pdfjsLib)return true;
 const status=document.getElementById('imageStatus');
 status.textContent='PDF読み込みライブラリを準備しています…';
 const sources=[
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/',
  'https://unpkg.com/pdfjs-dist@3.11.174/'
 ];
 for(const root of sources){
  const ok=await loadScriptOnce(root+'build/pdf.min.js','pdfjsLib');
  if(ok&&window.pdfjsLib){
   state.pdfAssetBase=root;
   state.pdfWorkerUrl=root+'build/pdf.worker.min.js';
   if(window.pdfjsLib.GlobalWorkerOptions)window.pdfjsLib.GlobalWorkerOptions.workerSrc=state.pdfWorkerUrl;
   return true;
  }
 }
 return false;
}

function pdfCanvasLooksTextless(ctx,canvas){
 // ページ全体を軽くサンプリングし、黒〜濃灰色の画素が極端に少ない場合だけ
 // テキスト再描画を行う。罫線だけのページを文字なしと判定しやすくする。
 try{
  const sample=document.createElement('canvas');
  const sw=Math.min(220,canvas.width),sh=Math.max(1,Math.round(canvas.height*(sw/canvas.width)));
  sample.width=sw;sample.height=sh;
  const sctx=sample.getContext('2d',{willReadFrequently:true});
  sctx.drawImage(canvas,0,0,sw,sh);
  const data=sctx.getImageData(0,0,sw,sh).data;
  let dark=0,total=0;
  for(let i=0;i<data.length;i+=16){
   const r=data[i],g=data[i+1],b=data[i+2];
   if(r<175&&g<175&&b<175)dark++;
   total++;
  }
  return total===0||dark/total<0.006;
 }catch(_){return true}
}
function overlayPdfText(ctx,viewport,textContent){
 const util=window.pdfjsLib?.Util;if(!util||!textContent?.items)return;
 ctx.save();
 ctx.fillStyle='#111';
 ctx.textBaseline='alphabetic';
 for(const item of textContent.items){
  const str=(item.str||'');if(!str.trim())continue;
  const tx=util.transform(viewport.transform,item.transform);
  const fontSize=Math.max(7,Math.hypot(tx[2],tx[3])||Math.hypot(tx[0],tx[1])||12);
  const x=tx[4],y=tx[5];
  ctx.save();
  ctx.translate(x,y);
  // PDFのテキスト座標をcanvas向けに補正し、日本語を描ける一般フォントへ置換。
  ctx.scale(1,-1);
  ctx.font=`${fontSize}px "Yu Gothic","Meiryo","Noto Sans CJK JP",sans-serif`;
  ctx.fillText(str,0,0);
  ctx.restore();
 }
 ctx.restore();
}

async function renderPdfFile(file){
 const ok=await loadPdfLibrary();if(!ok)throw new Error('PDF.jsを読み込めませんでした。ネットワーク制限を確認してください。');
 const data=new Uint8Array(await file.arrayBuffer());
 const assetBase=state.pdfAssetBase||'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
 const docOptions={
  data,
  cMapUrl:assetBase+'cmaps/',
  cMapPacked:true,
  standardFontDataUrl:assetBase+'standard_fonts/',
  useSystemFonts:true,
  useWorkerFetch:false,
  isEvalSupported:false
 };
 let pdf;
 try{
  pdf=await window.pdfjsLib.getDocument(docOptions).promise;
 }catch(firstError){
  console.warn('PDF.js primary source failed',firstError);
  // 配信元固有のCMap/フォント取得失敗を想定して、予備CDNへ切り替えて1度だけ再試行する。
  const fallbackRoot=(assetBase.includes('jsdelivr'))?'https://unpkg.com/pdfjs-dist@3.11.174/':'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
  const retryOptions={...docOptions,cMapUrl:fallbackRoot+'cmaps/',standardFontDataUrl:fallbackRoot+'standard_fonts/'};
  pdf=await window.pdfjsLib.getDocument(retryOptions).promise;
 }
 if(pdf.numPages>20)throw new Error('PDFは20ページ以下にしてください。');
 for(let n=1;n<=pdf.numPages;n++){
  document.getElementById('imageStatus').textContent=`PDFをページ画像へ変換しています… ${n}/${pdf.numPages}`;
  const page=await pdf.getPage(n);
  const baseViewport=page.getViewport({scale:1});
  const scale=Math.max(1.5,Math.min(2.5,2000/baseViewport.width));
  const viewport=page.getViewport({scale});
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
  if(!ctx)throw new Error(`${n}ページ目の描画領域を作成できませんでした。`);
  ctx.save();
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
  await page.render({canvasContext:ctx,viewport,intent:'display'}).promise;

  // 一部の日本語PDFはフォントを埋め込まず、文字コードだけを保持している。
  // その場合PDF.jsは罫線等を描けても本文のグリフを描けないことがあるため、
  // 取得できるテキスト情報を使って汎用の日本語フォントで文字を再描画する。
  try{
   const textContent=await page.getTextContent({includeMarkedContent:false});
   const chars=textContent.items?.reduce((n,item)=>n+(item.str||'').trim().length,0)||0;
   if(chars>0&&pdfCanvasLooksTextless(ctx,canvas)){
    overlayPdfText(ctx,viewport,textContent);
    console.info(`PDF ${n}ページ目: フォント描画フォールバックを使用しました。`);
   }
  }catch(textError){
   console.warn(`PDF ${n}ページ目のテキスト補完に失敗しました。`,textError);
  }

  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(page.cleanup)page.cleanup(false);
  if(!blob)throw new Error(`${n}ページ目の画像化に失敗しました。`);
  const url=URL.createObjectURL(blob);
  importedObjectUrls.push(url);
  state.importPages.push({src:url,label:`${file.name} - ${n}/${pdf.numPages}ページ`,type:'pdf-page'});
 }
 if(typeof pdf.destroy==='function')await pdf.destroy();
}
async function handleImportFiles(fileList){
 const files=[...fileList];if(!files.length)return;
 clearPreview();const status=document.getElementById('imageStatus');document.getElementById('previewArea').hidden=false;status.textContent='ファイルを確認しています…';
 try{
  for(const file of files){
   const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
   if(isPdf){if(file.size>30*1024*1024)throw new Error('PDFは30MB以下にしてください。');await renderPdfFile(file);}
   else if(file.type.startsWith('image/')){if(file.size>12*1024*1024)throw new Error('画像は1枚12MB以下にしてください。');addObjectUrl(file,file.name);}
   else throw new Error('PDF / JPG / PNG / WEBPなどの画像ファイルを選んでください。');
  }
  renderImportPreview('取り込み完了です。ページの向きや文字の鮮明さを確認してからOCRを実行してください。');
 }catch(error){console.error(error);clearPreview();document.getElementById('previewArea').hidden=false;document.getElementById('imageStatus').textContent='読み込み失敗：'+(error?.message||String(error));}
}
const paperInput=document.getElementById('paperImage');
paperInput.addEventListener('change',e=>handleImportFiles(e.target.files));
const dropZone=document.getElementById('dropZone');
['dragenter','dragover'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();dropZone.classList.add('dragover')}));
['dragleave','drop'].forEach(type=>dropZone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();dropZone.classList.remove('dragover')}));
dropZone.addEventListener('drop',e=>handleImportFiles(e.dataTransfer.files));
dropZone.addEventListener('click',()=>paperInput.click());
dropZone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();paperInput.click();}});
document.getElementById('openCamera').onclick=()=>openCamera();document.getElementById('closeCamera').onclick=()=>closeCamera();document.getElementById('retakePhoto').onclick=()=>openCamera();document.getElementById('clearPhoto').onclick=clearPreview;document.getElementById('switchCamera').onclick=async()=>{facingMode=facingMode==='environment'?'user':'environment';await startCamera();};document.getElementById('takePhoto').onclick=takePhoto;
async function openCamera(){const modal=document.getElementById('cameraModal');modal.hidden=false;document.body.style.overflow='hidden';await startCamera();}
async function startCamera(){const status=document.getElementById('cameraStatus');if(!navigator.mediaDevices?.getUserMedia){status.textContent='このブラウザではカメラ撮影を利用できません。「画像・PDFを選ぶ」を使ってください。';return}stopCamera();status.textContent='カメラを起動しています…';try{cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facingMode},width:{ideal:1920},height:{ideal:1080}},audio:false});const video=document.getElementById('cameraVideo');video.srcObject=cameraStream;await video.play();status.textContent='紙全体を枠の中に入れ、影や反射が少ない状態で撮影してください。';}catch(error){console.error(error);status.textContent=error?.name==='NotAllowedError'?'カメラの使用が許可されていません。ブラウザのカメラ権限を確認するか、「画像・PDFを選ぶ」を使ってください。':'カメラを起動できませんでした。「画像・PDFを選ぶ」を使ってください。';}}
function stopCamera(){if(cameraStream){cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null;}const video=document.getElementById('cameraVideo');if(video)video.srcObject=null;}
function closeCamera(){stopCamera();document.getElementById('cameraModal').hidden=true;document.body.style.overflow='';}
function takePhoto(){const video=document.getElementById('cameraVideo');if(!cameraStream||!video.videoWidth){document.getElementById('cameraStatus').textContent='カメラ映像を取得できていません。';return}const canvas=document.getElementById('captureCanvas');const maxWidth=1800;const scale=Math.min(1,maxWidth/video.videoWidth);canvas.width=Math.round(video.videoWidth*scale);canvas.height=Math.round(video.videoHeight*scale);const ctx=canvas.getContext('2d');ctx.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(!blob){document.getElementById('cameraStatus').textContent='撮影画像を作成できませんでした。';return}clearPreview();const url=URL.createObjectURL(blob);importedObjectUrls.push(url);state.importPages=[{src:url,label:'カメラ撮影',type:'camera'}];renderImportPreview('撮影した画像です。問題文が読めるか確認し、必要なら「カメラで撮り直す」を押してください。');closeCamera();},'image/jpeg',0.9);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});window.addEventListener('beforeunload',()=>{stopCamera();releaseImportedObjectUrls()});
async function loadOcrLibrary(){
 if(window.Tesseract)return true;
 const status=document.getElementById('ocrStatus');
 status.textContent='OCRライブラリを読み込んでいます…';
 const sources=[
  'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js',
  'https://unpkg.com/tesseract.js@7.0.0/dist/tesseract.min.js'
 ];
 for(const src of sources){
  const ok=await loadScriptOnce(src,'Tesseract');
  if(ok&&window.Tesseract){state.ocrScriptUrl=src;return true;}
 }
 return false;
}
document.getElementById('runOcr').onclick=async()=>{
 if(!state.importPages.length){alert('先に紙テストを撮影するか、画像・PDFを選んでください。');return}
 const ok=await loadOcrLibrary();if(!ok){document.getElementById('ocrStatus').textContent='OCRを読み込めませんでした。学校ネットワーク等で外部ライブラリが制限されている場合は手入力してください。';return}
 const btn=document.getElementById('runOcr'),prog=document.getElementById('ocrProgress'),status=document.getElementById('ocrStatus');btn.disabled=true;prog.hidden=false;prog.value=0;
 try{
  const total=state.importPages.length;const worker=await Tesseract.createWorker('jpn+eng',1,{logger:m=>{if(m.progress!=null){const base=Number(btn.dataset.pageIndex||0);const pct=Math.round(((base+m.progress)/total)*100);prog.value=pct;status.textContent=`文字を読み取っています… ${base+1}/${total}ページ (${pct}%)`;}}});
  const texts=[];
  for(let i=0;i<total;i++){btn.dataset.pageIndex=String(i);const ret=await worker.recognize(state.importPages[i].src);const text=(ret.data.text||'').trim();texts.push(total>1?`--- ${i+1}ページ目 ---\n${text}`:text);prog.value=Math.round(((i+1)/total)*100);}
  await worker.terminate();delete btn.dataset.pageIndex;document.getElementById('ocrText').value=texts.join('\n\n');status.textContent=`${total}ページの読み取りが終わりました。誤字や抜けを修正してから問題に分割してください。`;
 }catch(e){console.error(e);status.textContent='OCRに失敗しました。ページを確認するか、手入力で修正してください。';}
 finally{btn.disabled=false;prog.hidden=true;delete btn.dataset.pageIndex;}
};
document.getElementById('saveDraft').onclick=()=>{const draft={createdAt:new Date().toISOString(),grade:state.importGrade,subject:document.getElementById('importSubject').value,field:document.getElementById('importField').value,unit:document.getElementById('importUnit').value,text:document.getElementById('ocrText').value,questions:state.importQuestions};const drafts=JSON.parse(localStorage.getItem('paperDrafts')||'[]');drafts.push({...draft,id:crypto.randomUUID?.()||String(Date.now()),status:'draft'});localStorage.setItem('paperDrafts',JSON.stringify(drafts.slice(-50)));document.getElementById('draftStatus').textContent='編集途中の内容をこの端末に保存しました。';};
document.getElementById('saveQuestions').onclick=()=>{const subject=document.getElementById('importSubject').value,unit=document.getElementById('importUnit').value;if(!subject||!unit){document.getElementById('draftStatus').textContent='学年・教科・分野・単元を選んでください。';return}const valid=state.importQuestions.filter(q=>q.question.trim()&&((q.type==='choice'&&q.choices.every(c=>c.trim()))||(q.type==='word'&&acceptedTextAnswers(q).length)||(q.type==='text'&&q.modelAnswer.trim())));if(!valid.length){document.getElementById('draftStatus').textContent='問題文と、選んだ解答形式に必要な正解を入力してください。';return}const custom=loadCustomQuestions();const now=Date.now();valid.forEach((q,i)=>{const item={id:`custom-${now}-${i}`,grades:[state.importGrade],subject,unit,type:q.type,difficulty:1,question:q.question.trim(),explanation:q.explanation.trim()||'紙テストから登録した問題です。',source:'paper',createdAt:new Date().toISOString()};if(q.type==='choice')Object.assign(item,{choices:q.choices.map(c=>c.trim()),answer:q.answer});else if(q.type==='word')Object.assign(item,{answers:acceptedTextAnswers(q)});else Object.assign(item,{modelAnswer:q.modelAnswer.trim()});custom.push(item)});saveCustomQuestions(custom);document.getElementById('draftStatus').textContent=`${valid.length}問を問題バンクへ登録しました。登録問題の管理から編集・削除できます。`;state.importQuestions=[];renderImportQuestions();};

function fillManageSubjects(){const sel=document.getElementById('manageSubject');if(!sel||!state.curriculum)return;sel.innerHTML='<option value="all">すべての教科</option>';state.curriculum.subjects.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=`${s.icon} ${s.name}`;sel.append(o)});sel.onchange=renderManageQuestions;}
function openManage(){showView('manageView');renderManageQuestions();}
function unitNameFor(q){for(const s of state.curriculum.subjects){for(const f of s.fields){const u=f.units.find(x=>x.id===q.unit);if(u)return `${f.name} ＞ ${u.name}`}}return q.unit||'';}
function renderManageQuestions(){const list=document.getElementById('manageQuestionList');if(!list)return;const filter=document.getElementById('manageSubject')?.value||'all';const items=loadCustomQuestions().filter(q=>filter==='all'||q.subject===filter);document.getElementById('manageSummary').textContent=`登録済み ${items.length}問`;list.innerHTML='';if(!items.length){list.innerHTML='<div class="step-card"><p class="help">登録した問題はまだありません。</p></div>';return}items.slice().reverse().forEach(q=>{const s=state.curriculum.subjects.find(x=>x.id===q.subject);const card=document.createElement('div');card.className='manage-question-card';card.innerHTML=`<div class="manage-question-meta"><span>${s?.icon||''} 中${q.grades?.[0]||''}・${escapeHtml(s?.name||q.subject)}</span><span class="type-badge">${q.type==='choice'?'選択':q.type==='word'?'単語':'文章'}</span></div><strong>${escapeHtml(q.question)}</strong><small>${escapeHtml(unitNameFor(q))}</small><div class="manage-actions"><button class="secondary" data-edit>編集</button><button class="danger" data-delete>削除</button></div>`;card.querySelector('[data-edit]').onclick=()=>openManageEdit(q.id);card.querySelector('[data-delete]').onclick=()=>deleteManagedQuestion(q.id);list.append(card)});}
function deleteManagedQuestion(id){const q=loadCustomQuestions().find(x=>x.id===id);if(!q)return;if(!confirm(`「${q.question}」を削除しますか？`))return;saveCustomQuestions(loadCustomQuestions().filter(x=>x.id!==id));const missed=JSON.parse(localStorage.getItem('missedQuestions')||'[]').filter(x=>x.questionId!==id);localStorage.setItem('missedQuestions',JSON.stringify(missed));renderManageQuestions();renderQuiz();}
function openManageEdit(id){state.manageEditId=id;showView('manageEditView');renderManageEditForm();}
function renderManageEditForm(){const q=loadCustomQuestions().find(x=>x.id===state.manageEditId);const host=document.getElementById('manageEditForm');if(!q){host.innerHTML='<p>問題が見つかりません。</p>';return}const subjects=state.curriculum.subjects.map(s=>`<option value="${s.id}" ${s.id===q.subject?'selected':''}>${s.icon} ${s.name}</option>`).join('');host.innerHTML=`<label>学年<select id="meGrade"><option value="1" ${q.grades?.includes(1)?'selected':''}>中1</option><option value="2" ${q.grades?.includes(2)?'selected':''}>中2</option><option value="3" ${q.grades?.includes(3)?'selected':''}>中3</option></select></label><label>教科<select id="meSubject">${subjects}</select></label><label>単元<select id="meUnit"></select></label><label>解答形式<select id="meType"><option value="choice" ${q.type==='choice'?'selected':''}>選択</option><option value="word" ${q.type==='word'?'selected':''}>単語・短答</option><option value="text" ${q.type==='text'?'selected':''}>文章・記述</option></select></label><label>問題文<textarea id="meQuestion" rows="4">${escapeHtml(q.question)}</textarea></label><div id="meAnswerArea"></div><label>解説<textarea id="meExplanation" rows="3">${escapeHtml(q.explanation||'')}</textarea></label>`;const populateUnits=()=>{const sid=document.getElementById('meSubject').value,g=Number(document.getElementById('meGrade').value),sel=document.getElementById('meUnit');sel.innerHTML='';const sub=state.curriculum.subjects.find(s=>s.id===sid);sub?.fields.forEach(f=>f.units.filter(u=>u.grades.includes(g)).forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=`${f.name} ＞ ${u.name}`;if(u.id===q.unit)o.selected=true;sel.append(o)}))};const renderAns=()=>{const a=document.getElementById('meAnswerArea'),t=document.getElementById('meType').value;if(t==='choice'){const choices=q.choices||['','','',''];a.innerHTML=`<p><strong>選択肢・正解</strong></p>${choices.map((c,i)=>`<label class="manage-choice"><input type="radio" name="meAns" value="${i}" ${(q.answer??0)===i?'checked':''}><input type="text" data-me-choice="${i}" value="${escapeAttr(c)}"></label>`).join('')}`;}else if(t==='word'){a.innerHTML=`<label>正解（ | 区切り）<input id="meWords" type="text" value="${escapeAttr(acceptedTextAnswers(q).join(' | '))}"></label>`;}else{a.innerHTML=`<label>模範解答<textarea id="meModel" rows="4">${escapeHtml(q.modelAnswer||'')}</textarea></label>`;}};document.getElementById('meSubject').onchange=populateUnits;document.getElementById('meGrade').onchange=populateUnits;document.getElementById('meType').onchange=renderAns;populateUnits();renderAns();}
document.getElementById('cancelManageEdit').onclick=document.getElementById('cancelManageEditTop').onclick=()=>{state.manageEditId=null;openManage();};
document.getElementById('saveManagedQuestion').onclick=()=>{const items=loadCustomQuestions(),q=items.find(x=>x.id===state.manageEditId);if(!q)return;const type=document.getElementById('meType').value,question=document.getElementById('meQuestion').value.trim(),unit=document.getElementById('meUnit').value;if(!question||!unit){document.getElementById('manageEditStatus').textContent='問題文と単元を入力してください。';return}q.grades=[Number(document.getElementById('meGrade').value)];q.subject=document.getElementById('meSubject').value;q.unit=unit;q.type=type;q.question=question;q.explanation=document.getElementById('meExplanation').value.trim();delete q.choices;delete q.answer;delete q.answers;delete q.answerText;delete q.modelAnswer;if(type==='choice'){q.choices=[...document.querySelectorAll('[data-me-choice]')].map(x=>x.value.trim());q.answer=Number(document.querySelector('input[name="meAns"]:checked')?.value||0);if(q.choices.some(x=>!x)){document.getElementById('manageEditStatus').textContent='4つの選択肢を入力してください。';return}}else if(type==='word'){q.answers=document.getElementById('meWords').value.split('|').map(x=>x.trim()).filter(Boolean);if(!q.answers.length){document.getElementById('manageEditStatus').textContent='正解を入力してください。';return}}else{q.modelAnswer=document.getElementById('meModel').value.trim();if(!q.modelAnswer){document.getElementById('manageEditStatus').textContent='模範解答を入力してください。';return}}q.updatedAt=new Date().toISOString();saveCustomQuestions(items);renderQuiz();document.getElementById('manageEditStatus').textContent='保存しました。';setTimeout(()=>openManage(),350);};


function renderEnvironmentCheck(){
 const box=document.getElementById('environmentCheck');
 if(!box)return;
 const secure=window.isSecureContext===true;
 const https=location.protocol==='https:';
 const localhost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 const fileMode=location.protocol==='file:';
 const rows=[
  {ok:https||localhost,label:'HTTPS / 安全な接続',detail:https?'HTTPSで接続中':(localhost?'localhostで開いています':'HTTPSではありません')},
  {ok:secure,label:'カメラ利用条件',detail:secure?'安全なコンテキストです':'カメラはHTTPSで利用してください'},
  {ok:!fileMode,label:'起動方法',detail:fileMode?'index.htmlの直接起動はPDF/OCR非対応です':'Webサーバー経由で起動しています'}
 ];
 box.innerHTML=rows.map(r=>`<div class="env-row ${r.ok?'ok':'ng'}"><span>${r.ok?'✓':'!'}</span><div><strong>${r.label}</strong><small>${r.detail}</small></div></div>`).join('');
 const notice=document.getElementById('runtimeNotice');
 if(fileMode&&notice){notice.classList.add('warning');notice.textContent='この画面は file:// で直接開かれています。PDF/OCR/カメラは正常動作しないため、Cloudflare PagesのHTTPS URLから利用してください。';}
}

init();
renderEnvironmentCheck();
const envBtn=document.getElementById('runEnvironmentCheck');if(envBtn)envBtn.onclick=renderEnvironmentCheck;


// PWA / home-screen install
let deferredInstallPrompt = null;
function isStandaloneMode(){
 return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function isIosDevice(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isAndroidDevice(){return /android/i.test(navigator.userAgent)}
function updateInstallCard(){
 const card=document.getElementById('installCard');
 if(!card)return;
 if(isStandaloneMode()){card.hidden=true;return;}
 const mobile=isIosDevice()||isAndroidDevice()||window.matchMedia?.('(max-width: 820px)').matches;
 card.hidden=!mobile;
}
function showInstallInstructions(){
 const modal=document.getElementById('installModal');
 const box=document.getElementById('installInstructions');
 if(!modal||!box)return;
 if(isIosDevice()){
  box.innerHTML='<p><strong>iPhone / iPad</strong></p><ol><li>Safariでこのサイトを開きます。</li><li>画面下の「共有」ボタンを押します。</li><li>「ホーム画面に追加」を選びます。</li><li>右上の「追加」を押します。</li></ol><p class="help">Chromeなどで開いている場合は、Safariで開いてから追加してください。</p>';
 }else{
  box.innerHTML='<p><strong>ホーム画面への追加方法</strong></p><ol><li>ブラウザのメニューを開きます。</li><li>「アプリをインストール」または「ホーム画面に追加」を選びます。</li><li>確認画面で追加します。</li></ol>';
 }
 modal.hidden=false;document.body.style.overflow='hidden';
}
function closeInstallInstructions(){const modal=document.getElementById('installModal');if(modal)modal.hidden=true;document.body.style.overflow='';}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;updateInstallCard();});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallCard();});
document.getElementById('installApp')?.addEventListener('click',async()=>{
 if(deferredInstallPrompt){
  deferredInstallPrompt.prompt();
  try{await deferredInstallPrompt.userChoice}catch(_){ }
  deferredInstallPrompt=null;updateInstallCard();
 }else showInstallInstructions();
});
document.getElementById('closeInstallModal')?.addEventListener('click',closeInstallInstructions);
document.getElementById('installModal')?.addEventListener('click',e=>{if(e.target.id==='installModal')closeInstallInstructions();});
updateInstallCard();

if('serviceWorker' in navigator && location.protocol === 'https:'){
 window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(err=>console.warn('Service Worker registration failed',err)));
}


// Data backup / transfer (v0.15)
const BACKUP_KEYS=[
 'lastQuizSelection','missedQuestions','studyHistory','examStudyLogs','examPlans',
 'customQuestions','lastStudyDate','streakDays','paperDrafts'
];
let pendingBackupData=null;
function safeJsonParse(value,fallback){try{return JSON.parse(value)}catch{return fallback}}
function backupDataSnapshot(){
 const data={};
 BACKUP_KEYS.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)data[key]=value;});
 return data;
}
function backupSummaryFromData(data){
 const readArray=(key)=>{const v=data?.[key];if(v==null)return[];return safeJsonParse(v,[])||[]};
 return {
  history:readArray('studyHistory').length,
  missed:readArray('missedQuestions').length,
  custom:readArray('customQuestions').length,
  exams:readArray('examPlans').length,
  drafts:readArray('paperDrafts').length
 };
}
function openBackup(){showView('backupView');pendingBackupData=null;const p=document.getElementById('backupPreview');if(p)p.hidden=true;const a=document.getElementById('backupImportActions');if(a)a.hidden=true;const f=document.getElementById('backupFile');if(f)f.value='';document.getElementById('importBackupStatus').textContent='';}
function downloadBackup(){
 const payload={app:'30min-study',schemaVersion:1,appVersion:'0.15',exportedAt:new Date().toISOString(),data:backupDataSnapshot()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');const d=new Date();const ymd=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 a.href=url;a.download=`study-backup-${ymd}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 const sum=backupSummaryFromData(payload.data);document.getElementById('exportBackupStatus').textContent=`保存しました：学習履歴${sum.history}件・登録問題${sum.custom}問・定期テスト${sum.exams}件`;
}
function validateBackup(obj){
 if(!obj||obj.app!=='30min-study'||obj.schemaVersion!==1||typeof obj.data!=='object'||Array.isArray(obj.data))throw new Error('このアプリのバックアップ形式ではありません。');
 for(const key of Object.keys(obj.data)){if(!BACKUP_KEYS.includes(key))continue;if(typeof obj.data[key]!=='string')throw new Error('バックアップ内容が壊れています。');}
 return obj;
}
function renderBackupPreview(payload){
 const sum=backupSummaryFromData(payload.data);const el=document.getElementById('backupPreview');const when=payload.exportedAt?new Date(payload.exportedAt).toLocaleString('ja-JP'):'日時不明';
 el.innerHTML=`<strong>バックアップを確認</strong><dl class="backup-summary"><div><dt>作成日時</dt><dd>${escapeHtml(when)}</dd></div><div><dt>学習履歴</dt><dd>${sum.history}件</dd></div><div><dt>苦手問題</dt><dd>${sum.missed}問</dd></div><div><dt>登録問題</dt><dd>${sum.custom}問</dd></div><div><dt>定期テスト</dt><dd>${sum.exams}件</dd></div><div><dt>紙テスト下書き</dt><dd>${sum.drafts}件</dd></div></dl>`;
 el.hidden=false;document.getElementById('backupImportActions').hidden=false;
}
function uniqueMerge(current,incoming,keyFn){const map=new Map();[...current,...incoming].forEach(item=>{const key=keyFn(item);if(key!=null&&!map.has(key))map.set(key,item);else if(key==null)map.set(`anon-${map.size}`,item)});return [...map.values()]}
function mergeBackupData(data){
 const arrayKeys={
  missedQuestions:x=>x?.questionId,
  customQuestions:x=>x?.id,
  examPlans:x=>x?.id,
  examStudyLogs:x=>x?.id||`${x?.examId||''}|${x?.at||''}`,
  paperDrafts:x=>x?.id,
  studyHistory:x=>`${x?.at||''}|${x?.mode||''}|${x?.score??''}|${(x?.questionIds||[]).join(',')}`
 };
 Object.entries(arrayKeys).forEach(([key,keyFn])=>{const incoming=safeJsonParse(data[key]||'[]',[]);if(!Array.isArray(incoming)||!incoming.length)return;const current=safeJsonParse(localStorage.getItem(key)||'[]',[]);localStorage.setItem(key,JSON.stringify(uniqueMerge(current,incoming,keyFn).slice(key==='studyHistory'||key==='examStudyLogs'?-300:0)));});
 if(!localStorage.getItem('lastQuizSelection')&&data.lastQuizSelection)localStorage.setItem('lastQuizSelection',data.lastQuizSelection);
 const curDate=localStorage.getItem('lastStudyDate')||'';const inDate=data.lastStudyDate||'';if(inDate>curDate){localStorage.setItem('lastStudyDate',inDate);if(data.streakDays)localStorage.setItem('streakDays',data.streakDays)}
}
function replaceBackupData(data){BACKUP_KEYS.forEach(k=>localStorage.removeItem(k));BACKUP_KEYS.forEach(k=>{if(typeof data[k]==='string')localStorage.setItem(k,data[k])});}
function refreshAfterBackup(){refreshQuestionBank();renderQuiz();fillImportSubjects();fillManageSubjects();renderExamPlanList();renderDailyPlanPreview();document.getElementById('streakDays').textContent=localStorage.getItem('streakDays')||0;}
document.getElementById('exportBackup')?.addEventListener('click',downloadBackup);
document.getElementById('backupFile')?.addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('バックアップファイルが大きすぎます（上限5MB）。');const text=await file.text();const obj=validateBackup(JSON.parse(text));pendingBackupData=obj;renderBackupPreview(obj);document.getElementById('importBackupStatus').textContent='内容を確認して、追加または置き換えを選んでください。';}catch(err){pendingBackupData=null;document.getElementById('backupPreview').hidden=true;document.getElementById('backupImportActions').hidden=true;document.getElementById('importBackupStatus').textContent=`読み込めませんでした：${err.message}`;}
});
document.getElementById('mergeBackup')?.addEventListener('click',()=>{if(!pendingBackupData)return;mergeBackupData(pendingBackupData.data);refreshAfterBackup();document.getElementById('importBackupStatus').textContent='現在のデータにバックアップを追加しました。';});
document.getElementById('replaceBackup')?.addEventListener('click',()=>{if(!pendingBackupData)return;if(!confirm('この端末に現在保存されている学習データを、選択したバックアップの内容で置き換えます。続けますか？'))return;replaceBackupData(pendingBackupData.data);refreshAfterBackup();document.getElementById('importBackupStatus').textContent='バックアップの内容でこの端末のデータを置き換えました。';});
