import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";
import { getCycleStatus } from "@/lib/cycle";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { type, submissionId } = await req.json();

    if (!type || !submissionId) {
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

    // 检查投票是否开启
    const status = getCycleStatus(type);
    if (!status.isVoting) {
      return NextResponse.json(
        { success: false, error: "当前不是投票时间" },
        { status: 403 }
      );
    }

    const db = getDb();

    // 检查该投稿是否存在且属于当前周期
    const table = type === "character" ? "characters" : "modifiers";
    const submission = db
      .prepare(`SELECT id FROM ${table} WHERE id = ? AND cycle_id = ?`)
      .get(submissionId, status.cycle!.id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "投稿不存在或不在当前周期" },
        { status: 404 }
      );
    }

    // 每人每类型每周期只能投一票，使用 upsert
    try {
      db.prepare(
        `INSERT INTO votes (user_id, submission_type, submission_id, cycle_id)
         VALUES (?, ?, ?, ?)`
      ).run(auth.userId, type, submissionId, status.cycle!.id);

      return NextResponse.json({ success: true, data: { voted: true } });
    } catch (err: unknown) {
      // UNIQUE constraint violation - 已经投过票了
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("UNIQUE")) {
        return NextResponse.json(
          { success: false, error: "你已经在当前周期投过票了" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("Vote error:", err);
    return NextResponse.json(
      { success: false, error: "投票失败" },
      { status: 500 }
    );
  }
}
