import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "请选择图片" }, { status: 400 });
    }

    // 校验文件类型
    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "仅支持 PNG/JPG/GIF/WebP" }, { status: 400 });
    }

    // 校验大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "图片大小不能超过 2MB" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "png";
    const filename = `${auth.userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    // 删除旧头像文件（忽略失败）
    const db = getDb();
    const old = db.prepare("SELECT avatar FROM users WHERE id = ?").get(auth.userId) as { avatar: string } | undefined;
    if (old?.avatar) {
      try {
        const fs = await import("fs/promises");
        await fs.unlink(path.join(process.cwd(), "public", old.avatar));
      } catch { /* 文件不存在 */ }
    }

    const avatarPath = `/uploads/avatars/${filename}`;
    db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(avatarPath, auth.userId);

    return NextResponse.json({ success: true, data: { avatar: avatarPath } });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json({ success: false, error: "上传失败" }, { status: 500 });
  }
}
