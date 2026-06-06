"use client";

import { useState, useEffect } from "react";
import TabSwitch from "@/components/TabSwitch";
import SubmissionCard from "@/components/SubmissionCard";
import type { Character, Modifier } from "@/types";

function parseShopItems(raw: string): { name: string; price: string }[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((i: unknown) => i && typeof i === "object" && "name" in (i as object));
  } catch { /* ignore */ }
  return [];
}

export default function BrowsePage() {
  const [tab, setTab] = useState("character");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 检查管理员状态
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setIsAdmin(d.data.is_admin === 1));
  }, []);

  // 加载投稿列表
  const loadData = () => {
    setLoading(true);
    if (tab === "character") {
      fetch("/api/characters")
        .then((r) => r.json())
        .then((d) => d.success && setCharacters(d.data))
        .finally(() => setLoading(false));
    } else {
      fetch("/api/modifiers")
        .then((r) => r.json())
        .then((d) => d.success && setModifiers(d.data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleDelete = async (type: "character" | "modifier", id: number) => {
    if (!confirm(`确定要删除这个${type === "character" ? "角色" : "修饰符"}投稿吗？此操作不可撤销。`)) return;

    setDeletingId(id);
    try {
      const endpoint = type === "character" ? `/api/characters/${id}` : `/api/modifiers/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || "删除失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">🔍 查看本期投稿</h1>
      <p className="text-muted text-sm mb-6">
        浏览玩家投稿，点赞、踩或留下你的建议
      </p>

      <div className="mb-6">
        <TabSwitch
          tabs={[
            { key: "character", label: "🎭 角色投稿" },
            { key: "modifier", label: "✨ 修饰符投稿" },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-muted text-lg">加载中...</div>
        </div>
      ) : tab === "character" ? (
        characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">暂无角色投稿</h2>
            <p className="text-muted text-sm">还没有玩家投稿角色，快来第一个吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {characters.map((c) => (
              <div key={c.id} className="relative">
                <SubmissionCard
                  type="character"
                  id={c.id}
                  userId={c.user_id}
                  username={c.username || "未知"}
                  name={c.name}
                  subtitle={c.role}
                  shortDesc={c.short_desc}
                  description={c.description}
                  shopItems={parseShopItems(c.shop)}
                  extra={[
                    { label: "角色故事", value: c.story },
                  ]}
                  likeCount={c.like_count || 0}
                  dislikeCount={c.dislike_count || 0}
                  voteCount={c.vote_count || 0}
                  userReaction={c.user_reaction}
                />
                {isAdmin && (
                  <button
                    onClick={() => handleDelete("character", c.id)}
                    disabled={deletingId === c.id}
                    className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === c.id ? "删除中..." : "🗑 删除"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : modifiers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">暂无修饰符投稿</h2>
          <p className="text-muted text-sm">还没有玩家投稿修饰符，快来第一个吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modifiers.map((m) => (
            <div key={m.id} className="relative">
              <SubmissionCard
                type="modifier"
                id={m.id}
                userId={m.user_id}
                username={m.username || "未知"}
                name={m.name}
                description={m.description}
                extra={[{ label: "故事", value: m.story }]}
                likeCount={m.like_count || 0}
                dislikeCount={m.dislike_count || 0}
                voteCount={m.vote_count || 0}
                userReaction={m.user_reaction}
              />
              {isAdmin && (
                <button
                  onClick={() => handleDelete("modifier", m.id)}
                  disabled={deletingId === m.id}
                  className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deletingId === m.id ? "删除中..." : "🗑 删除"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
