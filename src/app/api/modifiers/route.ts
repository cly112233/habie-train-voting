import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthFromCookie } from "@/lib/auth";
import { getCycleStatus } from "@/lib/cycle";
import type { Modifier, ModifierInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const body: ModifierInput = await req.json();
    const { name, description, story } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: "名称和描述均为必填" },
        { status: 400 }
      );
    }

    const status = getCycleStatus("modifier");
    if (!status.isOpen) {
      return NextResponse.json(
        { success: false, error: "当前不是修饰符投稿时间，请前往投票" },
        { status: 403 }
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO modifiers (user_id, cycle_id, name, description, story)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        auth.userId,
        status.cycle!.id,
        name.trim(),
        description.trim(),
        (story || "").trim()
      );

    return NextResponse.json({
      success: true,
      data: { id: result.lastInsertRowid },
    });
  } catch (err) {
    console.error("Create modifier error:", err);
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
      SELECT m.*, u.username,
        (SELECT COUNT(*) FROM reactions r WHERE r.submission_type='modifier' AND r.submission_id=m.id AND r.reaction='like') as like_count,
        (SELECT COUNT(*) FROM reactions r WHERE r.submission_type='modifier' AND r.submission_id=m.id AND r.reaction='dislike') as dislike_count,
        (SELECT COUNT(*) FROM votes v WHERE v.submission_type='modifier' AND v.submission_id=m.id) as vote_count
      FROM modifiers m
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (cycleId) {
      query += " AND m.cycle_id = ?";
      params.push(Number(cycleId));
    }

    if (userId) {
      query += " AND m.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY m.created_at DESC";

    const modifiers = db.prepare(query).all(...params) as Modifier[];

    // 如果用户已登录，填充用户对每个投稿的反应
    const auth = await getAuthFromCookie();
    if (auth && modifiers.length > 0) {
      const ids = modifiers.map((m) => m.id);
      const placeholders = ids.map(() => "?").join(",");
      const reactions = db
        .prepare(
          `SELECT submission_id, reaction FROM reactions
           WHERE user_id = ? AND submission_type = 'modifier' AND submission_id IN (${placeholders})`
        )
        .all(auth.userId, ...ids) as { submission_id: number; reaction: string }[];

      const reactionMap = new Map(reactions.map((r) => [r.submission_id, r.reaction as "like" | "dislike"]));
      for (const m of modifiers) {
        m.user_reaction = reactionMap.get(m.id) || null;
      }
    }

    return NextResponse.json({ success: true, data: modifiers });
  } catch (err) {
    console.error("Get modifiers error:", err);
    return NextResponse.json(
      { success: false, error: "获取修饰符列表失败" },
      { status: 500 }
    );
  }
}
