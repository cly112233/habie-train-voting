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

    const { type, submissionId, content } = await req.json();

    if (!type || !submissionId || !content) {
      return NextResponse.json(
        { success: false, error: "缺少参数" },
        { status: 400 }
      );
    }

    if (content.length > 200) {
      return NextResponse.json(
        { success: false, error: "建议不能超过200字" },
        { status: 400 }
      );
    }

    const db = getDb();
    db.prepare(
      "INSERT INTO suggestions (user_id, submission_type, submission_id, content) VALUES (?, ?, ?, ?)"
    ).run(auth.userId, type, submissionId, content.trim());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Suggestion error:", err);
    return NextResponse.json(
      { success: false, error: "提交失败" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const submissionId = searchParams.get("submissionId");

    if (!type || !submissionId) {
      return NextResponse.json(
        { success: false, error: "缺少参数" },
        { status: 400 }
      );
    }

    const db = getDb();
    const suggestions = db
      .prepare(
        `SELECT s.*, u.username
         FROM suggestions s
         JOIN users u ON s.user_id = u.id
         WHERE s.submission_type = ? AND s.submission_id = ?
         ORDER BY s.created_at ASC`
      )
      .all(type, Number(submissionId));

    return NextResponse.json({ success: true, data: suggestions });
  } catch (err) {
    console.error("Get suggestions error:", err);
    return NextResponse.json(
      { success: false, error: "获取建议失败" },
      { status: 500 }
    );
  }
}
