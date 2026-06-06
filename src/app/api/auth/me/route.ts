import { NextResponse } from "next/server";
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
