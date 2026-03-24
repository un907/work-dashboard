# プロジェクトタブ実装プラン

## 概要
Work Dashboardの「ドキュメント」タブを「プロジェクト」タブにリニューアル。
プロジェクト単位でドキュメント・フロー図・Git・タスクを統合管理する。

## データ保存先

| データ | 保存先 | 理由 |
|---|---|---|
| プロジェクト一覧 | VPS API `/api/projects` | タスクと同じDBで紐づけ簡単 |
| ドキュメント | Notion API | 既に移行済み、リッチ編集、モバイル |
| フロー図(Mermaid) | VPS API `/api/diagrams` | テキストデータ、Claude生成→保存 |
| タスク | VPS API `/api/tasks` (+projectフィールド) | 既存拡張 |
| Git情報 | GitHub API | リアルタイム取得、保存不要 |

## 画面構成

```
サイドバー
├── ダッシュボード（ホーム）
├── タスク管理（全タスク一覧）
├── プロジェクト ← 旧「ドキュメント」
│   ├── Sheet Dashboard
│   ├── archtracker
│   └── + 追加
└── セッション

プロジェクト選択後:
[概要] [ドキュメント] [フロー図] [Git] [タスク]
```

## 実装ステップ

### Step 1: VPS API拡張
- `/api/projects` CRUD（新規）
  - id, name, description, gitUrl, notionTag, status, createdAt, updatedAt
  - data/projects.json にファイル保存
- `/api/tasks` にprojectフィールド追加
  - 既存タスクのproject=null（未分類）
- `/api/diagrams` CRUD（新規）
  - id, projectId, title, mermaidCode, createdAt, updatedAt
  - data/diagrams.json にファイル保存

### Step 2: Work Dashboard サイドバー改修
- 「ドキュメント」→「プロジェクト」に変更
- `/projects` ルート新設
- プロジェクト一覧表示 + 選択 → `/projects/[id]`

### Step 3: プロジェクトダッシュボード画面
- サブタブ: [概要] [ドキュメント] [フロー図] [Git] [タスク]
- 概要: プロジェクト名、説明、Git URL、ステータス、最近の活動
- ドキュメント: Notion API（プロジェクトのnotionTagでフィルタ）
- フロー図: Mermaid記法エディタ + mermaid.jsプレビュー
- Git: GitHub API（コミット履歴、PR、Issue）
- タスク: VPSタスクをprojectフィルタで自動表示

### Step 4: GUI仕上げ
- frontend-dev skill活用
- サブタブのアニメーション遷移
- レスポンシブ対応
- プロジェクトカード一覧のデザイン

## 環境変数（Vercel）
- NOTION_TOKEN: 設定済み
- NOTION_DB_ID: 設定済み
- NEXT_PUBLIC_API_BASE: https://rikkeyapp.net
- NEXT_PUBLIC_API_TOKEN: 設定済み

## プロジェクトパス
- Work Dashboard: `/Users/yuta/work-dashboard/`
- VPS Dashboard: `/root/clawd/dashboard/`
