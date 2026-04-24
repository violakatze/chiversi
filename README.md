# Chiversi（チバーシ）

千葉県の市区町村をオセロのマスに見立てた地図オセロゲームです。  
国土地理院の行政区域データ（GeoJSON）を使い、実際の地図ポリゴン上でオセロを対戦できます。

**人 vs CPU（AI）の1人用ゲームです。**

## スクリーンショット

> *(デプロイ後に追加予定)*

## ゲームの特徴

- 千葉県59市区町村（千葉市は6区単位）が1つのマス
- 各市区町村の重心座標を使った「方向ベース」の挟み判定（走査角 ±30°）
- 初期配置は隣接グラフの4環（4-cycle）97パターンからランダムに選択
- 端に位置する市区町村（浦安市・館山市など）が通常オセロの「角」に相当
- 着手可能マスはオレンジでハイライト表示
- 着手可能マスにホバーすると反転予測マスが黄色で表示（直前の相手マスも対象）
- 各マスに市区町村名を常時表示（飛び地は非表示）
- ゲーム終了時は画面下部のバーで結果を表示（ゲームを妨げないノンブロッキング）

## 技術スタック

| 役割 | ライブラリ |
|---|---|
| フレームワーク | Vite + React + TypeScript |
| 地図描画 | OpenLayers |
| UI コンポーネント | MUI (Material UI) |
| ユニットテスト | Vitest |
| E2E テスト | Playwright |
| デプロイ | GitHub Pages |

## セットアップ

### 必要要件

- Node.js 24+
- pnpm 10+

### インストール

```bash
pnpm install
```

E2E テストを実行する場合は、初回のみ Playwright のブラウザをインストールします。

```bash
pnpm exec playwright install chromium --with-deps
```

## 開発

```bash
# 開発サーバー起動
pnpm dev
# → http://localhost:5173/chiversi/

# 本番ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

## テスト

```bash
# ユニットテスト（一回実行）
pnpm test

# ユニットテスト（ウォッチモード）
pnpm test:watch

# カバレッジ計測
pnpm test:coverage

# E2E テスト（Playwright）
pnpm test:e2e
```

## プロジェクト構成

```
chiversi/
├── data/
│   ├── 12.geojson              # 千葉県行政区域データ（国土数値情報）
│   └── generated/
│       └── adjacency.json      # 隣接グラフ（事前計算済み）
├── public/
│   └── geojson/
│       └── chiba-simplified.geojson  # 表示用 GeoJSON（簡略化済み）
├── src/
│   ├── game/                   # ゲームロジック
│   │   ├── engine.ts           # 挟み判定・合法手計算
│   │   ├── direction.ts        # 方向ベース走査
│   │   ├── initialPlacement.ts # 4環ベース初期配置
│   │   └── ai.ts               # CPU 対戦ロジック
│   ├── graph/
│   │   └── adjacency.ts        # adjacency.json の読み込み
│   ├── map/
│   │   ├── MapView.tsx         # OpenLayers 地図コンポーネント
│   │   └── styles.ts           # ポリゴンスタイル定義
│   ├── components/             # UI コンポーネント
│   ├── types/                  # 型定義
│   └── __tests__/              # ユニットテスト
├── e2e/                        # E2E テスト（Playwright）
├── scripts/                    # adjacency.json 生成スクリプト（Python）
└── .github/workflows/
    ├── deploy.yml              # GitHub Pages デプロイ
    └── test.yml                # CI テスト
```

## 隣接グラフの再生成

`adjacency.json` は Python スクリプトで生成します。

```bash
cd scripts
pip install -r requirements.txt
python compute_adjacency.py
```

生成された `adjacency.json` は `data/generated/` に配置してください。

## デプロイ

`main` ブランチへの push で GitHub Actions が自動的にビルド・デプロイします。

デプロイ先: `https://<username>.github.io/chiversi/`

## ライセンス

地図データ: 国土交通省国土政策局『国土数値情報（行政区域データ）』(CC BY 4.0)  
本ソースコード: MIT
