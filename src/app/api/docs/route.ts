import { NextRequest, NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const DOCS_DIR = join(process.cwd(), "docs");

interface DocMeta {
  slug: string;
  title: string;
  size: number;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "無題";
}

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file");

  if (file) {
    // 特定ファイルの内容を返す
    const safeName = file.replace(/[^a-zA-Z0-9_\-\.]/g, "");
    if (!safeName.endsWith(".md")) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }
    try {
      const content = readFileSync(join(DOCS_DIR, safeName), "utf-8");
      return NextResponse.json({
        slug: safeName.replace(/\.md$/, ""),
        title: extractTitle(content),
        content,
      });
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  // ファイル一覧を返す
  try {
    const files = readdirSync(DOCS_DIR)
      .filter((f) => f.endsWith(".md") && f !== "CLAUDE.md")
      .map((f) => {
        const content = readFileSync(join(DOCS_DIR, f), "utf-8");
        return {
          slug: f.replace(/\.md$/, ""),
          title: extractTitle(content),
          size: content.length,
        } as DocMeta;
      });
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([]);
  }
}
