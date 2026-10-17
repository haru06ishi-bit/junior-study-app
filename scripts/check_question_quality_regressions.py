#!/usr/bin/env python3
import json,re,sys,collections,unicodedata,difflib
from pathlib import Path
R=Path(__file__).resolve().parents[1]
from question_bank_loader import load_questions
Q=load_questions()
C=json.load(open(R/'data/curriculum.json',encoding='utf-8'))
UF={}
for s in C['subjects']:
  for f in s['fields']:
    for u in f['units']:
      UF[(s['id'],u['id'])]=f['id']
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
errors=[]; warnings=[]

# No development labels in student-facing prompts.
for q in A:
  if re.match(r'^Grade\s*\d+\s*:',q.get('question',''),re.I):
    errors.append(f"Grade prefix: {q['id']}")

# Same subject + stimulus title means the same stimulus payload.
groups=collections.defaultdict(list)
for q in A:
  title=q.get('stimulusTitle')
  if title and (q.get('passage') is not None or q.get('table') is not None or q.get('figure') is not None):
    groups[(q.get('subject'),title)].append(q)
for key,qs in groups.items():
  if len(qs)<2: continue
  def sig(q):
    return (q.get('passage'),json.dumps(q.get('table'),ensure_ascii=False,sort_keys=True),json.dumps(q.get('figure'),ensure_ascii=False,sort_keys=True))
  variants={sig(q) for q in qs}
  if len(variants)>1:
    errors.append(f"stimulus mismatch for {key}: {[q['id'] for q in qs]}")

# Elimination-cue words must not appear only in distractors.
# Text inside Japanese quotation marks is ignored because it may be a source quotation.
JP_CUES=('だけ','必ず','一切','まったく','絶対','常に','しか','すべて')
EN_CUES=('only','never','always','all','every','none')
def strip_quoted(text):
  return re.sub(r'「[^」]*」','',str(text))
def has_en_cue(text,cue):
  return re.search(rf'(?i)(?<![A-Za-z]){re.escape(cue)}(?![A-Za-z])',text) is not None
for q in A:
  if q.get('type') not in ('choice','multi'): continue
  choices=q.get('choices') or []
  if q.get('type')=='choice':
    a=q.get('answer'); correct={a} if isinstance(a,int) else set()
  else:
    aa=q.get('answers'); correct=set(aa) if isinstance(aa,list) else set()
  correct_text=' '.join(strip_quoted(choices[i]) for i in correct if isinstance(i,int) and 0<=i<len(choices))
  for cue in JP_CUES:
    bad=[i for i,c in enumerate(choices) if i not in correct and cue in strip_quoted(c)]
    if bad and cue not in correct_text:
      errors.append(f"distractor-only cue '{cue}': {q['id']} choices={bad}")
  for cue in EN_CUES:
    bad=[i for i,c in enumerate(choices) if i not in correct and has_en_cue(strip_quoted(c),cue)]
    if bad and not has_en_cue(correct_text,cue):
      errors.append(f"distractor-only cue '{cue}': {q['id']} choices={bad}")

# English passages should not expose textbook/Unit labels as part of the reading content.
for q in A:
  if q.get('subject')!='english': continue
  p=q.get('passage') or ''
  if re.search(r'\bUnit\s*\d+\b',p,re.I) or re.search(r'\bHere\s+We\s+Go!?\b',p,re.I):
    errors.append(f"unit-name leakage in passage: {q['id']}")

# Known malformed-English anti-patterns: keep distractors grammatical enough to test meaning/grammar,
# not to reward spotting nonsense strings.
BROKEN_ENGLISH=[
  r'\bI\s+be\b', r'\bDo\s+lunch\b', r'\bmust\s+lunch\b',
  r'\bvery\s+only\b', r'\bbut\s+only\b', r'\bthat\s+bought\s+me\b',
  r'\byesterday\s+only\b'
]
for q in A:
  if q.get('subject')!='english' or q.get('type') not in ('choice','multi'): continue
  for i,c in enumerate(q.get('choices') or []):
    for pat in BROKEN_ENGLISH:
      if re.search(pat,str(c),re.I):
        errors.append(f"malformed English distractor: {q['id']} choice={i} text={c!r}")

# Heuristic warning: correct choice is conspicuously longer than every distractor.
for q in A:
  if q.get('type')!='choice': continue
  ch=q.get('choices') or []; ans=q.get('answer')
  if not isinstance(ans,int) or not (0<=ans<len(ch)) or len(ch)<2: continue
  al=len(str(ch[ans]).strip())
  dl=[len(str(v).strip()) for i,v in enumerate(ch) if i!=ans]
  if not dl: continue
  mx=max(dl)
  if al>=mx*1.3 and al-mx>=6:
    warnings.append(f"long correct choice: {q['id']} correct={al} max_distractor={mx}")

# Semantic-duplicate heuristic: same subject/unit, same correct-answer text, and very similar prompt.
def norm(s):
  s=unicodedata.normalize('NFKC',str(s)).lower()
  s=re.sub(r'[\s、。,.?？!！:：;；()（）\[\]「」『』]+','',s)
  return s
by_unit=collections.defaultdict(list)
for q in A:
  if q.get('type')!='choice': continue
  ans=q.get('answer'); ch=q.get('choices') or []
  if not isinstance(ans,int) or not (0<=ans<len(ch)): continue
  by_unit[(q.get('subject'),q.get('unit'))].append((q,norm(ch[ans])))
for key,items in by_unit.items():
  for i in range(len(items)):
    q1,a1=items[i]
    for j in range(i+1,len(items)):
      q2,a2=items[j]
      if a1!=a2: continue
      n1,n2=norm(q1.get('question','')),norm(q2.get('question',''))
      if not n1 or not n2: continue
      ratio=difflib.SequenceMatcher(None,n1,n2).ratio()
      if ratio>=0.82:
        warnings.append(f"possible semantic duplicate ({ratio:.2f}): {q1['id']} / {q2['id']}")


# Answer leakage heuristic: avoid putting the exact correct term in the stem unless it is part of a quoted source.
for q in A:
  if q.get('type')!='choice': continue
  ans=q.get('answer'); ch=q.get('choices') or []
  if not isinstance(ans,int) or not (0<=ans<len(ch)): continue
  answer_text=norm(ch[ans])
  stem=norm(strip_quoted(q.get('question','')))
  if len(answer_text)>=3 and not re.search(r'\d',answer_text) and answer_text in stem:
    warnings.append(f"correct answer appears in stem: {q['id']} answer={ch[ans]!r}")

# Grade-level English passage guardrails for constructions clearly beyond the registered grade.
for q in A:
  if q.get('subject')!='english' or not q.get('passage'): continue
  grades=set(q.get('grades') or [])
  passage=str(q.get('passage'))
  if 1 in grades:
    if re.search(r'\b(?:will|be\s+going\s+to|have\s+\w+ed|has\s+\w+ed)\b',passage,re.I):
      errors.append(f"possible beyond-grade English in G1 passage: {q['id']}")
  if 2 in grades and re.search(r'\b(?:was|were)\s+being\s+\w+(?:ed|en)\b',passage,re.I):
    errors.append(f"passive progressive in G2 passage: {q['id']}")

# Unit-volume diagnostics. This is a warning because content expansion is handled in the next phase.
unit_counts=collections.Counter()
for q in A:
  for g in q.get('grades') or []:
    unit_counts[(q.get('subject'),g,q.get('unit'))]+=1
for key,n in sorted(unit_counts.items()):
  if n<10:
    warnings.append(f"thin unit (<10): {key} count={n}")

print('regression errors=',len(errors))
for e in errors: print('ERROR',e)
print('quality warnings=',len(warnings))
for w in warnings: print('WARNING',w)
sys.exit(1 if errors else 0)