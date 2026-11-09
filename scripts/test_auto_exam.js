const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ExamScope=require('../exam-scope.js');
const app=fs.readFileSync('app.js','utf8');
function source(name){const i=app.indexOf(`function ${name}(`);assert(i>=0,name);let j=app.indexOf('\nfunction ',i+1);if(j<0)j=app.length;return app.slice(i,j).split('\ndocument.')[0];}
const subjects=['english','japanese','social'].map(id=>({id,name:id,fields:[{id:'f',units:[{id:'shared',grades:[1,2,3]}]}]}));
const state={curriculum:{subjects},questionBank:[
 {id:'en-base',subject:'english',unit:'shared',grades:[1,2,3],difficulty:1},
 {id:'en-hard',subject:'english',unit:'shared',grades:[1,2,3],difficulty:3},
 {id:'en-material',subject:'english',unit:'shared',grades:[1,2,3],difficulty:2,materialIds:['book']},
 {id:'ja',subject:'japanese',unit:'shared',grades:[1,2,3],difficulty:1,materialIds:['other-book']},
]};
let uid=0;const store=new Map();const ctx={state,ExamScope,crypto:{randomUUID:()=>`auto-${++uid}`},matchesSelectedTextbook:()=>true,smartQuestionOrder:pool=>pool,localStorage:{getItem:k=>store.get(k)||null}};
for(const name of ['unitKey','questionMaterialIds','questionMatchesMaterials','materialPriorityOrder','questionDifficulty','dateOnlyLocal','examUnitIds','examQuestionPool','autoExamPurpose','buildAutoExamPlan','buildExamSession','loadExamPlans'])vm.runInNewContext(source(name),ctx);
const now=new Date(2026,10,9,12);
for(const [purpose,day] of [['basics',16],['review',23],['mock',12]]){
 const plan=ctx.buildAutoExamPlan(2,'english',purpose,now);
 assert.equal(plan.date,`2026-11-${day}`);assert.equal(plan.auto,true);assert.equal(plan.dateIsTarget,true);
 assert.equal(plan.grade,2);assert.equal(plan.purpose,purpose);assert.equal(plan.materials.length,0);
 assert.deepEqual(Array.from(plan.units),['english/f/shared']);
 const pool=ctx.examQuestionPool(plan);assert.deepEqual(Array.from(pool,q=>q.id),['en-base','en-hard'],'English common questions remain usable without chosen material and no same-name Japanese unit leaks');
 assert(ctx.buildExamSession(plan,20).every(q=>q.subject==='english'));
 if(purpose==='basics')assert.equal(ctx.buildExamSession(plan,1)[0].difficulty,1);
 assert.deepEqual(JSON.parse(JSON.stringify(plan)),JSON.parse(JSON.stringify({...plan})),'plan remains plain backup-compatible JSON');
}
assert.throws(()=>ctx.buildAutoExamPlan(2,'social','review',now),/出題できる問題/);
for(const args of [[0,'english','review'],[2,'unknown','review'],[2,'english','unknown'],[2,'english','__proto__']])assert.throws(()=>ctx.buildAutoExamPlan(...args,now));
assert.equal(ctx.examQuestionPool({grade:2,units:['english/f/shared'],materials:['book']}).length,3,'manual selected-material behavior preserved');
assert.equal(ctx.examQuestionPool({grade:2,units:['japanese/f/shared'],materials:['book']}).length,0,'manual nonmatching material excluded');
for(const corrupt of ['null','{}','[null,1]','{broken']){store.set('examPlans',corrupt);assert.equal(ctx.loadExamPlans().length,0,'corrupt plan data: '+corrupt);}
store.set('examPlans',JSON.stringify([{id:'old',grade:2,units:['english/f/shared']} ]));assert.equal(ctx.loadExamPlans().length,1,'legacy plans retained');
// Real bank smoke check: each school grade has usable English/Japanese auto plans.
state.questionBank=JSON.parse(fs.readFileSync('data/questions.json','utf8')).questions;
state.curriculum=JSON.parse(fs.readFileSync('data/curriculum.json','utf8'));
for(const grade of [1,2,3])for(const subject of ['english','japanese']){
 const plan=ctx.buildAutoExamPlan(grade,subject,'review',now),pool=ctx.examQuestionPool(plan);
 assert(pool.length>0);assert(pool.every(q=>q.subject===subject&&q.grades.includes(grade)));
}
const elements={unitSearch:{value:'old search'}};ctx.document={getElementById:id=>elements[id]};ctx.renderQuiz=()=>{};
vm.runInNewContext(source('selectWholeGradeRange'),ctx);state.grade=2;state.subject='english';state.quizMaterials=new Set(['book']);ctx.selectWholeGradeRange();
assert(state.units.size>0);assert(Array.from(state.units).every(k=>k.startsWith('english/')));assert.equal(state.quizMaterials.size,0);assert.equal(elements.unitSearch.value,'');
assert.equal(state.units.size,state.curriculum.subjects.find(s=>s.id==='english').fields.flatMap(f=>f.units.filter(u=>u.grades.includes(2))).length);
console.log('PASS auto exam purposes, dates, scopes, empty/corrupt data, existing materials, real bank, and whole-grade quiz');
