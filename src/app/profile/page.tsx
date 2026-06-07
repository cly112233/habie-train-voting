"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface UserInfo {
  id: string;
  username: string;
  bio: string;
  avatar: string;
  is_admin: number;
}

interface SubmissionRecord {
  id: number;
  name: string;
  role?: string;
  description: string;
  rank: number | null;
  cycle_label: string;
  is_current_cycle: boolean;
  is_first_place: boolean;
}

interface ProfileData {
  user: UserInfo;
  characters: SubmissionRecord[];
  modifiers: SubmissionRecord[];
}

function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resubmitting, setResubmitting] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadProfile = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.success) return;

      const res = await fetch(`/api/profile/${authData.data.id}`);
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const startEdit = () => {
    if (!profile) return;
    setEditUsername(profile.user.username);
    setEditBio(profile.user.bio || "");
    setEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      setError("用户名不能为空");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsername.trim(), bio: editBio.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        loadProfile();
      } else {
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/auth/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        loadProfile();
      } else {
        setError(data.error || "上传失败");
      }
    } catch {
      setError("上传失败");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResubmit = async (type: "character" | "modifier", submissionId: number) => {
    setResubmitting(submissionId);
    setError("");
    try {
      const res = await fetch("/api/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, submissionId }),
      });
      const data = await res.json();
      if (data.success) {
        loadProfile();
      } else {
        setError(data.error || "重新投递失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setResubmitting(null);
    }
  };

  const getRankBadge = (rank: number | null) => {
    if (rank === null) return null;
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted text-lg">加载中...</div>
      </div>
    );
  }

  if (!profile) return null;

  const { user, characters, modifiers } = profile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-3xl border border-border p-6 mb-8">
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-accent-light overflow-hidden flex items-center justify-center text-2xl">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent font-bold">{user.username.charAt(0)}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs">{uploadingAvatar ? "..." : "📷"}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* 名字 + ID */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded-xl border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  maxLength={20}
                />
                <p className="text-xs text-muted">ID: {user.id}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{user.username}</h1>
                  {user.is_admin === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                      管理员
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">ID: {user.id}</p>
              </>
            )}
          </div>

          {/* 右侧按钮组 */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-2xl border border-border text-sm text-muted hover:text-danger hover:border-danger/30 hover:bg-red-50 transition-all"
            >
              退出登录
            </button>
            {editing ? (
              <div className="flex gap-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "保存中" : "保存"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-border text-muted text-xs hover:bg-accent-light"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="px-4 py-2 rounded-2xl border border-border text-sm text-accent hover:bg-accent-light transition-all"
              >
                ✏️ 编辑
              </button>
            )}
          </div>
        </div>

        {/* 简介 */}
        {editing ? (
          <textarea
            className="mt-4 w-full px-3 py-2 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            rows={2}
            placeholder="向大家介绍一下自己"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            maxLength={100}
          />
        ) : user.bio ? (
          <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
        ) : (
          <p className="mt-4 text-sm text-muted italic">暂无简介</p>
        )}

        <p className="mt-3 text-xs text-muted/60">点击头像上传新头像（支持 PNG/JPG/GIF/WebP，≤2MB）</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 角色投稿 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          🎭 已投稿角色
          <span className="text-sm text-muted font-normal">({characters.length})</span>
        </h2>
        {characters.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-8 text-center">
            <p className="text-muted text-sm">暂无投稿</p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                      {c.role && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium shrink-0">
                          {c.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{c.cycle_label}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {c.is_current_cycle ? (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        正在本期投稿中
                      </span>
                    ) : c.rank !== null ? (
                      <span className="text-lg">{getRankBadge(c.rank)}</span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{c.description}</p>
                {!c.is_current_cycle && !c.is_first_place && (
                  <button
                    onClick={() => handleResubmit("character", c.id)}
                    disabled={resubmitting === c.id}
                    className="text-xs px-4 py-1.5 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {resubmitting === c.id ? "投递中..." : "🔄 重新投递"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 修饰符投稿 */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          ✨ 已投稿修饰符
          <span className="text-sm text-muted font-normal">({modifiers.length})</span>
        </h2>
        {modifiers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-8 text-center">
            <p className="text-muted text-sm">暂无投稿</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modifiers.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{m.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{m.cycle_label}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {m.is_current_cycle ? (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        正在本期投稿中
                      </span>
                    ) : m.rank !== null ? (
                      <span className="text-lg">{getRankBadge(m.rank)}</span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{m.description}</p>
                {!m.is_current_cycle && !m.is_first_place && (
                  <button
                    onClick={() => handleResubmit("modifier", m.id)}
                    disabled={resubmitting === m.id}
                    className="text-xs px-4 py-1.5 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {resubmitting === m.id ? "投递中..." : "🔄 重新投递"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
