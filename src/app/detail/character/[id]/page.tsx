"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface ShopItem {
  name: string;
  price: string;
}

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    name: string; role: string; short_desc: string; description: string;
    shop: string; story: string; username: string;
    like_count: number; dislike_count: number; vote_count: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/characters/${id}`)
      .then((r) => r.json())
      .then((d) => d.success && setData(d.data));
  }, [id]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted">加载中...</div>
      </div>
    );
  }

  let shopItems: ShopItem[] = [];
  try { shopItems = JSON.parse(data.shop); } catch { /* ignore */ }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted hover:text-foreground transition-colors mb-6 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted">🎭 角色</span>
          <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-sm font-medium">
            {data.role}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">{data.name}</h1>
        <p className="text-muted mt-2 break-words">{data.short_desc}</p>
        <p className="text-sm text-muted mt-3">
          作者：<span className="text-foreground font-medium">{data.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <span className="text-sm">👍 {data.like_count || 0}</span>
        <span className="text-sm">👎 {data.dislike_count || 0}</span>
        <span className="text-sm">🗳️ {data.vote_count || 0} 票</span>
      </div>

      {/* 角色描述 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">🎯 角色描述</h2>
        <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
          {data.description}
        </p>
      </section>

      {/* 角色商店 */}
      {shopItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">🏪 角色商店</h2>
          <div className="space-y-2">
            {shopItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-accent-light/30 rounded-xl px-4 py-3"
              >
                <span className="text-base font-medium text-foreground break-words">{item.name}</span>
                <span className="text-sm text-accent shrink-0 ml-4">{item.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 角色故事 */}
      {data.story && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">📖 背景故事</h2>
          <p className="text-base text-foreground/70 leading-relaxed whitespace-pre-wrap break-words">
            {data.story}
          </p>
        </section>
      )}
    </div>
  );
}
