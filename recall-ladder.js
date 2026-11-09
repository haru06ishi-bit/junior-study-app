// 想起練習（思い出す練習）の判定・ヒント・復習スケジュール。
// ブラウザ（window.RecallLadder）と Node（require）の両方から使える純粋関数のみ。
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.RecallLadder=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const RECALL_SUBJECTS=['social','science'];
  const DEFAULT_PREFS={social:true,science:false};
  // 選択肢を見ないと答えが一つに決まらない、または語句で答えられない問い方。
  const SELECTION_PATTERN=/次の|どれ|選|正し|誤|適切|あてはま|当てはま|ふさわし|組み合わせ|記号|ア〜|ア～|説明|理由|どのよう|どう|なぜ|特徴|順|グラフ|表|図|資料|地図|写真|文章|下線|含まれ|一つ|ひとつ|例|いくつ|すべて|全て|以外|不適|共通/;
  const ANSWER_PUNCT=/[。、・,，／/（）()「」『』\s〜～]/;
  const MAX_ANSWER_CHARS=10;
  // 独立監査で「選択肢なしでは正解が一つに決まらない」と確認した問題（自力入力の対象外）。
  const NON_UNIQUE_IDS=new Set(['v04_025','v042_social_kyoikushuppan_g2_contemporary_06','v04_042','v041_social_kyoikushuppan_g2_earlymodern_05']);
  // 書き方の違いとして許容する語尾（「愛知」と「愛知県」、「60」と「60度」など）。
  const OPTIONAL_SUFFIX=/(県|府|都|道|度|年|天皇|時代|世紀|%|％)$/;
  const DAY=86400000;
  const INTERVAL_DAYS=[1,3,7,14,30];
  const IMPROVED_STAGE=2; // 別の日に2回、自力で正解 → 苦手リストから外す
  const MASTERED_STAGE=3; // 間隔を空けて3回、自力で正解 → 定着
  const ASSISTS=['free','hint','choice','none'];

  function normalize(v){return String(v??'').normalize('NFKC').trim().replace(/\s+/g,'').toLowerCase();}
  function chars(v){return Array.from(String(v??''));}
  function correctChoiceText(q){return Array.isArray(q?.choices)?String(q.choices[q.answer]??''):'';}
  function isRecallSubject(subject){return RECALL_SUBJECTS.includes(subject);}
  function isRecallableChoice(q){
    if(!q||q.type!=='choice'||!isRecallSubject(q.subject))return false;
    if(q.passage||q.table||q.figure||q.stimulusTitle)return false;
    const a=correctChoiceText(q);const n=chars(a).length;
    if(!n||n>MAX_ANSWER_CHARS||ANSWER_PUNCT.test(a))return false;
    if(NON_UNIQUE_IDS.has(q.id))return false;
    // 文や句（「上がりやすい」「短時間の強い雨」など）は語句として思い出す問題ではない。
    if(/[ぁ-ん]$/.test(a)||(n>=6&&/[のをがにへで]/.test(a)))return false;
    if(SELECTION_PATTERN.test(String(q.question||'')))return false;
    // 選択肢どうしが同じ正規化結果になると自力入力の判定が一意にならない。
    const norm=q.choices.map(normalize);if(new Set(norm).size!==norm.length)return false;
    return true;
  }
  function blanksOf(q){return(q?.blanks||[]).map(b=>(Array.isArray(b)?b:[b]).filter(Boolean).map(String));}
  function supportsRecallMode(q){
    if(!q||!isRecallSubject(q.subject))return false;
    if(q.type==='choice')return isRecallableChoice(q);
    if(q.type==='word')return(q.answers||[]).filter(Boolean).length>0;
    if(q.type==='fill')return blanksOf(q).length>0&&blanksOf(q).every(b=>b.length>0);
    return false;
  }
  // もともと語句を書かせる形式（選択肢がない）。
  function isProductionType(q){return['word','fill','text'].includes(q?.type);}
  function primaryAnswers(q){
    if(q?.type==='choice')return[correctChoiceText(q)];
    if(q?.type==='word')return[String((q.answers||[]).filter(Boolean)[0]||'')];
    if(q?.type==='fill')return blanksOf(q).map(b=>b[0]);
    return[];
  }
  function acceptedFor(q){
    if(q?.type==='choice')return[[correctChoiceText(q)]];
    if(q?.type==='word')return[(q.answers||[]).filter(Boolean).map(String)];
    if(q?.type==='fill')return blanksOf(q);
    return[];
  }
  // 段階ヒント：1段目＝文字数、2段目＝最初の文字（3文字以上の答えのみ。短い答えは答えそのものになるため出さない）。
  function hintSteps(q){
    const ans=primaryAnswers(q).filter(a=>a!=='');if(!ans.length)return[];
    const multi=ans.length>1;const label=i=>multi?`（${i+1}）`:'';
    const steps=[ans.map((a,i)=>`${label(i)}${chars(a).length}文字`).join('　')+(multi?'':'の語句です')];
    const firstOk=a=>chars(a).length>=3&&!/^[0-9０-９A-Za-zＡ-Ｚａ-ｚ]/.test(a);
    if(ans.some(firstOk)){
      steps.push(ans.map((a,i)=>firstOk(a)?`${label(i)}最初の文字は「${chars(a)[0]}」`:`${label(i)}（このヒントはありません）`).join('　'));
    }
    return steps;
  }
  function matchesRecall(q,values){
    const vals=Array.isArray(values)?values:[values];const acc=acceptedFor(q);
    if(!acc.length||vals.length!==acc.length)return false;
    return acc.every((list,i)=>list.some(a=>variantsOf(a).has(normalize(vals[i]))));
  }
  // 正解として受け付ける表記：語尾の有無、「AとB」の順序違い。
  function variantsOf(answer){
    const base=normalize(answer);const out=new Set();if(!base)return out;
    const add=v=>{if(v){out.add(v);const stripped=v.replace(OPTIONAL_SUFFIX,'');if(stripped&&stripped!==v)out.add(stripped);}};
    add(base);
    const parts=base.split('と');if(parts.length===2&&parts[0]&&parts[1])add(parts[1]+'と'+parts[0]);
    return out;
  }
  function assistFor({correct,dontKnow,hintsUsed=0,choicesShown=false}){
    if(dontKnow||!correct)return'none';
    if(choicesShown)return'choice';
    return hintsUsed>0?'hint':'free';
  }
  // 「自力で思い出せた」とみなす正解か。選択肢しか出せない問題では通常の正解を使う。
  function isSolid({correct,assist,recallCapable}){
    if(!correct)return false;
    return recallCapable?assist==='free':true;
  }
  // 「別の日」は利用者の端末の暦日で判定する（日本では0時で切り替わる）。
  function dayKey(now){const d=new Date(now);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function emptyRecord(){return{stage:0,due:0,attempts:0,solid:0,lastAt:null,lastAssist:null,lastCorrect:null,lastSolidDay:null};}
  function updateRecord(prev,{correct,assist,recallCapable},now=Date.now()){
    const r={...emptyRecord(),...(prev&&typeof prev==='object'?prev:{})};
    r.attempts=(Number(r.attempts)||0)+1;r.lastAt=new Date(now).toISOString();r.lastAssist=ASSISTS.includes(assist)?assist:'none';r.lastCorrect=!!correct;
    let stage=Math.max(0,Math.min(INTERVAL_DAYS.length,Number(r.stage)||0));const due=Number(r.due)||0;
    if(isSolid({correct,assist,recallCapable})){
      r.solid=(Number(r.solid)||0)+1;const today=dayKey(now);
      // 同じ日に何度正解しても1段階まで。前回の予定日（12時間の余裕つき）より前なら段階は上げない。
      if(stage===0||(r.lastSolidDay!==today&&now>=due-DAY/2))stage=Math.min(INTERVAL_DAYS.length,stage+1);
      r.lastSolidDay=today;r.stage=stage;r.due=now+INTERVAL_DAYS[Math.max(0,stage-1)]*DAY;
    }else if(correct){
      r.stage=Math.max(0,stage-1);r.due=now+DAY;
    }else{
      r.stage=0;r.due=now;
    }
    return r;
  }
  function isDue(r,now=Date.now()){return!!r&&Number(r.due)<=now;}
  function isImproved(r){return!!r&&Number(r.stage)>=IMPROVED_STAGE;}
  function isMastered(r){return!!r&&Number(r.stage)>=MASTERED_STAGE;}
  function shouldRetryInSession({correct,assist}){return!(correct&&assist==='free');}
  // 破損した保存データから使える記録だけを取り出す。
  function sanitizeRecords(obj){
    const out={};if(!obj||typeof obj!=='object'||Array.isArray(obj))return out;
    for(const[id,r]of Object.entries(obj)){
      if(!id||!r||typeof r!=='object'||Array.isArray(r))continue;
      const stage=Number(r.stage);if(!Number.isFinite(stage))continue;
      out[id]={...emptyRecord(),...r,stage:Math.max(0,Math.min(INTERVAL_DAYS.length,Math.floor(stage))),due:Number(r.due)||0};
    }
    return out;
  }
  function mergeRecords(a,b){
    const x=sanitizeRecords(a),y=sanitizeRecords(b),out={...x};
    for(const[id,r]of Object.entries(y)){const cur=out[id];if(!cur||String(r.lastAt||'')>String(cur.lastAt||''))out[id]=r;}
    return out;
  }
  function priorityBonus(r,now=Date.now()){
    if(!r)return 0;
    if(!isMastered(r)&&isDue(r,now))return 45;
    if(isMastered(r)&&!isDue(r,now))return-15;
    return 0;
  }
  function defaultPref(subject,prefs){
    if(prefs&&typeof prefs==='object'&&typeof prefs[subject]==='boolean')return prefs[subject];
    return!!DEFAULT_PREFS[subject];
  }
  return{RECALL_SUBJECTS,variantsOf,dayKey,INTERVAL_DAYS,IMPROVED_STAGE,MASTERED_STAGE,normalize,correctChoiceText,isRecallSubject,isRecallableChoice,supportsRecallMode,isProductionType,primaryAnswers,hintSteps,matchesRecall,assistFor,isSolid,updateRecord,isDue,isImproved,isMastered,shouldRetryInSession,sanitizeRecords,mergeRecords,priorityBonus,defaultPref};
});
