---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript フック

> このファイルは [common/hooks.md](../common/hooks.md) を拡張し、TypeScript/JavaScript固有の内容を追加する。

## PostToolUse フック

- **Biome**：編集後にJS/TSファイルを自動フォーマット・Lint（`biome check --write`）
- **TypeScriptチェック**：`.ts`/`.tsx` ファイル編集後に `tsc` を実行
- **console.log警告**：編集したファイルの `console.log` について警告

## Stop フック

- **console.log監査**：セッション終了前にすべての変更ファイルで `console.log` を確認