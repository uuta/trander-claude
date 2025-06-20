# Trander - Development Setup

## 初期セットアップ

### 1. 依存関係のインストール
```bash
yarn install
```

### 2. 環境変数の設定
`.env` ファイルを作成：
```bash
VITE_GOOGLE_CLOUD_API_KEY=your_google_places_api_key_here
VITE_GEODB_CITIES_API_KEY=your_geodb_cities_api_key_here
```

## 開発コマンド

### 開発サーバー起動
```bash
# Vite開発サーバー（推奨）
yarn dev

# レガシー: TypeScript + Python サーバー
yarn start
```

### ビルド関連
```bash
# 本番ビルド
yarn build

# ビルド結果のプレビュー
yarn preview

# TypeScript コンパイルのみ
yarn tsc

# TypeScript 監視モード
yarn tsc:watch
```

## API キー取得方法

### Google Places API
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Places API を有効化
3. API キーを作成・取得
4. API キーにリファラー制限を設定（セキュリティのため）

### GeoDB Cities API
1. [RapidAPI](https://rapidapi.com/) でアカウント作成
2. [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities) にサブスクライブ
3. API キーを取得
4. 月1,000リクエスト無料

## Netlify デプロイ

### 1. Netlify アカウント設定
1. [Netlify](https://netlify.com) でアカウント作成
2. GitHub リポジトリと連携

### 2. ビルド設定
- **Build command**: `yarn build`
- **Publish directory**: `dist`
- **Node version**: 18

### 3. 環境変数設定
Netlify dashboard で以下を設定：
```
VITE_GOOGLE_CLOUD_API_KEY=your_api_key
VITE_GEODB_CITIES_API_KEY=your_api_key
```

## トラブルシューティング

### 位置情報取得エラー
- ブラウザで位置情報を許可
- HTTPS環境での実行が必要
- 拒否時は東京座標をフォールバック

### API エラー
- API キーの確認
- リクエスト制限の確認
- CORS エラーの場合はプロキシ設定

### ビルドエラー
```bash
# node_modules をクリア
rm -rf node_modules yarn.lock
yarn install

# TypeScript エラーチェック
yarn tsc
```

### 開発サーバーエラー
```bash
# ポート競合の場合
yarn dev --port 3001

# キャッシュクリア
rm -rf .vite node_modules/.vite
```

## 開発ツール

### VSCode 推奨拡張機能
- TypeScript Importer
- ES6 String HTML
- Auto Rename Tag
- Prettier
- ESLint

### ブラウザ開発者ツール
- Console でJavaScript エラーチェック
- Network タブでAPI リクエスト監視
- Application タブでLocalStorage 確認

## パフォーマンス確認
```bash
# バンドルサイズ分析
yarn build
yarn dlx vite-bundle-analyzer dist

# Lighthouse監査
yarn preview
# DevTools > Lighthouse で分析
```

## ファイル監視・自動リロード
```bash
# Vite で自動リロード
yarn dev

# TypeScript ファイル監視
yarn tsc:watch
```

## デバッグのコツ
1. ブラウザ Console でエラーチェック
2. Network タブでAPI レスポンス確認
3. `console.log` での変数確認
4. TypeScript エラーの早期発見
