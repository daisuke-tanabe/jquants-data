# jquants-data

J-Quants Bulk API を使って CSV データをローカルに保存するリポジトリ。

## セットアップ

### 1. Git LFS のインストールと初期化

```bash
brew install git-lfs
git lfs install
```

> `git lfs install` はグローバルな git フックを登録するもので、マシンごとに一度だけ実行する必要があります。

### 2. 依存関係のインストールと環境変数の設定

```bash
pnpm install

cp .env.example .env
# .env に JQUANTS_API_KEY を設定
```

## 使い方

```bash
# 初期ダウンロード（全期間）
pnpm download

# 差分更新（最終取得済み月を自動検出して不足分のみ取得）
pnpm update
```

## ダウンロード対象

| データ種別 | 期間 |
|-----------|------|
| 株式価格 (日足) | 2016〜 |
| 株価分足 | 2024〜 |
| 株価ティック | 2024〜 |
| TOPIX四本値 | 2016〜 |
| 指数四本値 | 2016〜 |
| 財務情報 | 2016〜 |
| 投資部門別情報 | 2016〜 |
| 信用取引週末残高 | 2016〜 |
| 業種別空売り比率 | 2016〜 |
| 空売り残高報告 | 2016〜 |
| 日々公表信用取引残高 | 2016〜 |
| 上場銘柄一覧 | 2016〜 |

データは `data/` に CSV 形式で保存される（Git LFS 管理）。

## GitHub Actions

毎月1日 JST 09:00 に自動で差分更新・コミット・プッシュする。  
Repository secrets に `JQUANTS_API_KEY` を登録する必要あり。
