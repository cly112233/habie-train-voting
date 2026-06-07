import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const modifier = db
      .prepare(
        `SELECT m.*, u.username,
          (SELECT COUNT(*) FROM reactions WHERE submission_type='modifier' AND submission_id=m.id AND reaction='like') as like_count,
          (SELECT COUNT(*) FROM reactions WHERE submission_type='modifier' AND submission_id=m.id AND reaction='dislike') as dislike_count,
          (SELECT COUNT(*) FROM votes WHERE submission_type='modifier' AND submission_id=m.id) as vote_count
         FROM modifiers m
         JOIN users u ON m.user_id = u.id
         WHERE m.id = ?`
      )
      .get(Number(id));

    if (!modifier) {
      return NextResponse.json({ success: false, error: "修饰符不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: modifier });
  } catch (err) {
    console.error("Get modifier error:", err);
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const user = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(auth.userId) as { is_admin: number } | undefined;

    if (!user?.is_admin) {
      return NextResponse.json({ success: false, error: "仅管理员可删除" }, { status: 403 });
    }

    const { id } = await params;
    const numId = Number(id);

    db.prepare("DELETE FROM reactions WHERE submission_type = 'modifier' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM suggestions WHERE submission_type = 'modifier' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM votes WHERE submission_type = 'modifier' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM modifiers WHERE id = ?").run(numId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete modifier error:", err);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
