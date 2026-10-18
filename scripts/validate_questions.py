#!/usr/bin/env python3
import json,re,sys,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from question_bank_loader import load_questions
Q=load_questions()
errors=[];warnings=[]
ids=set();seen_text=collections.defaultdict(list)
for q in Q:
    qid=q.get('id','')
    if not qid: errors.append('missing id'); continue
    if qid in ids: errors.append(f'duplicate id: {qid}')
    ids.add(qid)
    if not q.get('question'): errors.append(f'{qid}: empty question')
    t=q.get('type')
    if t=='choice':
        ch=q.get('choices',[]); a=q.get('answer')
        if len(ch)<2: errors.append(f'{qid}: choice has <2 options')
        if len(set(map(str,ch)))!=len(ch): errors.append(f'{qid}: duplicate choice text')
        if not isinstance(a,int) or not (0<=a<len(ch)): errors.append(f'{qid}: invalid choice answer')
    elif t=='multi':
        ch=q.get('choices',[]); ans=q.get('answers',[])
        if len(ch)<3: errors.append(f'{qid}: multi has <3 options')
        if len(set(map(str,ch)))!=len(ch): errors.append(f'{qid}: duplicate multi choice text')
        if not ans or any(not isinstance(a,int) or a<0 or a>=len(ch) for a in ans): errors.append(f'{qid}: invalid multi answers')
        if len(ans)>=len(ch)-1: warnings.append(f'{qid}: weak multi ratio {len(ans)}/{len(ch)}')
    elif t=='fill':
        blanks=q.get('blanks',[])
        if not blanks: errors.append(f'{qid}: fill has no blanks')
        markers=set(re.findall(r'（(\d+)）',q.get('question','')))
        if markers and max(map(int,markers))!=len(blanks): errors.append(f'{qid}: visible blank count does not match blanks')
        for b in blanks:
            vals=b if isinstance(b,list) else [b]
            if not [v for v in vals if str(v).strip()]: errors.append(f'{qid}: empty fill answer')
    elif t=='word':
        if not q.get('answers'): errors.append(f'{qid}: word has no accepted answers')
    elif t=='reorder':
        it=q.get('items',[]); order=q.get('answerOrder',[])
        if len(it)<2 or len(order)!=len(it) or sorted(order)!=list(range(len(it))): errors.append(f'{qid}: invalid reorder')
    elif t=='text':
        if not (q.get('modelAnswer') or q.get('answerText')): errors.append(f'{qid}: text has no model answer')
    else:
        errors.append(f'{qid}: unknown type {t}')
    if q.get('passage') and len(str(q['passage']).strip())<20: warnings.append(f'{qid}: passage is very short')
    if q.get('table'):
        tb=q['table']; heads=tb.get('headers',[]); rows=tb.get('rows',[])
        if not heads or not rows: errors.append(f'{qid}: incomplete table')
        elif any(len(r)!=len(heads) for r in rows): errors.append(f'{qid}: table row length mismatch')
    if q.get('figure'):
        f=q['figure']
        if f.get('type')=='bar' and len(f.get('labels',[]))!=len(f.get('values',[])): errors.append(f'{qid}: bar labels/values mismatch')
    bad=['教科書の値段','ページ番号だけ','漢字の画数だけ','ページの厚さ','印刷所','警報を必ず無視']
    if any(b in str(q.get('choices',[])) for b in bad): warnings.append(f'{qid}: suspicious distractor')
    norm=re.sub(r'\s+','',q.get('question',''))
    if norm: seen_text[(q.get('subject'),norm)].append(qid)
for (sub,txt),arr in seen_text.items():
    if len(arr)>1: warnings.append(f'duplicate prompt {sub}: {arr}')

# Quality summary
cnt=collections.Counter(q.get('type') for q in Q)
stim=sum(bool(q.get('passage') or q.get('table') or q.get('figure')) for q in Q)
print(f'questions={len(Q)} types={dict(cnt)} stimulus={stim}')
print(f'errors={len(errors)} warnings={len(warnings)}')
for x in errors[:100]: print('ERROR',x)
for x in warnings[:100]: print('WARN',x)
if errors: sys.exit(1)