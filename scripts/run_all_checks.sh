#!/usr/bin/env bash
# 全検査をまとめて実行する（CI と同じ内容）。--quick でブラウザ検査を省略。
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PYTHON:-python3}
checks=(
 "$PY scripts/validate_questions.py" "$PY scripts/audit_shizuoka.py" "$PY scripts/check_question_quality_regressions.py"
 "$PY scripts/test_answer_leakage.py" "$PY scripts/test_english_explanations.py" "$PY scripts/test_multi_distractors.py"
 "node scripts/test_reorder_grading.js" "node scripts/test_exam_scope.js" "node scripts/test_fill_blank_visibility.js"
 "node scripts/test_known_fill_answers.js" "node scripts/test_japanese_learning.js" "node scripts/test_auto_exam.js"
 "node scripts/test_data_version_footer.js" "node scripts/test_supplement_parity.js" "node scripts/test_recall_ladder.js"
 "node scripts/test_storage_guard.js" "node scripts/test_functions.mjs" "$PY scripts/report_question_coverage.py --json"
)
[[ "${1:-}" == "--quick" ]] || checks+=("node scripts/e2e_recall_practice.js" "node scripts/e2e_learning_updates.js" "node scripts/e2e_security.js")
pass=0;fail=0
for c in "${checks[@]}";do if out=$($c 2>&1);then pass=$((pass+1));echo "PASS  $c";else fail=$((fail+1));echo "FAIL  $c";echo "$out"|tail -15;fi;done
echo "checks: $pass passed, $fail failed";[[ $fail -eq 0 ]]
