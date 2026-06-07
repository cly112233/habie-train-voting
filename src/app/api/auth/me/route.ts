import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT id, username, bio, avatar, is_admin, created_at FROM users WHERE id = ?")
      .get(auth.userId) as { id: string; username: string; bio: string; avatar: string; is_admin: number; created_at: string } | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json(
      { success: false, error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { username, bio } = await req.json();

    if (username !== undefined && (username.length < 1 || username.length > 20)) {
      return NextResponse.json(
        { success: false, error: "用户名长度需在1-20个字符之间" },
        { status: 400 }
      );
    }

    if (bio !== undefined && bio.length > 100) {
      return NextResponse.json(
        { success: false, error: "简介不能超过100字" },
        { status: 400 }
      );
    }

    const db = getDb();

    const updates: string[] = [];
    const params: string[] = [];

    if (username !== undefined && username !== auth.username) {
      updates.push("username = ?");
      params.push(username.trim());
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      params.push((bio || "").trim());
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true, data: { message: "未修改" } });
    }

    params.push(auth.userId);
    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    // 更新后重新查询
    const user = db
      .prepare("SELECT id, username, bio, avatar, is_admin, created_at FROM users WHERE id = ?")
      .get(auth.userId);

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { success: false, error: "更新失败" },
      { status: 500 }
    );
  }
}
