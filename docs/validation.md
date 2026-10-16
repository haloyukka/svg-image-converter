# 技術検証結果

実施日: 2026-10-17 / 実装状態: 静止画中心の検証版。**要求された全初期版機能は未完成**。

## 提供ファイルの確認

assets.zip内のSVG5件を検査。幅はいずれも880px、全て静止画。JavaScript、SMIL、CSSアニメーション、外部参照は検出されなかった。日本語を含み、Yu Gothic UI / Meiryo / Hiragino Sans / sans-serifを指定。Linux検証環境とWindowsのフォント結果が同じとは限らない。

|ファイル|寸法|
|---|---|
|01_overview.svg|880×500|
|02_setup_flow.svg|880×560|
|03_permission_modes.svg|880×440|
|04_work_cycle.svg|880×400|
|05_choose_tool.svg|880×500|

## 実施済み

|試験|結果|限界|
|---|---|---|
|JavaScript構文検査|app.js / svg.js / encoders.js成功|ブラウザ機能の実行検証ではない|
|Node標準テスト7件|全件成功|Canvasネイティブ出力は一部モック|
|BMP/TIFF/GIFをPillowで独立デコード|成功、寸法・赤画素・透過確認|小規模データ中心|
|64×64 GIFのLZW辞書リセット|デコード成功|長尺動画の試験ではない|
|ZIP Unicode/CRC|Python zipfileで成功|ZIP64非対応|
|ICOディレクトリ|複数サイズのオフセット/256サイズ表記成功|Windows実ビューア試験未実施|
|不正MIMEフォールバック|PNGをAVIFとして誤成功させないことを確認|AVIF生成自体は未確認|
|DOMシミュレーション|Happy DOM＋NAPI Canvasで提供5SVGを解析・PNG変換、5成功履歴、日英切替、履歴上限成功|**実ブラウザ試験ではない**。描画エンジン・フォント・API差あり|
|拒否パターン|script / onイベント / 外部image / SMIL / foreignObject / CSS import / 不正XML / 巨大寸法を拒否|全SVG構文に対する完全な互換性/安全性の証明ではない|

テスト用の生成ファイルはtests/generated/に格納。Happy DOMとNAPI Canvasは検証環境のみに導入し、ツール実行時の依存ではない。

## 実施できなかった検証

実ブラウザ自動試験を準備したが、Playwright用Chromiumのダウンロードが破損したデータとして返され、起動できなかった。別バージョンでも同じ結果であり、ネットワーク取得の制約として記録する。したがって、ブラウザ上の視覚QA、Windows/Mac/Android/iPhone実機試験、Clipboard、Canvasの実ブラウザ固有差、GitHub Pages公開URLの確認は未実施。公開操作も行っていない。

## 再実行

```sh
node --test tests/*.test.mjs
python tests/verify_images.py
python -m http.server 8000
```

実ブラウザで http://localhost:8000/tests/browser-smoke.html を開くと、提供5SVGのPNG生成と拒否入力のスモーク試験を実行できる。index.htmlでは操作/視覚試験を別途行う。

## 一次資料から確認した設計制約

- SVGの画像コンテキストではJavaScriptが無効で、外部リソースの読み込みにも制限がある。この方式だけでJS動画・外部画像要求を満たせない。
- Canvasの未対応出力形式はPNGへフォールバックし得るため、要求したMIMEと生成Blob.typeが一致しなければ失敗として扱う。
- GitHub Pagesは静的ファイルを配信する。サーバー変換への逃げ道を前提としない。

参考URLはrequirements.md末尾。候補ライブラリの採用試験は未実施であり、「候補」を「対応済み」と扱わない。

## 次に解決すべき項目

1. G01〜G05: SMIL/CSS/JSの時刻制御・隔離・外部参照の許可制、GIF/WebP/APNG動画。
2. AVIFエンコーダーの確保と少なくとも1環境での実出力。
3. 総メモリ予算の実測適応、Worker化と即時中断、タイムアウト、エラー後の解放。
4. ファイル別背景画像の保持、同名SVGのプリセット識別、再試行の二重結果防止。
5. 英語エラーの整備、読み上げ/フォーカス/ショートカット監査。
6. 8環境以上の実機行列と描画比較。未対応機能には理由と利用可能環境を案内。

要求は全て初期版に保持する。以上を満たすまで「全要求対応済み」「完成版」と判定しない。
