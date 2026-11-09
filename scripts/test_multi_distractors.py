"""Regression test for v0.47.5: rebuilt multi-select questions with plausible distractors."""
import collections
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from question_bank_loader import load_questions  # noqa: E402

spec = importlib.util.spec_from_file_location('upd', ROOT / 'scripts/update_multi_distractors_v0475.py')
upd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(upd)

errors = []
by_id = {q['id']: q for q in load_questions()}

# 1. The 78 IDs match the update script (choices, answers, explanation, prompt suffix).
if len(upd.IDS) != 78 or len(set(upd.IDS)) != 78:
    errors.append(f'expected 78 unique ids, got {len(upd.IDS)}')
counts = collections.Counter()
for qid in upd.IDS:
    q = by_id.get(qid)
    if q is None:
        errors.append(f'{qid}: missing from bank')
        continue
    new = upd.UPDATES[qid]
    if q.get('type') != 'multi':
        errors.append(f'{qid}: type changed')
    for field in ('choices', 'answers', 'explanation'):
        if q.get(field) != new[field]:
            errors.append(f'{qid}: {field} differs from update script (run scripts/update_multi_distractors_v0475.py)')
    if 'stem' in new and not q.get('question', '').endswith(new['stem']):
        errors.append(f'{qid}: prompt was not updated')
    ch, ans = q.get('choices', []), q.get('answers', [])
    # 2. Not a weak ratio: correct count < choices - 1.
    if len(ans) >= len(ch) - 1:
        errors.append(f'{qid}: weak multi ratio {len(ans)}/{len(ch)}')
    if sorted(set(ans)) != sorted(ans) or any(not (0 <= a < len(ch)) for a in ans):
        errors.append(f'{qid}: invalid answers {ans}')
    if len(set(ch)) != len(ch):
        errors.append(f'{qid}: duplicate choice text')
    # 3. No limiting word 「だけ」 in any choice.
    for i, c in enumerate(ch):
        if 'だけ' in c:
            errors.append(f'{qid}: choice {i} contains だけ: {c!r}')
    # 4. No replaced absurd distractor comes back as a wrong choice.
    for i, c in enumerate(ch):
        if i not in ans and c in upd.REPLACED_ABSURD_DISTRACTORS:
            errors.append(f'{qid}: replaced absurd distractor reused: {c!r}')
    exp = q.get('explanation', '')
    if not (50 <= len(exp) <= 150):
        errors.append(f'{qid}: explanation length {len(exp)} outside 50-150')
    counts[len(ans)] += 1

# 5. The number of correct choices varies (must include 1 and 2).
if len(counts) < 2 or 1 not in counts or 2 not in counts:
    errors.append(f'correct-count distribution is not varied: {dict(counts)}')

# 6. Questions that were identical before stay identical (except the textbook prefix of the prompt).
def content(q):
    return json.dumps({k: q.get(k) for k in ('choices', 'answers', 'explanation', 'subject', 'unit', 'type')},
                      ensure_ascii=False, sort_keys=True)


for g in upd.GROUPS:
    variants = {content(by_id[i]) for i in g['ids'] if i in by_id}
    if len(variants) > 1:
        errors.append(f'duplicate group diverged: {g["ids"]}')
    prompts = {by_id[i]['question'] for i in g['ids'] if i in by_id and 'stem' not in g}
    same_prompt_originally = 'stem' not in g and len(prompts) > 1 and not any(i.startswith('v040_') for i in g['ids'])
    if same_prompt_originally:
        errors.append(f'duplicate group prompts diverged: {g["ids"]}')

# 7. questions.js mirrors questions.json.
base = json.loads((ROOT / 'data/questions.json').read_text(encoding='utf-8'))
js = (ROOT / 'data/questions.js').read_text(encoding='utf-8').strip()
prefix = 'window.QUESTION_DATA = '
if not (js.startswith(prefix) and js.endswith(';')) or json.loads(js[len(prefix):-1]) != base:
    errors.append('data/questions.js does not match data/questions.json')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'multi distractors OK: {len(upd.IDS)} ids, correct-count distribution {dict(sorted(counts.items()))}')
