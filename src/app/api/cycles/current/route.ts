import { NextResponse } from "next/server";
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

    const status = getCycleStatus(type);
    return NextResponse.json({ success: true, data: status });
  } catch (err) {
    console.error("Cycle status error:", err);
    return NextResponse.json(
      { success: false, error: "获取周期状态失败" },
      { status: 500 }
    );
  }
}
