import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { type, submissionId, reaction } = await req.json();

    if (!type || !submissionId || !reaction) {
      return NextResponse.json(
        { success: false, error: "缺少参数" },
        { status: 400 }
      );
    }

    if (type !== "character" && type !== "modifier") {
      return NextResponse.json(
        { success: false, error: "无效的类型" },
        { status: 400 }
      );
    }

    if (reaction !== "like" && reaction !== "dislike") {
      return NextResponse.json(
        { success: false, error: "无效的反应类型" },
        { status: 400 }
      );
    }

    const db = getDb();

    // 检查是否已有反应
    const existing = db
      .prepare(
        "SELECT id, reaction FROM reactions WHERE user_id = ? AND submission_type = ? AND submission_id = ?"
      )
      .get(auth.userId, type, submissionId) as { id: number; reaction: string } | undefined;

    if (existing) {
      if (existing.reaction === reaction) {
        // 点击同一个反应 — 取消
        db.prepare("DELETE FROM reactions WHERE id = ?").run(existing.id);
        return NextResponse.json({ success: true, data: { action: "removed" } });
      } else {
        // 切换反应
        db.prepare("UPDATE reactions SET reaction = ? WHERE id = ?").run(reaction, existing.id);
        return NextResponse.json({ success: true, data: { action: "changed" } });
      }
    } else {
      // 新增反应
      db.prepare(
        "INSERT INTO reactions (user_id, submission_type, submission_id, reaction) VALUES (?, ?, ?, ?)"
      ).run(auth.userId, type, submissionId, reaction);
      return NextResponse.json({ success: true, data: { action: "added" } });
    }
  } catch (err) {
    console.error("Reaction error:", err);
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    );
  }
}
