// 端末内の学習データ（localStorage）を安全に読み書きするための検証・正規化。
// - 壊れた値や型の違う値でもアプリが止まらないよう、キーごとに既定値と正規化を持つ。
// - 正常な項目は消さない。不正な要素だけを除き、知らない項目はそのまま残す。
// - バックアップ取り込み時の検証、履歴の日時順マージもここで行う。
// ブラウザ（window.StorageGuard）と Node（require）の両方から使える。
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.StorageGuard=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const QUESTION_TYPES=['choice','multi','reorder','fill','word','text'];
  const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
  const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const str=(v,max=5000)=>typeof v==='string'?v.slice(0,max):(typeof v==='number'&&Number.isFinite(v)?String(v):'');
  const num=(v,def=0)=>{const n=Number(v);return Number.isFinite(n)?n:def;};
  const int=(v,def=0,min=-Infinity,max=Infinity)=>{const n=Math.trunc(Number(v));return Number.isFinite(n)?Math.min(max,Math.max(min,n)):def;};
  const strArr=(v,max=2000)=>Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,max):[];
  const intArr=(v)=>Array.isArray(v)?v.map(Number).filter(Number.isInteger):[];
  const grade=(v,def=null)=>{const n=Number(v);return[1,2,3].includes(n)?n:def;};
  const isoish=v=>typeof v==='string'&&!Number.isNaN(Date.parse(v))?v:null;
  // 既知フィールドの型だけを直し、それ以外の項目は残す（新旧バージョン間の互換性のため）。
  function keepPrimitiveExtras(src,out){for(const[k,v]of Object.entries(src)){if(k==='__proto__'||k==='constructor'||k==='prototype')continue;if(!(k in out))out[k]=v;}return out;}
  const ITEM={
    missedQuestions(x){if(!isObj(x)||typeof x.questionId!=='string'||!x.questionId)return null;return keepPrimitiveExtras(x,{questionId:x.questionId,count:int(x.count,1,1,100000),lastAt:isoish(x.lastAt),dontKnow:!!x.dontKnow});},
    studyHistory(x){if(!isObj(x)||!isoish(x.at))return null;
      const answers=Array.isArray(x.answerResults)?x.answerResults.filter(a=>isObj(a)&&typeof a.questionId==='string').map(a=>keepPrimitiveExtras(a,{questionId:a.questionId,correct:!!a.correct,dontKnow:!!a.dontKnow,answeredAt:isoish(a.answeredAt)})):undefined;
      const out={at:x.at,grade:grade(x.grade,null),subject:typeof x.subject==='string'?x.subject:null,total:int(x.total,0,0,100000),score:num(x.score,0),rate:num(x.rate,0),mode:str(x.mode,40)||'quiz',examId:typeof x.examId==='string'?x.examId:null,questionIds:strArr(x.questionIds)};
      if(answers)out.answerResults=answers;
      if(Array.isArray(x.retryResults))out.retryResults=x.retryResults.filter(a=>isObj(a)&&typeof a.questionId==='string');
      if(x.materials!==undefined)out.materials=strArr(x.materials);
      return keepPrimitiveExtras(x,out);},
    examStudyLogs(x){if(!isObj(x))return null;return keepPrimitiveExtras(x,{id:str(x.id,200),examId:str(x.examId,200),at:isoish(x.at),questionIds:strArr(x.questionIds),score:num(x.score,0),total:int(x.total,0,0,100000),rate:num(x.rate,0)});},
    // 定期テスト計画は、既存の loadExamPlans と同じ基準で不正な計画を除外する（補正して有効にはしない）。
    examPlans(x){if(!isObj(x)||![1,2,3].includes(Number(x.grade)))return null;
      if(x.date!=null&&typeof x.date!=='string')return null;
      if(!Array.isArray(x.units)||!x.units.every(k=>typeof k==='string'&&k.split('/').length===3&&k.split('/').every(part=>part.trim().length>0)))return null;
      if(x.materials!=null&&!(Array.isArray(x.materials)&&x.materials.every(id=>typeof id==='string'&&id.trim().length>0)))return null;
      const out={grade:Number(x.grade)};if(x.name!==undefined)out.name=str(x.name,200);return keepPrimitiveExtras(x,out);},
    mockExamResults(x){if(!isObj(x)||typeof x.id!=='string'||!x.id)return null;
      const answers=Array.isArray(x.answers)?x.answers.filter(isObj).map(a=>keepPrimitiveExtras(a,{questionId:str(a.questionId,200),correct:!!a.correct,answer:str(a.answer,2000)})):[];
      return keepPrimitiveExtras(x,{id:x.id,examId:str(x.examId,200),examName:str(x.examName,200),at:isoish(x.at),grade:grade(x.grade,null),score:num(x.score,0),totalPoints:num(x.totalPoints,100),correct:int(x.correct,0,0,100000),total:int(x.total,0,0,100000),rate:num(x.rate,0),minutes:num(x.minutes,0),timeUp:!!x.timeUp,questionIds:strArr(x.questionIds),answers,retryOf:typeof x.retryOf==='string'?x.retryOf:null});},
    customQuestions(x){if(!isObj(x)||typeof x.id!=='string'||!x.id||typeof x.question!=='string')return null;
      const type=QUESTION_TYPES.includes(x.type)?x.type:null;if(!type)return null;
      const grades=Array.isArray(x.grades)?x.grades.map(Number).filter(g=>[1,2,3].includes(g)):[];
      const out={id:x.id,subject:str(x.subject,40),unit:str(x.unit,80),grades:grades.length?grades:[1],type,question:str(x.question,4000),explanation:str(x.explanation,4000),difficulty:int(x.difficulty,1,1,3)};
      if(x.choices!==undefined)out.choices=strArr(x.choices,20).map(c=>c.slice(0,1000));
      if(x.answer!==undefined)out.answer=int(x.answer,0,0,19);
      if(x.answers!==undefined)out.answers=type==='multi'?intArr(x.answers):strArr(x.answers,50);
      if(x.blanks!==undefined)out.blanks=Array.isArray(x.blanks)?x.blanks.map(b=>Array.isArray(b)?strArr(b,50):str(b,500)).slice(0,20):[];
      if(x.items!==undefined)out.items=strArr(x.items,50);
      if(x.answerOrder!==undefined)out.answerOrder=intArr(x.answerOrder);
      if(x.modelAnswer!==undefined)out.modelAnswer=str(x.modelAnswer,4000);
      if(x.materialIds!==undefined)out.materialIds=strArr(x.materialIds,50);
      return keepPrimitiveExtras(x,out);},
    paperDrafts(x){return isObj(x)?keepPrimitiveExtras(x,{id:str(x.id,200)}):null;},
    textbookStudyRanges(x){return isObj(x)?keepPrimitiveExtras(x,{}):null;}
  };
  const OBJECT_KEYS=['schoolTextbookPreference','recallPracticePrefs','recallRecords','lastQuizSelection','japaneseTextbookPreference'];
  const NULLABLE_OBJECT_KEYS=['japaneseLearningPrefs'];
  const SCALAR={
    streakDays:v=>{const n=int(v,0,0,100000);return String(n);},
    lastStudyDate:v=>typeof v==='string'&&DATE_RE.test(v)?v:''
  };
  function kindOf(key){if(ITEM[key])return'array';if(OBJECT_KEYS.includes(key))return'object';if(NULLABLE_OBJECT_KEYS.includes(key))return'nullableObject';if(SCALAR[key])return'scalar';return'unknown';}
  function defaultFor(key){const k=kindOf(key);return k==='array'?[]:k==='object'?{}:k==='nullableObject'?null:k==='scalar'?SCALAR[key](null):null;}
  // 文字列 raw を検証する。{value, status:'empty'|'ok'|'repaired'|'corrupt', dropped}
  function inspectRaw(key,raw){
    const kind=kindOf(key);
    if(raw==null||raw==='')return{value:defaultFor(key),status:'empty',dropped:0};
    if(kind==='scalar'){const v=SCALAR[key](raw);return{value:v,status:String(v)===String(raw)?'ok':(v===''&&raw!==''?'corrupt':'repaired'),dropped:0};}
    if(kind==='unknown')return{value:raw,status:'ok',dropped:0};
    let parsed;try{parsed=JSON.parse(raw);}catch{return{value:defaultFor(key),status:'corrupt',dropped:0};}
    if(kind==='array'){
      if(!Array.isArray(parsed))return{value:[],status:'corrupt',dropped:0};
      const out=[];let dropped=0;for(const x of parsed){const y=ITEM[key](x);if(y)out.push(y);else dropped++;}
      return{value:out,status:dropped?'repaired':'ok',dropped};
    }
    if(kind==='nullableObject'&&parsed===null)return{value:null,status:'ok',dropped:0};
    if(!isObj(parsed))return{value:defaultFor(key),status:'corrupt',dropped:0};
    const clean={};for(const[k,v]of Object.entries(parsed)){if(k==='__proto__'||k==='constructor'||k==='prototype')continue;clean[k]=v;}
    return{value:clean,status:'ok',dropped:0};
  }
  function safeGet(storage,key){try{return storage.getItem(key);}catch{return null;}}
  function read(storage,key){return inspectRaw(key,safeGet(storage,key)).value;}
  function audit(storage,keys){
    const issues=[];
    for(const key of keys){const raw=safeGet(storage,key);const r=inspectRaw(key,raw);if(r.status==='corrupt'||r.status==='repaired')issues.push({key,status:r.status,dropped:r.dropped,raw,value:r.value});}
    return issues;
  }
  function serialize(key,value){const kind=kindOf(key);if(kind==='scalar')return String(value??'');if(typeof value==='string'&&kind==='unknown')return value;return JSON.stringify(value);}
  // バックアップの data（キー→文字列）を検証。壊れたキーは取り込まない。
  function validateBackupData(data,allowedKeys){
    const clean={},issues=[];
    if(!isObj(data))return{clean,issues:[{key:'data',status:'corrupt',dropped:0}]};
    for(const key of allowedKeys){
      if(!(key in data))continue;
      const raw=data[key];
      if(typeof raw!=='string'){issues.push({key,status:'corrupt',dropped:0});continue;}
      const r=inspectRaw(key,raw);
      if(r.status==='corrupt'){issues.push({key,status:'corrupt',dropped:0});continue;}
      if(r.status==='repaired')issues.push({key,status:'repaired',dropped:r.dropped});
      if(r.status!=='empty')clean[key]=serialize(key,r.value);
    }
    return{clean,issues};
  }
  // 現在＋取り込みを重複除去し、日時（at）の古い順に並べてから新しい limit 件を残す。
  function mergeByTime(current,incoming,keyFn,limit){
    const map=new Map();
    for(const item of[...(current||[]),...(incoming||[])]){const k=keyFn(item);const kk=k==null?`anon-${map.size}`:k;if(!map.has(kk))map.set(kk,item);}
    const items=[...map.values()].map((x,i)=>({x,i,t:Date.parse(x?.at||'')||0})).sort((a,b)=>a.t-b.t||a.i-b.i).map(o=>o.x);
    return limit?items.slice(-limit):items;
  }
  const GUARDED_KEYS=[...Object.keys(ITEM),...OBJECT_KEYS,...NULLABLE_OBJECT_KEYS,...Object.keys(SCALAR)];
  return{GUARDED_KEYS,QUESTION_TYPES,kindOf,defaultFor,inspectRaw,read,audit,serialize,validateBackupData,mergeByTime,safeGet};
});
