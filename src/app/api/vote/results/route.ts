import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCycleStatus, getCycleRanking } from "@/lib/cycle";
import type { CycleType } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "character") as CycleType;
    const cycleId = searchParams.get("cycle_id");

    if (type !== "character" && type !== "modifier") {
      return NextResponse.json(
        { success: false, error: "无效的类型" },
        { status: 400 }
      );
    }

    const db = getDb();
    const table = type === "character" ? "characters" : "modifiers";

    // 如果没有指定周期，使用上一个周期（投票关闭时看结果）
    let targetCycleId = cycleId ? Number(cycleId) : null;

    if (!targetCycleId) {
      const status = getCycleStatus(type);
      if (status.isVoting) {
        // 投票期间看当前周期
        targetCycleId = status.cycle!.id;
      } else {
        // 非投票期间看上一周期
        targetCycleId = status.previousCycle?.id || status.cycle!.id;
      }
    }

    const rankings = getCycleRanking(type, targetCycleId);

    // 丰富排名信息
    const enriched = rankings.map((r, i) => {
      const submission = db
        .prepare(
          `SELECT s.*, u.username FROM ${table} s JOIN users u ON s.user_id = u.id WHERE s.id = ?`
        )
        .get(r.submission_id) as { name: string; username: string } | undefined;

      return {
        rank: i + 1,
        submission_id: r.submission_id,
        name: submission?.name || "未知",
        username: submission?.username || "未知",
        vote_count: r.vote_count,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error("Vote results error:", err);
    return NextResponse.json(
      { success: false, error: "获取投票结果失败" },
      { status: 500 }
    );
  }
}
