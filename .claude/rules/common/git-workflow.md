# Gitワークフロー

## ブランチ戦略

| ブランチ | 役割 |
|---------|------|
| `main` | リリース用。本番環境にデプロイされる |
| `develop` | 開発用。すべての開発はここに集約される |
| `feature/*` / `fix/*` 等 | 作業ブランチ。`develop` から切って `develop` にマージする |

**基本フロー：**
```
develop → 作業ブランチを作成
  └─ 開発・コミット
  └─ PR → develop にマージ

develop → main（リリース時のみ）
```

- 作業ブランチは `develop` から切る
- `main` への直接コミット・直接マージは禁止

## コミットメッセージフォーマット
```
<type>: <description>

<optional body>
```

タイプ: feat, fix, refactor, docs, test, chore, perf, ci

注意：帰属は ~/.claude/settings.json でグローバルに無効化されている。

## プルリクエストワークフロー

PRを作成する際：
1. 全コミット履歴を分析する（最新のコミットだけでなく）
2. `git diff [base-branch]...HEAD` を使用してすべての変更を確認する
3. 包括的なPRサマリーを作成する
4. TODOを含むテストプランを含める
5. 新しいブランチの場合は `-u` フラグをつけてプッシュする

> git操作前のフルな開発プロセス（計画、TDD、コードレビュー）については、
> [development-workflow.md](./development-workflow.md) を参照。