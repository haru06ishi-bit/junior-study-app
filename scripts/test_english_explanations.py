"""Regression test for v0.47.4 grade-3 English explanations and content corrections."""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from question_bank_loader import load_questions  # noqa: E402

spec = importlib.util.spec_from_file_location('upd', ROOT / 'scripts/update_english_explanations_v0474.py')
upd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(upd)

spec5 = importlib.util.spec_from_file_location('upd5', ROOT / 'scripts/update_multi_distractors_v0475.py')
upd5 = importlib.util.module_from_spec(spec5)
spec5.loader.exec_module(upd5)
# Rebuilt in v0.47.5 (weak multi-select distractors); checked against that script instead.
SUPERSEDED = set(upd.SUPERSEDED_BY_V0475)

errors = []
if not SUPERSEDED <= set(upd5.UPDATES):
    errors.append('SUPERSEDED_BY_V0475 ids are not all in update_multi_distractors_v0475.py')
questions = load_questions()
by_id = {q['id']: q for q in questions}

# 1. No placeholder explanation anywhere in the bank.
for q in questions:
    if upd.PLACEHOLDER in str(q.get('explanation', '')):
        errors.append(f"{q['id']}: placeholder explanation remains")

# 2. The 125 rewritten IDs exist and carry a specific explanation.
if len(upd.EXPLANATIONS) != 125:
    errors.append(f'expected 125 rewritten ids, got {len(upd.EXPLANATIONS)}')
for qid, text in upd.EXPLANATIONS.items():
    q = by_id.get(qid)
    if q is None:
        errors.append(f'{qid}: missing from bank')
        continue
    exp = q.get('explanation', '')
    if len(exp) < 25:
        errors.append(f'{qid}: explanation shorter than 25 chars')
    if qid in SUPERSEDED:
        text = upd5.UPDATES[qid]['explanation']
    if exp != text:
        errors.append(f'{qid}: explanation differs from update script (run scripts/update_english_explanations_v0474.py)')


def answer_key(q):
    return json.dumps({k: q.get(k) for k in ('type', 'items', 'answerOrder', 'blanks', 'choices', 'answers', 'answer')},
                      ensure_ascii=False, sort_keys=True)


# 3. An explanation may be shared only by questions with the same keyed answer.
seen = {}
for qid in upd.EXPLANATIONS:
    q = by_id.get(qid)
    if q is None:
        continue
    exp = q.get('explanation', '')
    if exp in seen and answer_key(by_id[seen[exp]]) != answer_key(q):
        errors.append(f'{qid}: explanation reused from {seen[exp]} although answers differ')
    seen.setdefault(exp, qid)

# 4. Content corrections from the teacher review are applied (answer keys unchanged).
EXPECTED = {
    'v034_san_e3_l2_06': ('question', '過去から今まで続いている動作や状態を表す文をすべて選びなさい。', 'answers', [0, 1]),
    'v034_tok_e3_u2_06': ('question', '過去から今まで続いている動作や状態を表す文をすべて選びなさい。', 'answers', [0, 1]),
    'v034_kai_e3_p2_06': ('question', '過去から今まで続いている動作や状態を表す文をすべて選びなさい。', 'answers', [0, 1]),
    'v034_san_e3_l8_06': ('question', '間接疑問文の特徴として正しいものをすべて選びなさい。', 'answers', [0, 1]),
    'v034_tok_e3_u4_06': ('question', '間接疑問文の特徴として正しいものをすべて選びなさい。', 'answers', [0, 1]),
    'v034_kai_e3_p4_06': ('question', '間接疑問文の特徴として正しいものをすべて選びなさい。', 'answers', [0, 1]),
    'v034_tok_e3_u3_03': ('question', '「先生は私たちに窓を開けさせてくれました。」になるように並べ替えなさい。', 'answerOrder', [0, 1, 2, 3, 4, 5, 6, 7]),
    'v034_tok_e3_u3_04': ('question', '「彼は私が箱を運ぶのを手伝ってくれました。」になるように並べ替えなさい。', 'answerOrder', [0, 1, 2, 3, 4, 5, 6]),
}
for qid, (field, value, key_field, key_value) in EXPECTED.items():
    q = by_id.get(qid, {})
    if q.get(field) != value:
        errors.append(f'{qid}: {field} correction not applied')
    if q.get(key_field) != key_value:
        errors.append(f'{qid}: answer key changed unexpectedly')
q = by_id.get('v034_san_e3_l4_05', {})
if q.get('choices', [None])[0] != 'The dog running over there is mine.' or 'I saw a dog running fast.' in q.get('choices', []):
    errors.append('v034_san_e3_l4_05: ambiguous SVOC choice still present')
if q.get('answers') != [0, 1]:
    errors.append('v034_san_e3_l4_05: answer key changed unexpectedly')
for qid in ('v034_tok_e3_u1_01', 'v034_kai_e3_p1_01'):
    if by_id.get(qid, {}).get('blanks') != [['eaten', 'had', 'tried']]:
        errors.append(f'{qid}: tried alias not accepted (eaten must stay first)')
if set(EXPECTED) | {'v034_san_e3_l4_05', 'v034_tok_e3_u1_01', 'v034_kai_e3_p1_01'} != set(upd.CORRECTIONS):
    errors.append('CORRECTIONS in update script and this test are out of sync')

# 4b. Audit follow-ups stay in the explanations.
NOTES = {
    'v034_san_e3_l1_03': '※この問題では once を文末に置く',
    'v034_tok_e3_u1_03': '※この問題では twice を文末に置く',
    'v034_kai_e3_p1_03': '※この問題では twice を文末に置く',
    'v034_tok_e3_u3_04': 'helped me to carry',
    'v034_tok_e3_u3_05': 'to＋原形',
    'v034_tok_e3_u3_06': 'to＋原形',
    'v034_san_e3_l7_06': 'was ではなく were',
    'v034_tok_e3_u6_06': 'was ではなく were',
    'v034_kai_e3_p7_06': 'was ではなく were',
}
for qid, phrase in NOTES.items():
    if phrase not in by_id.get(qid, {}).get('explanation', ''):
        errors.append(f'{qid}: explanation lost audit note {phrase!r}')

# 4c. Answer keys of all 125 IDs are frozen at the audited commit 6d313dd
#     (only the deliberate tried alias is allowed on top of that snapshot).
snapshot = json.loads((ROOT / 'scripts/english_explanations_v0474_keys.json').read_text(encoding='utf-8'))
ALLOWED_KEY_CHANGES = {
    'v034_tok_e3_u1_01': {'blanks': [['eaten', 'had', 'tried']]},
    'v034_kai_e3_p1_01': {'blanks': [['eaten', 'had', 'tried']]},
}
if set(snapshot) != set(upd.EXPLANATIONS):
    errors.append('key snapshot ids differ from rewritten ids')
for qid, keys in snapshot.items():
    q = by_id.get(qid, {})
    expected = {**keys, **ALLOWED_KEY_CHANGES.get(qid, {})}
    if qid in SUPERSEDED:
        expected = {'type': 'multi', 'choices': upd5.UPDATES[qid]['choices'], 'answers': upd5.UPDATES[qid]['answers']}
    for field, value in expected.items():
        if q.get(field) != value:
            errors.append(f'{qid}: {field} differs from audited snapshot')

# 5. questions.js mirrors questions.json.
base = json.loads((ROOT / 'data/questions.json').read_text(encoding='utf-8'))
js = (ROOT / 'data/questions.js').read_text(encoding='utf-8').strip()
prefix = 'window.QUESTION_DATA = '
if not (js.startswith(prefix) and js.endswith(';')) or json.loads(js[len(prefix):-1]) != base:
    errors.append('data/questions.js does not match data/questions.json')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'english explanations OK: {len(upd.EXPLANATIONS)} rewritten, {len(upd.CORRECTIONS)} corrections')
