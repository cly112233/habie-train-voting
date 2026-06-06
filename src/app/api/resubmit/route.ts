import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";
import { getCycleStatus, getSubmissionRank } from "@/lib/cycle";
import type { CycleType } from "@/types";

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

    const db = getDb();
    const table = type === "character" ? "characters" : "modifiers";

    // 获取原投稿
    const original = db
      .prepare(`SELECT * FROM ${table} WHERE id = ? AND user_id = ?`)
      .get(submissionId, auth.userId) as Record<string, unknown> | undefined;

    if (!original) {
      return NextResponse.json(
        { success: false, error: "投稿不存在或不属于你" },
        { status: 404 }
      );
    }

    // 检查是否在当前周期
    const status = getCycleStatus(type as CycleType);
    if (status.cycle?.id === (original.cycle_id as number)) {
      return NextResponse.json(
        { success: false, error: "该投稿正在本期投稿中" },
        { status: 400 }
      );
    }

    // 检查是否曾获第一
    const rank = getSubmissionRank(type as CycleType, original.cycle_id as number, Number(original.id));
    if (rank === 1) {
      return NextResponse.json(
        { success: false, error: "该投稿曾获得第一名，无需重新投递" },
        { status: 400 }
      );
    }

    // 检查当前投稿是否开启
    if (!status.isOpen) {
      return NextResponse.json(
        { success: false, error: "当前不是投稿时间" },
        { status: 403 }
      );
    }

    // 重新投递到当前周期
    if (type === "character") {
      db.prepare(
        `INSERT INTO characters (user_id, cycle_id, name, role, short_desc, description, shop, story, is_resubmit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).run(
        auth.userId,
        status.cycle!.id,
        original.name as string,
        original.role as string,
        original.short_desc as string,
        original.description as string,
        (original.shop as string) || "",
        (original.story as string) || ""
      );
    } else {
      db.prepare(
        `INSERT INTO modifiers (user_id, cycle_id, name, description, story, is_resubmit)
         VALUES (?, ?, ?, ?, ?, 1)`
      ).run(
        auth.userId,
        status.cycle!.id,
        original.name as string,
        original.description as string,
        (original.story as string) || ""
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resubmit error:", err);
    return NextResponse.json(
      { success: false, error: "重新投递失败" },
      { status: 500 }
    );
  }
}
