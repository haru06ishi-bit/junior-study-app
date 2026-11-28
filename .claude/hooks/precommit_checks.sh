#!/usr/bin/env bash
# Claude Code の PreToolUse フック：Claude が git commit を実行する前に高速検査を走らせ、失敗したらコミットを止める。
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
case "$cmd" in *"git commit"*) ;; *) exit 0;; esac
root=${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}
[ -x "$root/scripts/run_all_checks.sh" ] || exit 0
if ! out=$("$root/scripts/run_all_checks.sh" --quick 2>&1); then
  echo "コミット前の検査に失敗しました。修正してから再度コミットしてください。" >&2
  printf '%s\n' "$out" | grep -E "FAIL|checks:" >&2
  exit 2
fi
exit 0
