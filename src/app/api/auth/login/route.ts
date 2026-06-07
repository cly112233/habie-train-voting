import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json();

    if (!id || !password) {
      return NextResponse.json(
        { success: false, error: "ID和密码不能为空" },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare("SELECT id, username, password_hash, bio, avatar, is_admin FROM users WHERE id = ?")
      .get(id) as { id: string; username: string; password_hash: string; bio: string; avatar: string; is_admin: number } | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 401 }
      );
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "密码错误" },
        { status: 401 }
      );
    }

    // 确保管理员ID始终有管理员权限
    const ADMIN_IDS = ["2827186780", "guanli"];
    if (ADMIN_IDS.includes(id) && !user.is_admin) {
      db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(id);
      user.is_admin = 1;
    }

    const token = await createToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: { id: user.id, username: user.username, bio: user.bio, avatar: user.avatar, is_admin: user.is_admin },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
