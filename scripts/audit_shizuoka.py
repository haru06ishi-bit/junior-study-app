#!/usr/bin/env python3
import json,re,collections,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]
Q=json.load(open(R/'data/questions.json',encoding='utf-8'))['questions']
C=json.load(open(R/'data/curriculum.json',encoding='utf-8'))
UF={}
for s in C['subjects']:
    for f in s['fields']:
        for u in f['units']: UF[(s['id'],u['id'])]=f['id']
def field(q): return q.get('field') or UF.get((q.get('subject'),q.get('unit')))
def target(q):
    s=q.get('subject');p=q.get('textbookPublisher','common') or 'common'
    if s=='japanese': return p in ('common','sanseido')
    if s=='english': return p in ('common','mitsumura')
    if s=='math': return p in ('common','keirinkan')
    if s=='science': return p in ('common','keirinkan')
    if s=='social':
        if p=='common': return True
        f=field(q); return (f in ('geography','history') and p=='teikoku') or (f=='civics' and p=='tokyo-shoseki')
    return False
A=[q for q in Q if target(q)]
print('Shizuoka scope',len(A),collections.Counter(q['subject'] for q in A))
for s in ['japanese','english','math','science','social']:
    a=[q for q in A if q['subject']==s]
    print(s, 'n=',len(a),'types=',dict(collections.Counter(q.get('type') for q in a)),'difficulty=',dict(collections.Counter(q.get('difficulty') for q in a)),'stimulus=',sum(bool(q.get('passage') or q.get('table') or q.get('figure')) for q in a))
errors=[]
bad=['教科書の値段','ページ番号だけ','漢字の画数だけ','ページの厚さ','印刷所','警報を必ず無視']
for q in A:
    if q.get('question','').startswith('選択肢を見ずに答えなさい'): errors.append(f"legacy recall prefix: {q['id']}")
    if any(x in str(q.get('choices',[])) for x in bad): errors.append(f"weak distractor: {q['id']}")
    if q.get('type')=='multi' and (len(q.get('answers',[]))==0 or len(q.get('answers',[]))==len(q.get('choices',[]))): errors.append(f"invalid multi ratio: {q['id']}")
    if q.get('type')=='fill':
        markers=set(re.findall(r'（(\d+)）',q.get('question','')))
        if markers and max(map(int,markers))!=len(q.get('blanks',[])): errors.append(f"blank mismatch: {q['id']}")
    # Shuffled choices must not have explanations that depend on pre-shuffle positions.
    if q.get('type') in ('choice','multi') and not q.get('preserveChoiceOrder'):
        exp=q.get('explanation','')
        if re.search(r'(?:選択肢\s*)?[0-3](?:と|・)[0-3](?:では|が|は)',exp):
            errors.append(f"position-dependent explanation: {q['id']}")
    # Letter labels such as A/B/C refer to the stimulus, so their order must remain fixed.
    choices=q.get('choices') or []
    if q.get('type') in ('choice','multi') and len(choices)>=3 and all(re.fullmatch(r'[A-D]',str(v)) for v in choices[:3]):
        if not q.get('preserveChoiceOrder'): errors.append(f"ordered labels shuffled: {q['id']}")
    # Grade tags must fit the grade range registered for the curriculum unit.
    unit_grades=None
    for s in C['subjects']:
        if s['id']!=q.get('subject'): continue
        for f in s['fields']:
            for u in f['units']:
                if u['id']==q.get('unit'): unit_grades=set(u.get('grades',[]))
    if unit_grades and not set(q.get('grades',[])).issubset(unit_grades):
        errors.append(f"grade/unit mismatch: {q['id']} grades={q.get('grades')} unit={q.get('unit')} allowed={sorted(unit_grades)}")
by=collections.defaultdict(list)
for q in A:
    by[(q['subject'],re.sub(r'\s+','',q.get('question','')))].append(q['id'])
for k,ids in by.items():
    if len(ids)>1: errors.append(f'duplicate prompt: {ids}')
if not any(q.get('type')=='text' for q in A): errors.append('no written response items')
if not any(q.get('passage') for q in A): errors.append('no passage items')
if not any(q.get('table') for q in A): errors.append('no table items')
if not any(q.get('figure') for q in A): errors.append('no figure items')
# Multi-select answer counts should not reveal a fixed number of correct choices.
multi_counts=collections.Counter(len(q.get('answers',[])) for q in A if q.get('type')=='multi')
if sum(multi_counts.values())>=4 and len(multi_counts)<2: errors.append(f'fixed multi answer count: {dict(multi_counts)}')
print('quality gate errors=',len(errors))
for e in errors: print('ERROR',e)
sys.exit(1 if errors else 0)