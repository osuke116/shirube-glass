# しるべ Glass

開いたらすぐ書ける、個人用の記録と資料検索アプリです。白を基調に、操作部分へLiquid Glassの透明感を取り入れています。

- その場で記録、日付・タグ・種類の追加、下書き保存
- 時系列、本文・タグ検索、月・種類・しおりで絞り込み
- 編集、ごみ箱、復元
- ログイン前は端末内保存。ChatGPTログイン後の記録はアカウント単位で同期
- 旧しるべのcatalog.json、Markdown、テキストを取り込み
- JSONのバックアップ・復元、Markdown・CSVの書き出し
- モバイルの下部ナビ、シート表示、全画面スケルトン、動きを減らす設定

## データの扱い

このリポジトリと配布物には個人の資料・会話・記録を含めません。テスト用資料は架空です。取り込んだ一覧はブラウザのIndexedDBに残り、クラウドへ送信しません。Markdownを「記録」として取り込む場合はログイン中に同期されます。原本のファイルは変更しません。

ブラウザからデスクトップ全体を自動で読むことはできません。旧しるべで一覧を更新し、catalog.jsonを取り込んでください。元の場所と日付の根拠を表示します。ファイル日時は実際の制作日や確定版を保証しません。ブラウザのデータを消す前にJSONバックアップを保存してください。

クラウド同期はSitesホスティングの認証を前提とします。公開URLでも未ログインのAPIリクエストは拒否し、ログインIDはサーバーで確定します。データはIDごとに分離します。外部AI、有料AI API、利用者によるAPIキー設定は使用しません。

## 採用した技術と理由

| 技術 | 理由・役割 |
| --- | --- |
| React 19 + TypeScript | 入力・検索・詳細・同期状態を一貫して扱い、記録データの型の取り違えを防ぐため。 |
| Vinext + Vite / Next互換のApp Router | Sitesの公式構成で、表示と認証付き保存を同じサイトにまとめ、速い開発プレビューとWorker配信を使うため。 |
| IndexedDB | 数千件の資料や長い本文を端末に保存するため。保存成功後に完了を表示し、通信が途切れても入力を守るため。 |
| localStorage | 軽い下書きと表示設定だけを即時に保存するため。大量の資料は入れない。 |
| Cloudflare Workers + D1 | ログインした人の記録を端末間で同期するため。ユーザーIDをすべてのクエリに含め、版番号で同時編集を検出する。 |
| Sites標準ChatGPT認証 | 独自パスワード管理や利用者のAPIキーの準備を不要にするため。 |
| Drizzle | 保存先の構造を明示し、SQLマイグレーションを版管理するため。 |
| CSS / TailwindのVite連携 | ぼかし、光の縁、透明感、シート・ナビ・カードの動きを軽く実装するため。アニメーション専用ライブラリは増やさない。 |
| Lucide React | 小さい画面でも役割を伝える、一貫したアイコンを使うため。 |
| Web App Manifest + PNGアイコン | iPhone・Androidのホーム画面に追加した際の名前、アイコンと独立表示を指定するため。インストールやオフライン再起動を保証するものではない。 |
| Node標準テスト / SQLite | 追加のテスト用依存を増やさず、取り込みと競合保護、ユーザー分離を検証するため。 |
| GitHub + Sites | 読めるソース公開と、実際に使えるアプリの公開を両立するため。 |

端末に保存した後に同期します。同時編集では最新のクラウド版と端末側の別案を両方残します。資料ファイル本体のクラウド同期、添付ファイル、外部AIによる自動要約は実装していません。

## デザインの参考

[NameThatUI Liquid Glass](https://namethatui.com/styles/liquid-glass)を参照し、ナビゲーションと操作部分にガラス表現を使い、読む本文は不透明な面で読みやすくしました。[Skeleton & Spinner](https://namethatui.com/web/skeleton-spinner)、[Bottom Navigation](https://namethatui.com/web/bottom-navigation)、[Dialog / Drawer / Sheet](https://namethatui.com/web/dialog-drawer-sheet)も参照しています。

スケルトン表示中も記録欄は操作できます。読み込み完了・エラーでスケルトンを解除し、見せるための待ち時間は設けません。端末の動きを減らす設定と、アプリ内の切り替えを尊重します。

## 開発

Node 24で検証。依存関係はpackage-lock.jsonに固定しています。

```sh
npm ci
npm run db:generate # スキーマ変更時のみ
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_useful_warhawk.sql
npm run dev
```

開発時のログインはローカルの模擬アカウントです。本番の認証とは異なります。公式のsites()連携を保って公開してください。他のホスティング環境で認証ヘッダーをそのまま信頼しないでください。

```sh
node --test tests/model.test.mjs
npx tsc --noEmit
```

クラウド保存のスキーマはdb/schema.ts、マイグレーションはdrizzle/です。ローカルマイグレーションは同じファイルを繰り返し実行しないでください。本番ではSites公開時に別途適用されます。

## スマホで使う

公開URLをスマホのSafariで開き、共有メニューから「ホーム画面に追加」を選べます。アイコンが古い場合は登録をやり直してください。記録の同期には同じChatGPTアカウントでログインします。資料一覧はJSONバックアップで各端末へ取り込みます。localhostのURLはスマホから接続できません。

アイコンの編集元はpublic/app-icon.svg、画面用のシンボルはpublic/brand-mark.svg、横組みロゴはpublic/logo.svgです。iPhone用180pxと192px・512px・1024pxのPNGも収録しています。
