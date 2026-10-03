# 30分スタディ Ver.0.13

中学生向けの小テスト・定期テスト対策Webアプリです。Cloudflare Pages（HTTPS）での利用を前提にしています。

## Ver.0.13 の変更

- AI解説を「要点 / なぜ？ / 覚え方・考え方 / 間違えやすい点」の4ブロック表示に変更
- AI解説の改行・段落・箇条書きを読みやすく整形

## Ver.0.11 の変更

- 定期テストの出題範囲で単元を選んでも、その教科パネルを開いたままに変更
- 通常解説に加えて「AIで詳しく解説」を追加
- AI解説はユーザーがボタンを押したときだけ実行
- AIへ送信するのは、問題文・正解・教科・学年・必要な場合の選択肢のみ
- 氏名、テスト名、OCR全文、学習履歴、ユーザーIDはAI解説APIへ送信しない
- AI呼び出しはCloudflare Pages Function経由で行い、ブラウザへAPIキーを置かない
- AIが利用できない場合も、既存の解説だけで学習を継続可能

## Cloudflare Workers AI の設定

Ver.0.11のAI解説を使うには、Cloudflare PagesプロジェクトにWorkers AI bindingを追加してください。

1. Cloudflare Dashboardで対象のPagesプロジェクトを開く
2. Settings → Bindingsへ進む
3. Workers AIを追加
4. Variable nameを `AI` にする
5. 保存後にPagesを再デプロイする

`wrangler.toml` にも次の設定を含めています。

```toml
[ai]
binding = "AI"
```

AI bindingを設定しなくても、小テスト・定期テスト・OCR・通常解説は利用できます。「AIで詳しく解説」だけが利用できません。

## AI解説で送信しないデータ

AI解説エンドポイント `/api/explain` は、ブラウザから送信された問題文と正解など学習に必要な最小限の内容だけを受け取ります。登録済みテスト名、氏名欄、OCRの元画像/PDF、学習履歴は送信しません。

## 公開

GitHub連携済みのCloudflare Pagesであれば、ファイル更新後に以下で反映できます。

```bash
git add .
git commit -m "Add optional AI explanations and keep exam subject open"
git push
```

## Ver.0.13 今日の30分
- 最も近い定期テストがある場合、その出題範囲を自動優先します。
- 20問を目安に、苦手・未学習・復習を組み合わせます。
- ホームで問題の内訳、教科別出題数、今日の学習問題数を確認できます。
- 定期テストがない場合は全問題バンクから苦手・未学習を優先します。


## PWA / ホーム画面追加 (v0.13)
- `manifest.webmanifest` と Service Worker を追加。
- Android/対応ブラウザではアプリ内の「ホーム画面に追加」からインストール可能。
- iPhone/iPadではSafariの共有メニュー → 「ホーム画面に追加」を案内。
- ホーム画面から起動すると standalone 表示になる。
- 通知機能は使用しない。
- 基本画面・問題データはキャッシュするが、OCR/PDF用の外部ライブラリやAI解説はオンライン接続が必要。
