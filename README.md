# Trander - ランダムロケーション探索アプリ

現在地から100km以内のランダムな場所を提案するWebアプリケーションです。

## セットアップ

1. Geoapify APIキーの取得
   - [Geoapify](https://www.geoapify.com/)でアカウントを作成
   - APIキーを取得

2. APIキーの設定
   - `.env.example`をコピーして`.env`ファイルを作成
   - `VITE_GEOAPIFY_API_KEY`に実際のAPIキーを設定
   ```bash
   cp .env.example .env
   # .envファイルを編集してAPIキーを設定
   ```

3. アプリケーションの起動
   ```bash
   # 開発サーバー起動
   npm run dev
   
   # または本番ビルド
   npm run build
   npm run preview
   ```

## 機能

- 現在地から100km以内のランダムな場所を提案
- 場所の詳細情報（名前、住所、距離、カテゴリ）を表示
- お気に入り登録機能（ローカルストレージに保存）
- SNSやメールでの共有機能
- レスポンシブデザイン（モバイル対応）

## 技術仕様

- HTML5 + CSS3 + TypeScript
- Geoapify Places API
- Geolocation API
- Local Storage API
- Web Share API（対応ブラウザのみ）

## 開発環境

```bash
# 依存関係のインストール
npm install

# TypeScriptのコンパイル
npm run build

# ウォッチモード（自動コンパイル）
npm run watch

# 開発サーバー起動（TypeScript自動コンパイル + サーバー起動）
npm run dev
```