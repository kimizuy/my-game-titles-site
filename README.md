# Switch Mystery Cards

このサイトは「Nintendo Switchのソフトを一覧できるサイト」です。カードにカーソルを合わせるとパッケージ画像が表示され、どんなゲームか想像する楽しさを提供します。

## 主な特徴

- **Nintendo Switchゲームの一覧表示**: 多数のNintendo Switchソフトを閲覧できます
- **パッケージ画像の表示**: カードにカーソルを合わせるとアニメーションとともにパッケージ画像が表示されます
- **想像する楽しさ**: ゲームのパッケージを隠すことで、どんなゲームかを想像する楽しさを提供します
- **最新のデータ**: [IGDB API](https://www.igdb.com/)から最新のゲーム情報を取得し、ほぼ全てのNintendo Switchソフトを網羅しています

## 技術スタック

### フロントエンド

- React 19
- TypeScript

### UI/スタイリング

- Tailwind CSS
- shadcn/ui
- @tailwindcss/typography
- View Transition API

### アニメーション

- motion

### データ検証

- arktype

### ルーティング

- React Router 7
- @react-router/fs-routes
- @react-router/node

### API連携

- IGDB API

### 開発環境

- Vite
- TypeScript
- Biome

## 開発環境のセットアップ

### 前提条件

- Node.js 22以上がインストールされていること
- npmがインストールされていること

### インストール手順

1. リポジトリをクローンする

```bash
git clone https://github.com/kimizuy/my-game-titles-site.git
cd my-game-titles-site
```

2. 依存パッケージをインストールする

```bash
npm install
```

3. 開発サーバーを起動する

```bash
npm run dev
```
