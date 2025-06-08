# Trander - Project Requirements

## プロジェクトの概要
世界中のランダムな場所を発見できるロケーション探索アプリケーションです。

## ユースケース
- 新しい場所を探してるけど面倒臭いな・・・
- ランダムに場所を提案してもらいたいな
- 旅行先で近くの観光スポットを発見したい
- 世界中の興味深い場所を探索したい

## 機能要件

### 機能1: 現在地からのロケーション取得
- ユーザーがボタンを押すと、現在地から200km以内のランダムな場所を提案
- 提案される場所は一度に一つで、場所名、写真、詳細情報を表示
- ユーザーに現在地の取得許可を要求
- カテゴリ選択機能（観光、飲食、エンターテイメント等）

### 機能2: 全世界からのランダムロケーション取得
1. **都市選択**: ユーザーが国を選択
2. **都市取得**: GeoDB Cities APIでランダムな都市を取得
   - 人口10万人以上の主要都市に限定
   - 都市名、国名、人口、座標を取得
3. **施設検索**: Google Places APIで都市周辺の施設を検索
   - 半径5km圏内で検索（ユーザーは設定で半径を変更できる）
   - ホテル、商業施設、観光スポット等を取得
4. **表示**: 都市情報と施設情報をテキスト・画像形式で表示

### 機能3: お気に入り機能
- ロケーションをお気に入りに登録
- お気に入り一覧の閲覧
- LocalStorageで永続化

### 機能4: 共有機能
- SNSやメールで場所情報を共有
- ネイティブ共有API対応

## 技術要件

### API仕様
1. **Google Places API** - 施設検索
   - **Nearby Search**: 現在地周辺の施設検索
     ```
     https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lng}&radius={radius}&type={type}&key={apiKey}
     ```
   - **Place Details**: 施設の詳細情報取得
     ```
     https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&fields={fields}&key={apiKey}
     ```
   - **Place Photos**: 施設の写真取得
     ```
     https://maps.googleapis.com/maps/api/place/photo?maxwidth={width}&photo_reference={photoReference}&key={apiKey}
     ```

2. **GeoDB Cities API** - 世界都市データ（RapidAPI経由）
   ```
   https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds={countryCode}&minPopulation=100000&limit=10
   ```

### 制約事項
- Google Nearby Search (New / Pro SKU) → 月 5,000 リクエストまで無料
- Google Place Details Photos (新しいフォトエンドポイント / Enterprise SKU) → 月 1,000 リクエストまで無料
- GeoDB Cities APIは月1,000リクエスト無料制限
- 地図表示は行わない（テキスト・画像のみ）
- ブラウザの位置情報取得が拒否された場合は東京をデフォルトに設定

## デザイン要件
- ダークモードがベース
- メインカラー: ピンク
- アクセントカラー: 緑（ピンクの補色）
- シンプルでユニークな形状のUI要素
- 直感的で使いやすいインターフェース
- レスポンシブデザイン

## 非機能要件
- TypeScript での型安全性
- Vite でのモダンなビルドツール
- Netlify での簡単デプロイ
- 環境変数でのAPI キー管理
- CORS 対応
- エラーハンドリング
