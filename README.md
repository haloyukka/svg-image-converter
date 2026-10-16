# SVG Image Converter

**ビルド不要の静止画変換・検証版です。要求された全機能の完成版ではありません。**

SVGをブラウザ内で処理し、PNG / JPEG / WebP / GIF（静止画）/ BMP / TIFF / ICOへ変換するソースです。AVIFはブラウザが生成できる場合のみ有効です。アニメーション、JavaScript実行、外部参照の許可読み込みは未対応のため、該当SVGはエラーになります。全初期版要求は要件定義書に残しています。

## 資料

- [要件定義書・要求追跡表](docs/requirements.md)
- [AI向け実装依頼プロンプト](docs/implementation-prompt.md)
- [技術検証結果・未達項目](docs/validation.md)
- samples/ に提供いただいた5SVGを同梱

## GitHub Pagesで使う

1. ZIPを展開し、このフォルダ直下のindex.html、css/、js/、.nojekyllをリポジトリのルートへ配置します。要件定義書なども同じリポジトリで管理できます。
2. GitHubのSettings → Pagesで、Deploy from a branch、main、/(root)を選び保存します。
3. 発行されたHTTPSのURLを開きます。ビルド・npm install・APIキーは不要です。

本検証版の公開は任意です。ブラウザ実機検証と残要求の実装が完了するまで、完成版として扱わないでください。

### ローカルで確認する場合

ES Modulesのため、ファイルのダブルクリックではなくHTTP経由で開きます。Pythonがある場合:

```sh
python -m http.server 8000
```

ブラウザで http://localhost:8000 を開きます。これは開発確認用で、本番はGitHub Pagesです。

## 操作

1. SVGを追加するかコードを貼り付けます。
2. 全体または各SVGの設定を選び、寸法・形式・背景等を指定します。
3. 「プレビュー」で設定を確認して「変換する」。
4. 個別保存、ZIP保存、コピーを選びます。コピーはPNGです。
5. 設定を再利用する場合はJSONで保存します。背景画像は読込時に再選択してください。

GIFは256色/二値透過、BMPとJPEGは透過を白に合成します。TIFF/ICO等のブラウザ表示非対応時は、保存後に対応ビューアで確認してください。形式ごとの再現限界は要件定義書に記載しています。

入力・結果はタブを閉じると破棄されます。履歴はファイル名、時刻、設定、成否だけ保存します。全削除も可能です。

## テスト

実装は外部ライブラリに依存しません。テストにはNode.js、画像読み戻しにはPython Pillowが必要です。

```sh
node --test tests/*.test.mjs
python tests/verify_images.py
```

ブラウザ試験手順はdocs/validation.mdを参照してください。Nodeテストをブラウザ実機試験の代用として扱いません。
