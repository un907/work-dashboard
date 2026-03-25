# WDB v2: タスク再定義 + Notion脱却 + Wiki-link

## 背景

- タスク一覧がデータ置き場化している。人間向けの大粒度メモとAIエージェント向けの細かい手順書が混在
- Notionの利点（ネイティブGUI）がWDB独自UIで不要になった。API変換ロスだけが残っている
- プロジェクト/ドキュメント/タスク間のリンクがなく、情報が孤立している

## ゴール

プロジェクト単位で「何が残ってるか」「関連資料はどこか」が一目で分かるダッシュボード。
Obsidian的な双方向リンクで情報を横断的に辿れる。

---

## Phase 1: データ基盤（Notion → VPS SQLite + Markdown）

### 構成

```
/root/clawd/dashboard/data/
  wdb.db              # SQLite（メタデータ + FTS5全文検索 + リンク関係）
  docs/
    {uuid}.md          # ドキュメント本文（Markdown）
```

### SQLite スキーマ

```sql
-- ドキュメント
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_id TEXT,           -- projects.id
  category TEXT,             -- 計画/設計/要件定義/議事録/メモ
  status TEXT DEFAULT 'draft', -- draft/published/archived
  created_at TEXT,
  updated_at TEXT
);

-- 全文検索（FTS5）
CREATE VIRTUAL TABLE documents_fts USING fts5(
  title, content, tokenize='unicode61'
);

-- リンク関係（Wiki-link解析結果）
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT,    -- 'document' | 'task' | 'project'
  source_id TEXT,
  target_type TEXT,
  target_id TEXT,
  context TEXT,        -- リンク周辺のテキスト（プレビュー用）
  created_at TEXT
);

-- タスク（大粒度メモ）
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,              -- Markdown、詳細メモ
  project_id TEXT,
  section TEXT,           -- プロジェクト内セクション（設計/実装/テスト等）
  status TEXT DEFAULT 'open', -- open/done/archived
  priority TEXT DEFAULT 'normal', -- high/normal/low
  due_hint TEXT,          -- today/this_week/later/someday（厳密な日付ではなくヒント）
  created_at TEXT,
  updated_at TEXT
);
```

### VPS API

| エンドポイント | 用途 |
|---|---|
| `GET/POST/PUT/DELETE /api/v2/documents` | ドキュメントCRUD |
| `GET /api/v2/documents/:id/content` | Markdown本文取得 |
| `PUT /api/v2/documents/:id/content` | Markdown本文更新 |
| `GET /api/v2/documents/search?q=xxx` | 全文検索 |
| `GET /api/v2/links?id=xxx&type=document` | バックリンク取得 |
| `GET/POST/PUT/DELETE /api/v2/tasks` | タスクCRUD |

### 移行手順

1. VPSにSQLite DB + docsディレクトリ作成
2. APIルート実装（`/api/v2/`で共存、既存`/api/`は温存）
3. 既存Notionドキュメントをエクスポート → SQLite + .md に移行
4. WDB側を`/api/v2/`に切り替え
5. 動作確認後、Notion依存コード削除

---

## Phase 2: タスクの再定義

### 人間向けタスク（WDB表示）

- **大粒度**: 「SheetDB Phase 3 仕上げ」「VPS CORS修正」レベル
- **メモ付き**: bodyフィールドにMarkdownで背景・参考リンクを書ける
- **セクション分け**: プロジェクト内で「設計」「実装」「運用」等のグループ化
- **ステータスはシンプル**: open / done / archived（細かいステータス管理はしない）
- **due_hint**: 厳密な日付ではなく「今週やる」「いつか」程度のヒント

### AIエージェント向け手順（WDB非表示）

- CLAUDE.md / プランファイル / セッションログに記載
- ダッシュボードには出さない
- リッキーのブリーフィングで生成される細かいタスクはこちら側

### リッキーブリーフィング改修

- 現在: 細かいタスクを個別登録 → タスク一覧が膨大に見える
- 改修後: プロジェクト単位の要約 + 人間向けアクションアイテム（大粒度）のみ登録
- 細かい手順はセッションログやプランファイルに残す

---

## Phase 3: Wiki-link + バックリンク

### リンク記法

```markdown
ドキュメント内で [[ドキュメントタイトル]] や [[タスク:タスク名]] と書くと
自動でリンクが生成される。
```

### リンクの種類

| 記法 | 対象 |
|---|---|
| `[[タイトル]]` | ドキュメント |
| `[[task:タスク名]]` | タスク |
| `[[project:プロジェクト名]]` | プロジェクト |
| `[[diagram:図名]]` | ダイアグラム |

### リンク解析フロー

1. ドキュメント/タスク保存時に本文を正規表現でパース
2. `links` テーブルに保存
3. バックリンク取得: `SELECT * FROM links WHERE target_id = ?`
4. WDB UI: ドキュメント下部に「バックリンク」セクション表示

### UI

- ドキュメント閲覧時: `[[...]]` を青色リンクとして表示、クリックで遷移
- ドキュメント下部: 「このドキュメントへのリンク」一覧（バックリンク）
- プロジェクト概要: 関連ドキュメント・タスクが自動集約

---

## Phase 4: WDB UI刷新

### タスクタブ改修

- フラット一覧 → セクション別グルーピング
- タスクカードにbody（メモ）のプレビュー表示
- タスクからリンク先ドキュメントへのジャンプ
- 添付リンク（URL）をタスクに紐付け可能に

### ドキュメントタブ改修

- Notion API → VPS API (`/api/v2/documents`)
- Wiki-linkのリアルタイムレンダリング
- バックリンクセクション
- 全文検索

### プロジェクト概要タブ

- 関連タスク（大粒度）の自動集約
- 関連ドキュメントの自動集約
- 最近の活動（更新されたドキュメント/タスク）

---

## Phase 5: リッキー連携改修

### ブリーフィング出力変更

- タスク登録: 大粒度のみ（プロジェクト単位のアクションアイテム）
- セッションログ: 細かい手順はここに残す（既存フロー）
- ダッシュボード向けタスクの `source` を `briefing` に設定

### add-task.sh 改修

- `project` パラメータ追加
- `section` パラメータ追加
- 既存の互換性は維持

---

## 実行順序

1. **Phase 1** → データ基盤が全ての土台
2. **Phase 2** → Phase 1と並行可（タスクスキーマはPhase 1に含む）
3. **Phase 3** → Phase 1完了後
4. **Phase 4** → Phase 1, 3完了後
5. **Phase 5** → Phase 2完了後（独立して進行可）

## 環境

- VPS Dashboard: `/root/clawd/dashboard/`
- Work Dashboard: `/Users/yuta/work-dashboard/`
- VPS: root@162.43.87.183 (rikkeyapp.net)
- Vercel: work-dashboard-chi.vercel.app
