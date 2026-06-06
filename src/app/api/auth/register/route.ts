import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { id, username, password, bio } = await req.json();

    // 验证
    if (!id || !username || !password) {
      return NextResponse.json(
        { success: false, error: "ID、用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (id.length < 2 || id.length > 20) {
      return NextResponse.json(
        { success: false, error: "ID长度需在2-20个字符之间" },
        { status: 400 }
      );
    }

    if (username.length < 1 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: "用户名长度需在1-20个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码长度至少6位" },
        { status: 400 }
      );
    }

    const db = getDb();

    // 检查ID是否已存在
    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该ID已被注册" },
        { status: 409 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    // 管理员ID列表
    const ADMIN_IDS = ["2827186780"];
    const isAdmin = ADMIN_IDS.includes(id) ? 1 : 0;
    db.prepare(
      "INSERT INTO users (id, username, password_hash, bio, is_admin) VALUES (?, ?, ?, ?, ?)"
    ).run(id, username, passwordHash, bio || "", isAdmin);

    const token = await createToken({ userId: id, username });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: { id, username, bio: bio || "" },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
