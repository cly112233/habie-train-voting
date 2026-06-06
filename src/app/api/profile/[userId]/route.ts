import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCycleStatus, getSubmissionRank } from "@/lib/cycle";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const db = getDb();

    // 获取用户信息
    const user = db
      .prepare("SELECT id, username, bio, avatar, is_admin, created_at FROM users WHERE id = ?")
      .get(userId) as { id: string; username: string; bio: string; avatar: string; is_admin: number; created_at: string } | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    // 获取角色投稿
    const characters = db
      .prepare(
        `SELECT c.*, cy.start_date, cy.voting_end_date, cy.id as cycle_id
         FROM characters c
         JOIN cycles cy ON c.cycle_id = cy.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`
      )
      .all(userId) as (Record<string, unknown>)[];

    // 获取修饰符投稿
    const modifiers = db
      .prepare(
        `SELECT m.*, cy.start_date, cy.voting_end_date, cy.id as cycle_id
         FROM modifiers m
         JOIN cycles cy ON m.cycle_id = cy.id
         WHERE m.user_id = ?
         ORDER BY m.created_at DESC`
      )
      .all(userId) as (Record<string, unknown>)[];

    // 检查每个投稿是否在当前周期
    const charStatus = getCycleStatus("character");
    const modStatus = getCycleStatus("modifier");

    const enrichedCharacters = characters.map((c) => {
      const cycleId = c.cycle_id as number;
      const inCurrentCycle = charStatus.cycle?.id === cycleId;
      const rank = inCurrentCycle
        ? null
        : getSubmissionRank("character", cycleId, c.id as number);
      return {
        ...c,
        rank: rank,
        cycle_label: `${c.start_date} ~ ${c.voting_end_date}`,
        is_current_cycle: inCurrentCycle,
        is_first_place: rank === 1,
      };
    });

    const enrichedModifiers = modifiers.map((m) => {
      const cycleId = m.cycle_id as number;
      const inCurrentCycle = modStatus.cycle?.id === cycleId;
      const rank = inCurrentCycle
        ? null
        : getSubmissionRank("modifier", cycleId, m.id as number);
      return {
        ...m,
        rank: rank,
        cycle_label: `${m.start_date} ~ ${m.voting_end_date}`,
        is_current_cycle: inCurrentCycle,
        is_first_place: rank === 1,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        characters: enrichedCharacters,
        modifiers: enrichedModifiers,
      },
    });
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json(
      { success: false, error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}
