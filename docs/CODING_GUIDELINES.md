# Trander - Coding Guidelines

## 技術スタック
- **Language**: TypeScript
- **Build Tool**: Vite
- **Deployment**: Netlify
- **CSS**: Vanilla CSS with CSS Variables
- **APIs**: Google Places API, GeoDB Cities API

## ファイル構成
```
/
├── src/
│   ├── app.ts          # メインアプリケーションロジック
│   └── types.ts        # TypeScript型定義
├── index.html          # エントリーポイント
├── styles.css          # スタイルシート
├── vite.config.js      # Vite設定
├── netlify.toml        # Netlify設定
├── tsconfig.json       # TypeScript設定
└── package.json        # 依存関係・スクリプト
```

## コーディング規約

### TypeScript
- 型安全性を最優先
- 明示的な型定義を使用
- `any` 型の使用を避ける
- インターフェースで型を定義
- 関数の戻り値型を明示
- API KEYなどの環境変数は必ず.env等で管理すること（絶対にハードコーディングしない）

```typescript
// Good
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // implementation
}

// Bad
function calculateDistance(lat1, lon1, lat2, lon2) {
  // implementation
}
```

### 命名規則
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **インターフェース**: PascalCase
- **ファイル**: kebab-case または camelCase

### 関数設計
- 単一責任の原則
- 純粋関数を心がける
- async/await でのエラーハンドリング

```typescript
// Good
async function searchNearbyPlaces(lat: number, lon: number): Promise<GooglePlace[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}
```

### DOM操作
- 型安全なDOM要素取得
- null チェックの実装
- イベントリスナーの適切な管理

```typescript
// Good
const button = document.getElementById('discover-btn') as HTMLButtonElement;
if (button) {
  button.addEventListener('click', handleClick);
}
```

### CSS設計
- CSS変数でテーマ管理
- BEMライクなクラス命名
- レスポンシブデザイン

```css
/* CSS Variables */
:root {
  --primary-color: #e91e63;
  --secondary-color: #4caf50;
  --background-dark: #1a1a1a;
}

/* Component-based naming */
.search-mode-selector { }
.mode-tab { }
.mode-tab--active { }
```

## API設計パターン

### 環境変数管理
```typescript
const API_KEY: string = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || "fallback_key";
```

### エラーハンドリング
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API Error:', error);
  showError(user_friendly_message);
  throw error;
}
```

### 状態管理
- グローバル変数は最小限
- LocalStorage で永続化
- 型安全な状態更新

## API統合パターン

### CORS対応
- ブラウザから直接呼び出せないAPI（Google Places API等）の場合：
  1. **開発環境**: サーバープロキシを実装
  2. **本番環境**: Netlify Functionsを使用
  3. **代替案**: 対応するJavaScript SDKの使用を検討

### プロキシ実装の優先順位
1. Netlify Functions（本番とdev/prodパリティ）
2. 開発サーバーのプロキシ（迅速な開発用）
3. JavaScript SDK（APIキーの露出を許容する場合）

## ビルド・デプロイ

### 開発環境
```bash
npm run dev          # Vite開発サーバー
npm start           # TypeScript + Python サーバー（レガシー）
```

### 本番ビルド
```bash
npm run build       # Vite本番ビルド
npm run preview     # ビルド結果のプレビュー
```

### Netlify設定
- 環境変数はNetlify dashboard で設定
- `dist` ディレクトリを publish
- セキュリティヘッダーを設定

## パフォーマンス最適化
- 画像遅延読み込み
- API リクエストの最適化
- CSS・JSの圧縮（Viteで自動）
- キャッシュ戦略

## セキュリティ
- API キーの環境変数管理
- CORS対応
- CSP（Content Security Policy）設定
- XSS対策

## テスト戦略
- 手動テストでの動作確認
- API エラーケースの検証
- 様々なデバイス・ブラウザでの確認
- 位置情報拒否時の動作確認

## Git運用
- 機能単位でのコミット
- わかりやすいコミットメッセージ
- main ブランチでの開発（小規模プロジェクト）
