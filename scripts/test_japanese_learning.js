const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
function functionSource(name){const start=app.indexOf(`function ${name}(`);assert(start>=0,name);let end=app.indexOf('\nfunction ',start+1);if(end<0)end=app.length;return app.slice(start,end).split('\ndocument.')[0];}
const storage=new Map(),state={questionBank:[],answers:[],index:0,session:[]};
const ctx={state,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},studyHistory:()=>ctx.history||[],pickQuestionsForMaterials:(pool,count)=>pool.slice(0,count),availableQuestions:()=>ctx.pool||[]};
for(const name of ['questionMaterialIds','questionMatchesMaterials','validJapaneseLearningPrefs','loadJapaneseLearningPrefs','setJapaneseHardStart','japaneseCorrectStreaks','japaneseDifficultyTarget','adaptRemainingJapaneseQuiz'])vm.runInNewContext(functionSource(name),ctx);
assert.equal(ctx.loadJapaneseLearningPrefs().hardStart,false);
for(const value of ['{bad','null','[]','{"hardStart":"true"}','{"hardStart":1}']){storage.set('japaneseLearningPrefs',value);assert.equal(ctx.loadJapaneseLearningPrefs().hardStart,false,value);}
ctx.setJapaneseHardStart(true);assert.equal(ctx.loadJapaneseLearningPrefs().hardStart,true);
assert.equal(ctx.japaneseDifficultyTarget(null,0,false),1);
assert.equal(ctx.japaneseDifficultyTarget(null,0,true),2);
assert.equal(ctx.japaneseDifficultyTarget(null,3,true),3);
assert.equal(ctx.japaneseDifficultyTarget(null,3,false),2);
assert.equal(ctx.japaneseDifficultyTarget(null,6,false),3);
assert.equal(ctx.japaneseDifficultyTarget(0.2,0,true),1,'weak units return to basics');
ctx.questionAttemptStats=()=>new Map();ctx.unitAccuracyMap=()=>new Map();ctx.loadRecallRecords=()=>({});ctx.RecallLadder={priorityBonus:()=>0};
vm.runInNewContext(functionSource('questionDifficulty'),ctx);vm.runInNewContext(functionSource('smartQuestionOrder'),ctx);
const fresh=[1,2,3].map(d=>({id:'fresh-'+d,subject:'japanese',unit:'fresh',difficulty:d}));
assert.equal(ctx.smartQuestionOrder(fresh)[0].difficulty,2,'hard-start actually prioritizes standard problems');
const japanese={id:'ja',subject:'japanese',unit:'grammar',materialIds:['book-a']};
const english={...japanese,subject:'english'};
assert(ctx.questionMatchesMaterials(japanese,[]),'all Japanese materials accessible without selection');
assert(!ctx.questionMatchesMaterials(english,[]),'English selection unchanged');
assert(ctx.questionMatchesMaterials(japanese,['book-a']));
assert(!ctx.questionMatchesMaterials(japanese,['book-b']),'selected material filter preserved');
state.questionBank=[japanese,{...japanese,id:'ja2'},{id:'en',subject:'english',unit:'grammar'}];
const good={questionId:'ja',correct:true,assist:'choice'};
state.answers=[good,good,good];assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),3,'ordinary choice answers count');
for(const bad of [{correct:false},{correct:true,dontKnow:true},{correct:true,assist:'hint'},{correct:true,selfJudged:true},{correct:true,assist:'choice',recallMode:true}]){
 state.answers=[good,good,{...good,...bad},good];assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),1,'assisted/incorrect resets streak');
}
ctx.history=[{answerResults:[{...good,answeredAt:'2026-11-09T00:00:00Z'}]}];state.answers=[{...good,answeredAt:'2026-11-09T00:00:00Z'}];
assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),1,'persisted current answers are not counted twice');
state.answers=[];
ctx.history=[
 {at:'2026-11-09T12:00:00+09:00',answerResults:[{...good,correct:false}]},
 {at:'2026-11-06T12:00:00+09:00',answerResults:[good]},
 {at:'2026-11-07T12:00:00+09:00',answerResults:[good]},
 {at:'2026-11-08T12:00:00+09:00',answerResults:[good]},
];
assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),0,'reverse-order backup history uses actual dates, not appended array order');
ctx.history[0].answerResults[0].answeredAt='2026-11-05T12:00:00+09:00';
assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),3,'per-answer timestamp takes precedence over history timestamp');
ctx.history=[{at:'invalid',answerResults:[good,{...good,correct:false},good]}];
assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),1,'undated legacy entries retain stable order');
ctx.history=[];state.questionBank=fresh;state.answers=Array.from({length:3},()=>({questionId:'fresh-2',correct:true,assist:'choice'}));
assert.equal(ctx.smartQuestionOrder(fresh)[0].difficulty,3,'three correct answers actually prioritize harder problems');
state.subject='japanese';state.sessionContext={mode:'quiz'};state.session=[japanese,{id:'old'},{id:'old2'}];state.index=0;ctx.pool=[japanese,{id:'new-standard'},{id:'new-hard'}];
ctx.adaptRemainingJapaneseQuiz();assert.deepEqual(state.session.map(q=>q.id),['ja','new-standard','new-hard'],'remaining quiz can select higher difficulty from full pool');
state.sessionContext={mode:'review'};const before=state.session.slice();ctx.pool=[];ctx.adaptRemainingJapaneseQuiz();assert.deepEqual(state.session,before,'review session preserved');
assert(app.match(/const BACKUP_KEYS=\[[\s\S]*?'japaneseLearningPrefs'/),'preference included in backup');
const merge=app.slice(app.indexOf('function mergeBackupData('),app.indexOf('function replaceBackupData('));
assert(merge.includes('validJapaneseLearningPrefs')&&merge.includes('data.japaneseLearningPrefs'),'validated preference merge');
vm.runInNewContext(functionSource('safeJsonParse'),ctx);vm.runInNewContext(functionSource('mergeBackupData'),ctx);
vm.runInNewContext(functionSource('uniqueMerge'),ctx);
storage.set('studyHistory',JSON.stringify([{at:'2026-11-09T12:00:00+09:00',answerResults:[{...good,correct:false}]}]));
ctx.mergeBackupData({studyHistory:JSON.stringify([6,7,8].map(day=>({at:`2026-11-0${day}T12:00:00+09:00`,answerResults:[good]})))});
ctx.history=JSON.parse(storage.get('studyHistory'));state.questionBank=[japanese];state.answers=[];
assert.equal(ctx.history.length,4,'older histories really merged after current history');
assert.equal(ctx.japaneseCorrectStreaks().get('japanese/grammar'),0,'real reverse-date backup merge cannot create a false promotion');
storage.set('japaneseLearningPrefs','{broken');ctx.mergeBackupData({japaneseLearningPrefs:'{"hardStart":true}'});assert.equal(ctx.loadJapaneseLearningPrefs().hardStart,true,'merge repairs corrupt preference with validated incoming value');
ctx.mergeBackupData({japaneseLearningPrefs:'{"hardStart":false}'});assert.equal(ctx.loadJapaneseLearningPrefs().hardStart,true,'merge preserves current valid preference');
storage.delete('japaneseLearningPrefs');ctx.mergeBackupData({japaneseLearningPrefs:'{"hardStart":"true"}'});assert.equal(storage.has('japaneseLearningPrefs'),false,'merge ignores invalid shape');
const data=JSON.parse(fs.readFileSync('data/questions.json','utf8'));assert.equal(data.questions.find(q=>q.id==='v04_012').difficulty,1);
console.log('PASS Japanese difficulty, adaptive session, material access, corrupt preference, and backup regression checks');
