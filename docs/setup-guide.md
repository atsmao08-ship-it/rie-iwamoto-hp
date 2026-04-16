# RIE IWAMOTO HP — セットアップガイド

このガイドでは、予約フォームの自動処理（GAS）、LINE通知、Googleカレンダー連携、Vercelへの公開までの手順を説明します。

---

## ① Google Apps Script（GAS）のデプロイ手順

### 1. Googleスプレッドシートを作成する

1. [Google Drive](https://drive.google.com) を開き、「新規」→「Googleスプレッドシート」をクリック
2. スプレッドシートに名前をつける（例：「RIE予約データ」）
3. URLを確認する  
   例: `https://docs.google.com/spreadsheets/d/【ここがシートID】/edit`
4. `【ここがシートID】` の部分をメモしておく（後で使います）

---

### 2. Apps Scriptプロジェクトを作成する

1. 作成したスプレッドシートを開き、メニューの「拡張機能」→「Apps Script」をクリック
2. Apps Script エディタが開く
3. 左側に表示されている「コード.gs」の内容をすべて削除する
4. `gas/code.gs` の内容をすべてコピーして貼り付ける
5. ファイルの上部にある `CONFIG` オブジェクトを編集する（後述）

---

### 3. CONFIG に値を設定する

```javascript
const CONFIG = {
  SHEET_ID: 'ここにスプレッドシートIDを貼り付け',
  LINE_TOKEN: 'ここにLINEアクセストークンを貼り付け',
  LINE_USER_ID: 'ここにあなたのLINEユーザーIDを貼り付け',
  CALENDAR_ID: 'ここにGoogleカレンダーIDを貼り付け',
};
```

※各値の取得方法は ②③④ を参照してください

---

### 4. Webアプリとしてデプロイする

1. エディタ右上の「デプロイ」ボタンをクリック→「新しいデプロイ」を選択
2. 「種類の選択」の横にある歯車アイコンをクリック→「ウェブアプリ」を選択
3. 以下のように設定する：
   - **説明**: 予約フォーム受信（任意）
   - **次のユーザーとして実行**: 「自分（自分のGoogleアカウント）」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」ボタンをクリック
5. 「アクセスの承認が必要です」と表示されたら「アクセスを承認」をクリック
   - Googleアカウントの選択 → アカウントを選択
   - 「このアプリはGoogleで確認されていません」と表示されたら「詳細」をクリック → 「（プロジェクト名）に移動（安全でないページ）」をクリック → 「許可」をクリック
6. 「デプロイを更新しました」と表示され、**ウェブアプリのURL**が表示される
7. このURLをコピーしてメモしておく  
   例: `https://script.google.com/macros/s/AKfycb.../exec`

---

### 5. main.js にURLを設定する

`js/main.js` の先頭にある以下の行を編集する：

```javascript
// 変更前
const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// 変更後（コピーしたURLに置き換え）
const GAS_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

---

### 6. 動作テストをする

1. Apps Scriptエディタで関数の選択ボックスから「testWithSampleData」を選択
2. 「実行」ボタンをクリック
3. 実行ログを確認する（✓ マークが3つ出れば成功）
4. スプレッドシートに「テスト 花子」のデータが追加されているか確認
5. LINEにテスト通知が届いているか確認
6. Googleカレンダーにテスト予定が追加されているか確認

---

### 7. GASを修正した場合の再デプロイ

コードを変更した場合は必ず再デプロイが必要です：
1. 「デプロイ」→「デプロイを管理」をクリック
2. 鉛筆アイコン（編集）をクリック
3. 「バージョン」を「新しいバージョン」に変更
4. 「デプロイ」をクリック
5. URLは変わらないので main.js の変更は不要

---

## ② LINE Messaging API トークン取得手順

### 1. LINE Developersコンソールにアクセス

1. [LINE Developers](https://developers.line.biz/ja/) を開く
2. 「ログイン」→ LINE アカウントでログイン（RIEさんのLINEアカウント）

### 2. プロバイダーとチャネルを作成

1. 「プロバイダー」→「作成」をクリック
2. プロバイダー名を入力（例：「RIE IWAMOTO」）→「作成」
3. 「チャネル設定」タブで「Messaging API」をクリック
4. 以下を入力：
   - チャネルの種類：Messaging API
   - プロバイダー：作成したプロバイダー
   - チャネルアイコン：任意
   - チャネル名：例「RIE IWAMOTO 予約通知」
   - チャネル説明：任意
   - 大業種：「美容・コスメ」
   - 小業種：「美容院・ヘアサロン」
5. 「作成」をクリック

### 3. チャンネルアクセストークンを発行する

1. 作成したチャネルの「Messaging API設定」タブを開く
2. 一番下までスクロールして「チャンネルアクセストークン（長期）」の「発行」ボタンをクリック
3. 表示されたトークンをコピーして GAS の `LINE_TOKEN` に設定する

### 4. 自分のユーザーIDを確認する

1. 「チャネル基本設定」タブを開く
2. 「あなたのユーザーID」という項目を探す（`U` から始まる文字列）
3. このIDをコピーして GAS の `LINE_USER_ID` に設定する

### 5. LINEアカウントをBotと友達になる

1. 「Messaging API設定」タブの QRコードから、RIE さん自身のLINEで Botを友達追加する
2. これをしないと通知を受け取れません

---

## ③ Googleカレンダー カレンダーID 取得手順

### 1. 専用カレンダーを作成する（推奨）

1. [Googleカレンダー](https://calendar.google.com) を開く
2. 左側の「他のカレンダー」の「+」ボタンをクリック→「新しいカレンダーを作成」
3. 名前を入力（例：「RIE 予約」）→「カレンダーを作成」をクリック

### 2. カレンダーIDを確認する

1. 作成したカレンダー名にマウスオーバーして「︙」（縦3点）をクリック
2. 「設定と共有」をクリック
3. 「カレンダーの統合」セクションに「カレンダーID」が表示される
   - 自分のメインカレンダーの場合：Googleアカウントのメールアドレス（例：`rie@gmail.com`）
   - 新しく作成したカレンダーの場合：`xxxxx@group.calendar.google.com` の形式
4. このIDをコピーして GAS の `CALENDAR_ID` に設定する

### 3. GASがカレンダーにアクセスできるようにする

- 「設定と共有」の「特定のユーザーとの共有」に、GASを実行するGoogleアカウントが登録されている必要があります
- 自分のGoogleアカウントでGASを実行する場合、自分のカレンダーには自動的にアクセスできます

---

## ④ Vercel へのデプロイ手順

### 方法A：Vercel CLI を使う（コマンドライン）

#### 事前準備
- Node.js のインストール（https://nodejs.org/ja/ からダウンロード）
- Vercel アカウントの作成（https://vercel.com でGitHubアカウントなどで登録）

#### 手順

1. Windows の「コマンドプロンプト」または「PowerShell」を開く

2. Vercel CLI をインストールする
```
npm install -g vercel
```

3. プロジェクトフォルダに移動する
```
cd "C:\Users\atsma\OneDrive\Desktop\美容室　HP作成"
```

4. Vercel にログインする
```
vercel login
```
ブラウザが開くのでメールアドレスを入力してログイン

5. デプロイする
```
vercel
```
以下の質問に答える：
- `Set up and deploy "美容室　HP作成"?` → Y
- `Which scope do you want to deploy to?` → 自分のアカウントを選択
- `Link to existing project?` → N
- `What's your project's name?` → `rie-iwamoto` など入力
- `In which directory is your code located?` → そのまま Enter

6. デプロイ完了後、URLが表示される（例：`https://rie-iwamoto.vercel.app`）

7. 本番公開する
```
vercel --prod
```

---

### 方法B：GitHubを使う（ドラッグ&ドロップ）

1. [GitHub](https://github.com) でアカウントを作成してログイン
2. 「New repository」→ リポジトリ名を入力（例：`rie-iwamoto-hp`）→「Create repository」
3. 「uploading an existing file」リンクをクリック
4. プロジェクトフォルダ内のファイルをすべてドラッグ&ドロップ
5. 「Commit changes」をクリック

6. [Vercel](https://vercel.com) にアクセスしてログイン
7. 「Add New Project」→「Import Git Repository」→ 作成したGitHubリポジトリを選択
8. 設定はデフォルトのまま「Deploy」をクリック
9. デプロイ完了後、公開URLが表示される

---

### 独自ドメインの設定（任意）

1. Vercel の「Settings」→「Domains」を開く
2. 「Add」でドメインを入力（例：`rie-iwamoto.com`）
3. 表示されたDNSレコードを、ドメイン管理会社のDNS設定に追加する

---

## まとめ：設定の流れ

```
1. GAS コードをデプロイしてURLを取得
       ↓
2. js/main.js の GAS_URL を更新
       ↓
3. LINE Developers でトークン・UserIDを取得 → GAS の CONFIG に設定
       ↓
4. Google カレンダーIDを取得 → GAS の CONFIG に設定
       ↓
5. GAS を再デプロイ
       ↓
6. testWithSampleData() で動作確認
       ↓
7. Vercel でサイトを公開
```

---

## よくあるトラブル

| 症状 | 原因 | 解決方法 |
|------|------|---------|
| 予約送信後にスプレッドシートに記録されない | GAS_URL が未設定 or デプロイ設定が「自分のみ」 | GAS_URLを設定、デプロイ時に「全員」を選択 |
| LINE通知が届かない | BotをLINEで友達追加していない | QRコードでBot友達追加 |
| カレンダーに予定が追加されない | CALENDAR_ID が間違っている | Googleカレンダーの設定から正確なIDをコピー |
| 管理画面にログインできない | パスワードを変更していない | js/admin.js の `CONFIG.PASSWORD` を確認 |
| Vercelデプロイ後に表示が崩れる | CSSパスが相対パスで正しい | index.html の `<link href="css/style.css">` が正しいか確認 |
