const fs=require('fs');
const path=require('path');
const ExamScope=require(path.join('..','exam-scope.js'));
function assert(cond,msg){if(!cond)throw new Error(msg);}
const plan={grade:3,units:['japanese/expression/writing','social/civics/modern-society']};
const scopes=ExamScope.scopesFromPlan(plan);
assert(scopes.has('japanese/writing'),'Japanese writing scope missing');
assert(!scopes.has('english/writing'),'English writing must not be included');
assert(ExamScope.questionMatchesScopes({subject:'japanese',unit:'writing'},scopes),'Japanese writing should match');
assert(!ExamScope.questionMatchesScopes({subject:'english',unit:'writing'},scopes),'English writing must not match Japanese writing');
assert(ExamScope.questionMatchesScopes({subject:'social',unit:'modern-society'},scopes),'Social scope should match');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
assert(app.includes('ExamScope.scopesFromPlan(plan)'),'app.js must use shared ExamScope.scopesFromPlan');
assert(app.includes('ExamScope.questionMatchesScopes(q,ids)'),'app.js must use shared ExamScope.questionMatchesScopes');
console.log('exam scope tests: 5/5 PASS');
