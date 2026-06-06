import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";
import { getCycleStatus } from "@/lib/cycle";
import type { Character, CharacterInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const body: CharacterInput = await req.json();
    const { name, role, short_desc, description, shop, story } = body;

    // 验证必填字段
    if (!name || !role || !short_desc || !description) {
      return NextResponse.json(
        { success: false, error: "角色名、身份、简介、描述均为必填" },
        { status: 400 }
      );
    }

    if (short_desc.length > 20) {
      return NextResponse.json(
        { success: false, error: "角色简介不能超过20个字" },
        { status: 400 }
      );
    }

    const validRoles = ["平民", "警长", "特殊中立", "杀手方中立", "杀手"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "无效的角色身份" },
        { status: 400 }
      );
    }

    // 检查周期状态
    const status = getCycleStatus("character");
    if (!status.isOpen) {
      return NextResponse.json(
        { success: false, error: "当前不是角色投稿时间，请前往投票" },
        { status: 403 }
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO characters (user_id, cycle_id, name, role, short_desc, description, shop, story)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        auth.userId,
        status.cycle!.id,
        name.trim(),
        role,
        short_desc.trim(),
        description.trim(),
        (shop || "").trim(),
        (story || "").trim()
      );

    return NextResponse.json({
      success: true,
      data: { id: result.lastInsertRowid },
    });
  } catch (err) {
    console.error("Create character error:", err);
    return NextResponse.json(
      { success: false, error: "投稿失败，请稍后重试" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycle_id");
    const userId = searchParams.get("user_id");

    const db = getDb();

    let query = `
      SELECT c.*, u.username,
        (SELECT COUNT(*) FROM reactions r WHERE r.submission_type='character' AND r.submission_id=c.id AND r.reaction='like') as like_count,
        (SELECT COUNT(*) FROM reactions r WHERE r.submission_type='character' AND r.submission_id=c.id AND r.reaction='dislike') as dislike_count,
        (SELECT COUNT(*) FROM votes v WHERE v.submission_type='character' AND v.submission_id=c.id) as vote_count
      FROM characters c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (cycleId) {
      query += " AND c.cycle_id = ?";
      params.push(Number(cycleId));
    }

    if (userId) {
      query += " AND c.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY c.created_at DESC";

    const characters = db.prepare(query).all(...params) as Character[];

    // 如果用户已登录，填充用户对每个投稿的反应
    const auth = await getAuthFromCookie();
    if (auth && characters.length > 0) {
      const ids = characters.map((c) => c.id);
      const placeholders = ids.map(() => "?").join(",");
      const reactions = db
        .prepare(
          `SELECT submission_id, reaction FROM reactions
           WHERE user_id = ? AND submission_type = 'character' AND submission_id IN (${placeholders})`
        )
        .all(auth.userId, ...ids) as { submission_id: number; reaction: string }[];

      const reactionMap = new Map(reactions.map((r) => [r.submission_id, r.reaction as "like" | "dislike"]));
      for (const c of characters) {
        c.user_reaction = reactionMap.get(c.id) || null;
      }
    }

    return NextResponse.json({ success: true, data: characters });
  } catch (err) {
    console.error("Get characters error:", err);
    return NextResponse.json(
      { success: false, error: "获取角色列表失败" },
      { status: 500 }
    );
  }
}
