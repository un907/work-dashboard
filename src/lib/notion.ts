/**
 * Notion API ユーティリティ（サーバーサイド専用）
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const NOTION_DB_ID = process.env.NOTION_DB_ID || "";
const NOTION_VERSION = "2022-06-28";

async function notionApi(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Notion API error");
  }
  return res.json();
}

export interface NotionDoc {
  id: string;
  title: string;
  category: string;
  project: string;
  status: string;
  lastEdited: string;
}

export interface NotionDocContent {
  id: string;
  title: string;
  category: string;
  status: string;
  content: string; // blocks → markdown変換
}

function extractTitle(page: any): string {
  const titleProp = page.properties?.["名前"]?.title;
  return titleProp?.[0]?.plain_text || "無題";
}

function extractSelect(page: any, key: string): string {
  return page.properties?.[key]?.select?.name || "";
}

/**
 * ドキュメント一覧を取得（プロジェクトフィルタ対応）
 */
export async function listDocs(project?: string): Promise<NotionDoc[]> {
  const filters: any[] = [
    { property: "ステータス", select: { does_not_equal: "アーカイブ" } },
  ];
  if (project) {
    filters.push({ property: "プロジェクト", select: { equals: project } });
  }

  const data = await notionApi(`databases/${NOTION_DB_ID}/query`, "POST", {
    filter: filters.length === 1 ? filters[0] : { and: filters },
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });

  return data.results.map((page: any) => ({
    id: page.id,
    title: extractTitle(page),
    category: extractSelect(page, "カテゴリ"),
    project: extractSelect(page, "プロジェクト"),
    status: extractSelect(page, "ステータス"),
    lastEdited: page.last_edited_time,
  }));
}

/**
 * リッチテキスト → markdown（太字・イタリック・コード・リンク対応）
 */
function richTextToMd(richTexts: any[]): string {
  if (!richTexts) return "";
  return richTexts.map((t: any) => {
    let text = t.plain_text || "";
    if (t.annotations?.bold) text = `**${text}**`;
    if (t.annotations?.italic) text = `*${text}*`;
    if (t.annotations?.code) text = `\`${text}\``;
    if (t.annotations?.strikethrough) text = `~~${text}~~`;
    if (t.href) text = `[${text}](${t.href})`;
    return text;
  }).join("");
}

/**
 * ブロック → markdown変換
 */
function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const type = block.type;
    const rt = block[type]?.rich_text;
    const text = richTextToMd(rt);

    switch (type) {
      case "heading_1": lines.push("", `# ${text}`, ""); break;
      case "heading_2": lines.push("", `## ${text}`, ""); break;
      case "heading_3": lines.push("", `### ${text}`, ""); break;
      case "paragraph": lines.push(text || ""); break;
      case "bulleted_list_item": lines.push(`- ${text}`); break;
      case "numbered_list_item": lines.push(`1. ${text}`); break;
      case "to_do":
        lines.push(`- [${block.to_do?.checked ? "x" : " "}] ${text}`);
        break;
      case "code":
        lines.push(`\`\`\`${block.code?.language || ""}`, richTextToMd(block.code?.rich_text) || text, "```");
        break;
      case "quote": lines.push(`> ${text}`); break;
      case "callout":
        lines.push(`> ${block.callout?.icon?.emoji || ""} ${text}`);
        break;
      case "divider": lines.push("", "---", ""); break;
      case "table": {
        const tableBlock = block;
        if (tableBlock.has_children && block._children) {
          // children are table_row blocks
          const rows = block._children;
          for (let r = 0; r < rows.length; r++) {
            const cells = rows[r].table_row?.cells || [];
            const row = "| " + cells.map((cell: any[]) => richTextToMd(cell)).join(" | ") + " |";
            lines.push(row);
            if (r === 0) {
              lines.push("| " + cells.map(() => "---").join(" | ") + " |");
            }
          }
        }
        break;
      }
      case "toggle":
        lines.push(`**${text}**`);
        break;
      case "bookmark":
        lines.push(`[${block.bookmark?.caption?.[0]?.plain_text || block.bookmark?.url || ""}](${block.bookmark?.url || ""})`);
        break;
      case "image": {
        const url = block.image?.file?.url || block.image?.external?.url || "";
        const cap = block.image?.caption?.[0]?.plain_text || "";
        if (url) lines.push(`![${cap}](${url})`);
        break;
      }
      default:
        if (text) lines.push(text);
        break;
    }
  }

  return lines.join("\n");
}

/**
 * ドキュメント内容を取得（テーブル等の子ブロックも再帰取得）
 */
export async function getDoc(pageId: string): Promise<NotionDocContent> {
  const [page, blocksData] = await Promise.all([
    notionApi(`pages/${pageId}`),
    notionApi(`blocks/${pageId}/children`),
  ]);

  const blocks = blocksData.results || [];

  // テーブル等の子ブロックを取得
  for (const block of blocks) {
    if (block.has_children && (block.type === "table" || block.type === "toggle")) {
      try {
        const children = await notionApi(`blocks/${block.id}/children`);
        block._children = children.results || [];
      } catch {}
    }
  }

  return {
    id: page.id,
    title: extractTitle(page),
    category: extractSelect(page, "カテゴリ"),
    status: extractSelect(page, "ステータス"),
    content: blocksToMarkdown(blocks),
  };
}

/**
 * 新規ドキュメント作成
 */
export async function createDoc(title: string, category?: string, project?: string): Promise<string> {
  const page = await notionApi("pages", "POST", {
    parent: { database_id: NOTION_DB_ID },
    properties: {
      "名前": { title: [{ text: { content: title } }] },
      ...(category ? { "カテゴリ": { select: { name: category } } } : {}),
      ...(project ? { "プロジェクト": { select: { name: project } } } : {}),
      "ステータス": { select: { name: "下書き" } },
    },
    children: [
      { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: "" } }] } },
    ],
  });
  return page.id;
}

/**
 * ドキュメント更新（ブロックを全て置換）
 */
export async function updateDoc(pageId: string, markdown: string, properties?: { status?: string; category?: string }): Promise<void> {
  // プロパティ更新
  if (properties) {
    const props: any = {};
    if (properties.status) props["ステータス"] = { select: { name: properties.status } };
    if (properties.category) props["カテゴリ"] = { select: { name: properties.category } };
    if (Object.keys(props).length > 0) {
      await notionApi(`pages/${pageId}`, "PATCH", { properties: props });
    }
  }

  // 既存ブロックを削除
  const existing = await notionApi(`blocks/${pageId}/children`);
  for (const block of existing.results || []) {
    await notionApi(`blocks/${block.id}`, "DELETE");
  }

  // markdown → blocks に変換して追加
  const blocks = markdownToBlocks(markdown);
  if (blocks.length > 0) {
    await notionApi(`blocks/${pageId}/children`, "PATCH", { children: blocks });
  }
}

/**
 * ドキュメントをアーカイブ
 */
export async function archiveDoc(pageId: string): Promise<void> {
  await notionApi(`pages/${pageId}`, "PATCH", {
    properties: { "ステータス": { select: { name: "アーカイブ" } } },
  });
}

/**
 * ドキュメントを完全削除（ゴミ箱に移動）
 */
export async function deleteDoc(pageId: string): Promise<void> {
  await notionApi(`pages/${pageId}`, "PATCH", { in_trash: true });
}

/**
 * markdown → Notionブロック変換（簡易）
 */
function markdownToBlocks(md: string): any[] {
  return md.split("\n").filter((l) => l.trim()).map((line) => {
    if (line.startsWith("### ")) return { object: "block", type: "heading_3", heading_3: { rich_text: [{ text: { content: line.slice(4) } }] } };
    if (line.startsWith("## ")) return { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: line.slice(3) } }] } };
    if (line.startsWith("# ")) return { object: "block", type: "heading_1", heading_1: { rich_text: [{ text: { content: line.slice(2) } }] } };
    if (line.startsWith("- [x] ")) return { object: "block", type: "to_do", to_do: { rich_text: [{ text: { content: line.slice(6) } }], checked: true } };
    if (line.startsWith("- [ ] ")) return { object: "block", type: "to_do", to_do: { rich_text: [{ text: { content: line.slice(6) } }], checked: false } };
    if (line.startsWith("- ")) return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ text: { content: line.slice(2) } }] } };
    if (line.startsWith("> ")) return { object: "block", type: "quote", quote: { rich_text: [{ text: { content: line.slice(2) } }] } };
    if (line === "---") return { object: "block", type: "divider", divider: {} };
    return { object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: line } }] } };
  });
}
