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

    const character = db
      .prepare(
        `SELECT c.*, u.username,
          (SELECT COUNT(*) FROM reactions WHERE submission_type='character' AND submission_id=c.id AND reaction='like') as like_count,
          (SELECT COUNT(*) FROM reactions WHERE submission_type='character' AND submission_id=c.id AND reaction='dislike') as dislike_count,
          (SELECT COUNT(*) FROM votes WHERE submission_type='character' AND submission_id=c.id) as vote_count
         FROM characters c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
      )
      .get(Number(id));

    if (!character) {
      return NextResponse.json(
        { success: false, error: "角色不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: character });
  } catch (err) {
    console.error("Get character error:", err);
    return NextResponse.json(
      { success: false, error: "获取角色详情失败" },
      { status: 500 }
    );
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

    // 级联删除相关数据
    db.prepare("DELETE FROM reactions WHERE submission_type = 'character' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM suggestions WHERE submission_type = 'character' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM votes WHERE submission_type = 'character' AND submission_id = ?").run(numId);
    db.prepare("DELETE FROM characters WHERE id = ?").run(numId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete character error:", err);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
