# 30分スタディ Ver.0.8

中学生向けの小テスト・定期テスト対策Webアプリです。

## Ver.0.8 の変更

- Cloudflare Pages / HTTPS 前提へ移行
- `START_APP.bat` を廃止
- PDF.js のWorker、CMap、標準フォントをHTTPS配信環境向けに整理
- PDF関連アセットのCDNを2系統にしてフォールバック可能に変更
- OCRライブラリも2系統の配信元へフォールバック
- 紙登録画面に動作環境チェックを追加
- `file://` で直接開いた場合はPDF/OCR非対応であることを明示
- Cloudflare Pages用 `_headers`、`_redirects`、`wrangler.toml` を追加

## 重要

この版は `index.html` を直接ダブルクリックして使用しません。
Cloudflare Pagesへ公開した `https://...pages.dev/` などのURLから利用してください。

公開方法は `CLOUDFLARE_DEPLOY.md` を参照してください。

## データとプライバシー

学習履歴・苦手問題・追加した問題は現在ブラウザのLocalStorageへ保存します。同じURLでも別端末には自動同期されません。
