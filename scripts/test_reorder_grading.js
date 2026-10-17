const fs = require('fs');
const path = require('path');
const {isCorrectReorder} = require('../reorder-grading.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/questions.json'),'utf8'));
const by = new Map(data.questions.map(q => [q.id,q]));
const cases = [
  ['v031_hw3_u6_reorder_01',[0,1,6,3,4,5,2,7,8]],
  ['v030_en_reorder_03',[0,5,2,3,4,1,6,7,8,9,10]],
  ['v031_hw3_u7_reorder_01',[0,6,2,3,4,5,1,7,8,9,10]],
  ['v031_hw3_u7_reorder_02',[2,1,0,3,4,5,6]],
];
let failed = 0;
for (const [id,order] of cases){
  const q=by.get(id); if(!q){console.error('missing',id);failed++;continue;}
  const ok=isCorrectReorder(q,order); console.log(id,ok?'PASS':'FAIL'); if(!ok)failed++;
}
// A deliberately wrong order must not be accepted.
const probe=by.get('v031_hw3_u6_reorder_01');
if(probe && isCorrectReorder(probe,[...cases[0][1]].reverse())){console.error('wrong order accepted');failed++;}
process.exit(failed?1:0);