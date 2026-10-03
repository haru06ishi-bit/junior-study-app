# Cloudflare Pages 公開手順（Ver.0.8）

この版は `file://` で `index.html` を直接開く使い方ではなく、Cloudflare Pages の HTTPS URL で利用することを前提にしています。

## ダッシュボードから公開する場合

1. このフォルダを GitHub リポジトリへ配置します。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Git に接続します。
3. 対象リポジトリを選びます。
4. Framework preset は `None`。
5. Build command は空欄。
6. Build output directory は `/` またはリポジトリのルートを指定します。
7. Deploy を実行します。
8. 発行された `https://...pages.dev/` を開きます。

## Wrangler を使う場合

```bash
npx wrangler pages deploy . --project-name junior-study-app
```

## 公開後の確認

紙登録 → 動作環境チェックで以下がすべて ✓ になっていることを確認します。

- HTTPS / 安全な接続
- カメラ利用条件
- 起動方法

その後、PDFを選択し、プレビューに本文が表示されることを確認してからOCRを実行します。

## セキュリティ方針

- 選択したPDF・画像そのものを外部OCR APIへ送信しません。
- PDF.js と Tesseract.js はブラウザ内で処理します。
- 初回利用時にはライブラリ・日本語OCR言語データを外部配信元から取得します。
- カメラ権限はブラウザが管理し、ユーザー操作時だけ要求します。

## Ver.0.11: AI解説を有効にする

Cloudflare Dashboardの Pages project → Settings → Bindings から Workers AI binding を追加し、Variable nameを `AI` にしてください。設定後は再デプロイが必要です。

AI bindingを設定しなくても、AI解説以外の機能は利用できます。


## PWA確認
デプロイ後、`https://study.mytools-lab.com/manifest.webmanifest` と `https://study.mytools-lab.com/sw.js` が開けることを確認してください。PWAはHTTPS上でのみService Workerを登録します。

## v0.20.1 更新

- 教科書設定は採択地区の自動設定後に、各教科・分冊ごと手動変更できます。
- 手動変更はブラウザ内の設定に保存され、出題条件にも反映されます。
- 紙から登録する問題は「共通問題」または「現在設定中の教科書に限定」を選べます。
