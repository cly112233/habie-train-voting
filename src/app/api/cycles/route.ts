import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCycleStatus } from "@/lib/cycle";
import type { CycleType } from "@/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "character") as CycleType;

    if (type !== "character" && type !== "modifier") {
      return NextResponse.json(
        { success: false, error: "无效的类型" },
        { status: 400 }
      );
    }

    const db = getDb();
    const cycles = db
      .prepare(
        `SELECT * FROM cycles WHERE type = ? ORDER BY start_date DESC LIMIT 20`
      )
      .all(type);

    // 标记当前周期
    const current = getCycleStatus(type);

    const enriched = (cycles as Record<string, unknown>[]).map((c) => ({
      ...c,
      is_current: current.cycle?.id === c.id,
      phase:
        current.cycle?.id === c.id
          ? current.phase
          : "results",
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error("List cycles error:", err);
    return NextResponse.json(
      { success: false, error: "获取周期列表失败" },
      { status: 500 }
    );
  }
}
