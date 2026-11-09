# CLAUDE.md — 30分スタディ 開発ルール（Claude向け引き継ぎ）

最重要目標：使った生徒の成績が実際に上がること。問題数・機能数は目標ではない。

## 構成
- 静的PWA（Cloudflare Pages）。ビルドはない。`index.html` → `data/*.js` → `reorder-grading.js` / `exam-scope.js` / `recall-ladder.js` → `app.js` の順に読み込む。
- 問題データ：`data/questions.json`（`questions.js` と同じ内容）＋ `data/question-supplement-v*.js`。Python 側は `scripts/question_bank_loader.py` で読み込む。
- 学習記録はすべて端末の localStorage にある。キーを追加したら `BACKUP_KEYS` と `mergeBackupData` にも追加する。
- `/api/explain`（functions/api）は Cloudflare Workers AI を使う。

## 必ず守ること
- 既存の問題IDは変えない。学習履歴の形式は「項目を追加するだけ」にする。
- 教科書固有の問題には、確認できた教材IDだけを付ける。正解は一つに決まるようにし、記述問題には採点の観点を付ける。
- バージョンを上げるときは、`app.js` の APP_VERSION、`index.html` の `?v=`、`sw.js` の CACHE_NAME と APP_SHELL を揃える。新しい JS は3か所すべてに追加する。
- 機能を変更したら回帰テストを `scripts/` に追加し、`.github/workflows/question-quality.yml` に登録する。
- スマホ（320px・375px）での表示を優先する。横スクロールは禁止。
- localStorage の読み込みは try/catch で囲み、壊れたデータに耐えるようにする。

## 検査（すべて成功させること）
```
python3 scripts/validate_questions.py && python3 scripts/audit_shizuoka.py && python3 scripts/check_question_quality_regressions.py && python3 scripts/test_answer_leakage.py && node scripts/test_reorder_grading.js && node scripts/test_exam_scope.js && node scripts/test_fill_blank_visibility.js && node scripts/test_known_fill_answers.js && node scripts/test_data_version_footer.js && node scripts/test_supplement_parity.js && python3 scripts/report_question_coverage.py --json >/dev/null && node scripts/test_recall_ladder.js
NODE_PATH=$(npm root -g) node scripts/e2e_recall_practice.js   # 実ブラウザ
```

## ブランチ運用と承認
- 基準ブランチは `review/v0.44.7-full`。機能ごとにブランチを作り、Draft PR を出す。
- 実装担当と独立監査担当は別のエージェントにする。必須の修正が出たら、新しいコミットで再監査する。
- **承認が必要なこと**：mainへのマージ、本番公開、デプロイ設定の変更、課金・有料API、外部へのデータ送信、定期実行の導入。
- 報告では「開発環境で確認したこと」と「本番・実機で確認したこと」を分けて書く。
- 計画と残りの課題：`docs/DEVELOPMENT_PLAN_V047.md`
