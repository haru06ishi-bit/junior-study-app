(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.ReorderGrading=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function reorderTokenTexts(q,order){
    const items=q?.items||[];
    return (order||[]).map(i=>String(items[Number(i)]??'').normalize('NFKC').trim());
  }
  function isCorrectReorder(q,values){
    const items=q?.items||[];
    const expected=Array.isArray(q?.answerOrder)&&q.answerOrder.length?q.answerOrder:items.map((_,i)=>i);
    const a=reorderTokenTexts(q,expected);
    const b=reorderTokenTexts(q,values||[]);
    return a.length===b.length&&a.every((x,i)=>x===b[i]);
  }
  return {reorderTokenTexts,isCorrectReorder};
});