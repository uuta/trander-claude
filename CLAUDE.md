# Trander - Claude Development Context

このプロジェクトは以下の構成で管理されています：

## 📋 プロジェクト設計書
- **[PROJECT_REQUIREMENTS.md](./docs/PROJECT_REQUIREMENTS.md)** - ビジネス要件・機能仕様
- **[CODING_GUIDELINES.md](./docs/CODING_GUIDELINES.md)** - 開発標準・コーディング規約  
- **[DEVELOPMENT_SETUP.md](./docs/DEVELOPMENT_SETUP.md)** - 開発環境構築・コマンド集
- **[LLM_GUIDELINES.md](./docs/LLM_GUIDELINES.md)** - AI アシスタント向けガイドライン

## 🎯 プロジェクト概要
ユーザーの現在地から200km以内、または世界中のランダムな場所を発見できるロケーション探索アプリケーション

## 🛠️ 主要技術
- **TypeScript** + **Vite** + **Netlify**
- **APIs**: Geoapify Places API, GeoDB Cities API
- **UI**: ダークモード、ピンク・グリーンカラーテーマ

## 📦 主要コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド  
npm start        # レガシー開発環境
```

## 🔧 開発時の注意点
- 環境変数 `VITE_GEOAPIFY_API_KEY`, `VITE_GEODB_CITIES_API_KEY` が必要
- 位置情報拒否時は東京座標をフォールバック
- TypeScript型安全性を重視
- 地図表示なし（テキスト・画像のみ）

---
**詳細な要件や開発ガイドラインは上記の専用ファイルを参照してください。**
