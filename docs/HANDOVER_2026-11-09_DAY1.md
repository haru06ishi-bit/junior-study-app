# 別PCへの引き継ぎ（2026-11-09 Day 1 終了時点）

このPC（Windows、J24005）での最新の引き継ぎ記録。この記録の検査結果は、このPCで実行したもの。**引き継ぎ先のPCで再実行するまで、そのPCで成功したとは扱わない。**

## 1. 読む順番
1. `AGENTS.md` / `CLAUDE.md`（ルール）
2. **この文書**
3. `docs/DAILY_IMPROVEMENT_LOG.md`（1週間の改善記録。優先順位の表と Day 1 の詳細）
4. `docs/RESTORATION_REPORT_2026-11-09.md`（v0.47.0〜v0.47.3 の復元・再実装の記録）
5. `docs/DEVELOPMENT_PLAN_V047.md`、`docs/HANDOVER_CODEX.md`（前環境の歴史的な情報）

## 2. コードの状態
- 最新の作業ブランチ：**`codex/v0.47.5-multi-select-distractors`**（アプリ v0.47.5）
- 積み重ね：`origin/review/v0.44.7-full`（`e57a05a`、GitHub上にある）→ 元パッチ6つ → v0.47.1〜v0.47.3 → `codex/v0.47.4-english-explanations` → `codex/v0.47.5-multi-select-distractors`
- `e57a05a` より後の23コミット（この文書を含む）は、ユーザーの承認を得て、2026-11-09 に **GitHub の `origin/codex/v0.47.5-multi-select-distractors`（`8ac96ef`）へpush した**。途中のブランチ（`codex/v0.47.1-english`〜`codex/v0.47.4-english-explanations`）はpushしていないが、その内容はすべてこのブランチの履歴に含まれている。
- main・本番は変更していない（本番は前環境の記録では v0.44.9。今回は再確認していない）。

## 3. Day 1 の成果（詳細は DAILY_IMPROVEMENT_LOG）
| 版 | 内容 | 問題数 | 監査 |
|---|---|---|---|
| v0.47.4 | 中3英語の定型文解説を、問題ごとの具体的な解説に書き換え。問題文と正解の不一致を9問修正。tried を別解に追加 | 解説125問、修正9問、別解2問 | 合格→推奨を反映→再監査合格 |
| v0.47.5 | 「4つ中3つが正解」の複数選択（社会・英語・理科・数学）を、紛らわしい誤りの選択肢と1〜3個の正解で作り直し。単元違いの1問を移動 | 78問 | 合格→推奨を反映→再監査合格 |

**追加した問題は0問**。どれも既存問題の品質改善で、IDは変えていない。

このPCで最後に実行した検査（`1d71376`）：
- 通常検査16件：16/16成功
- Edge でのブラウザ検査2種類：320px・375pxで成功
- データ検証の警告：517件
- 品質回帰の警告：85件

## 4. 移し方
- **GitHub から取得する（推奨）**

  ```
  git clone https://github.com/haru06ishi-bit/junior-study-app.git
  cd junior-study-app
  git switch codex/v0.47.5-multi-select-distractors
  git log --oneline -2   # 「Record push …」とその前の「Add handover for continuing on another PC」（8ac96ef）
  ```

  push後、GitHub Actions と Cloudflare Pages のプレビューがどうなったかは確認していない。Draft PR も作っていない。
- **予備：パッチファイル（Git bundle は使わない）**。GitHub が使えない場合だけ使う。
  1. このPCの `transfer/2026-11-09-day1/` に、`e57a05a` 以降の全23コミット（この引き継ぎ文書のコミットを含む）を `git format-patch` で出力した。この中には0001〜0023と `SHA256SUMS.txt` がある。フォルダはGitの対象外。
  2. フォルダごとUSBなどで別PCへ渡す。
  3. 別PCで次を実行する。

     ```
     git clone https://github.com/haru06ishi-bit/junior-study-app.git
     cd junior-study-app
     git fetch origin review/v0.44.7-full
     git switch -c codex/v0.47.5-multi-select-distractors e57a05a
     git am <パッチのフォルダ>/*.patch
     git log --oneline -1   # 件名が「Add handover for continuing on another PC」
     ```

  コミットのハッシュは別PCで変わる。件名と内容で照合する。途中のブランチ（v0.47.1〜v0.47.4）が必要なら、該当するコミットから作り直す。
  パッチは `8ac96ef` までの内容で、これより後の文書更新は含まない。

## 5. 引き継ぎ先で最初にやること
1. `git status`、ブランチ、`git log --oneline -3` を確認する。既存の変更は上書きしない。
2. 検査を再実行する（Windowsなら `python`。PowerShellでは `$env:PYTHONUTF8=1` を設定する）。

   ```
   python scripts/validate_questions.py
   python scripts/audit_shizuoka.py
   python scripts/check_question_quality_regressions.py
   python scripts/test_answer_leakage.py
   node scripts/test_reorder_grading.js
   node scripts/test_exam_scope.js
   node scripts/test_fill_blank_visibility.js
   node scripts/test_known_fill_answers.js
   node scripts/test_data_version_footer.js
   node scripts/test_supplement_parity.js
   python scripts/report_question_coverage.py --json
   node scripts/test_recall_ladder.js
   node scripts/test_japanese_learning.js
   node scripts/test_auto_exam.js
   python scripts/test_english_explanations.py
   python scripts/test_multi_distractors.py
   ```

   ブラウザ検査には Playwright 1.48.2 が必要（`npm i --no-save playwright@1.48.2`）。このPCでは、取得した Chromium が起動しなかったため Edge を使った。

   ```
   $env:E2E_BROWSER_CHANNEL = 'msedge'   # Edge を使う場合
   node scripts/e2e_recall_practice.js
   node scripts/e2e_learning_updates.js
   ```

3. `docs/DAILY_IMPROVEMENT_LOG.md` に Day 2 の欄を作って続ける。開始・終了時刻、検査、監査はその日に実際に行ったものだけを書く。

## 6. 次の優先作業（DAILY_IMPROVEMENT_LOG の 10. と同じ）
1. 品質回帰の「正解の選択肢だけが長い」2件：`v0455_en_g1_past_progressive_3`、`v0461_ja_g3_common_poetry_3_1`
2. 本文の答え漏れ候補6件。`v037_e_mitsumura_2_1_03` は記述問題なのに `blanks` が残っている
3. 国語の複数選択97問（4つ中3つが正解。読み方の一般論）。教材本文に頼らない作り直しの方針を決める
4. 数学の短い解説84問
5. 並べ替えで正しい語順が複数あるのに、1つしか受け付けない問題の洗い出し
6. 教材の不足（94単元。社会、国語の順に不足が大きい）

注意：
- `scripts/apply_v0446_fixes.py` は古い一回限りのスクリプト。再実行すると v030/v031 の複数選択が元に戻る。
- `v036sci_tokyoshoseki_plantsanimals_3` は中2の cells-body に移した。IDに plantsanimals が残っているのは意図どおりで、IDは変えない。

## 7. 進め方のルール（ユーザーの依頼から）
- 2026-11-09〜15、毎日3時間。目的は生徒の理解・定着・成績の向上で、問題数を目標にしない。
- 機能ブランチを作る。実装担当と独立監査担当は別のエージェントにする。必須の指摘は新しいコミットで直して再監査する。
- **禁止**：mainへのマージ、本番公開、デプロイ設定の変更、有料API、学習データの外部送信。定期実行の導入には承認と開始時刻の指定が必要で、まだ指定されていない（何も登録していない）。
- 実行していない時間・検査を、実施済みと書かない。学校の成績への効果を断定しない。
- 報告では「開発環境で確認したこと」と「本番・実機で確認したこと」を分ける。
