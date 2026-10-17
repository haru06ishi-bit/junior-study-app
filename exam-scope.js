(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.ExamScope=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function scopeFromPlanKey(key){
    const parts=String(key||'').split('/');
    if(parts.length<3||!parts[0]||!parts[2])return null;
    return `${parts[0]}/${parts[2]}`;
  }
  function scopesFromPlan(plan){
    return new Set((plan?.units||[]).map(scopeFromPlanKey).filter(Boolean));
  }
  function questionScope(q){return q?.subject&&q?.unit?`${q.subject}/${q.unit}`:null;}
  function questionMatchesScopes(q,scopes){
    const key=questionScope(q);
    return Boolean(key&&scopes?.has(key));
  }
  return {scopeFromPlanKey,scopesFromPlan,questionScope,questionMatchesScopes};
});
