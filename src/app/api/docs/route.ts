import { NextRequest, NextResponse } from "next/server";
import { listDocs, getDoc, createDoc, updateDoc, archiveDoc, deleteDoc } from "@/lib/notion";

// GET: 一覧 or 個別取得
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const doc = await getDoc(id);
      return NextResponse.json(doc);
    }
    const docs = await listDocs();
    return NextResponse.json(docs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: 新規作成
export async function POST(request: NextRequest) {
  try {
    const { title, category } = await request.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    const id = await createDoc(title, category);
    return NextResponse.json({ id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: 更新
export async function PUT(request: NextRequest) {
  try {
    const { id, content, status, category } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await updateDoc(id, content, { status, category });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: 削除 or アーカイブ
export async function DELETE(request: NextRequest) {
  try {
    const { id, archive } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (archive) {
      await archiveDoc(id);
    } else {
      await deleteDoc(id);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
