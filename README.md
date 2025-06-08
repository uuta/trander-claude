# Trander - ランダムロケーション探索アプリ

現在地から200km以内、または世界中のランダムな場所を発見できるロケーション探索アプリケーションです。

## セットアップ

1. Google Places APIキーの取得
   - [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
   - Places API を有効化
   - APIキーを作成・取得

2. GeoDB Cities APIキーの取得
   - [RapidAPI](https://rapidapi.com/)でアカウントを作成
   - [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities)にサブスクライブ

3. APIキーの設定
   - `.env.example`をコピーして`.env`ファイルを作成
   - `VITE_GOOGLE_CLOUD_API_KEY`と`VITE_GEODB_CITIES_API_KEY`に実際のAPIキーを設定
   ```bash
   cp .env.example .env
   # .envファイルを編集してAPIキーを設定
   ```

4. アプリケーションの起動
   ```bash
   # 開発モード（TypeScript自動ウォッチ + サーバー起動）
   npm start
   
   # または個別に起動
   npm run dev    # TypeScript自動コンパイル（ウォッチモード）
   npm run server # Pythonサーバー起動
   
   # 本番ビルド
   npm run build
   ```

## 機能

### 機能1: 現在地からのロケーション取得
- 現在地から200km以内のランダムな場所を提案
- カテゴリ選択機能（観光、飲食、エンターテイメント等）

### 機能2: 全世界からのランダムロケーション取得
- 国を選択してランダムな都市を取得
- 都市周辺の施設を検索・表示

### 機能3: お気に入り機能
- ロケーションをお気に入りに登録
- お気に入り一覧の閲覧
- LocalStorageで永続化

### 機能4: 共有機能
- SNSやメールで場所情報を共有
- ネイティブ共有API対応

## 技術仕様

- HTML5 + CSS3 + TypeScript + Vite
- Google Places API
- GeoDB Cities API
- Geolocation API
- Local Storage API
- Web Share API（対応ブラウザのみ）

## 開発環境

```bash
# 依存関係のインストール
npm install

# 開発モード（推奨）
npm start              # TypeScript自動ウォッチ + サーバー起動

# 個別コマンド
npm run dev           # TypeScript自動コンパイル（ウォッチモード）
npm run server        # Pythonサーバーのみ起動
npm run build         # 本番用ビルド
```

**注意**: コンパイルされた`.js`ファイルはgitで追跡されません。ソースファイル（`.ts`）のみをコミットしてください。
