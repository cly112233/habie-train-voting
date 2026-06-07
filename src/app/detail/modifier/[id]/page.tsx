"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ModifierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    name: string; description: string; story: string; username: string;
    like_count: number; dislike_count: number; vote_count: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/modifiers/${id}`)
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-muted hover:text-foreground transition-colors mb-6 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div className="mb-8">
        <span className="text-sm text-muted">✨ 修饰符</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2 break-words">{data.name}</h1>
        <p className="text-sm text-muted mt-3">
          作者：<span className="text-foreground font-medium">{data.username}</span>
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
        <span className="text-sm">👍 {data.like_count || 0}</span>
        <span className="text-sm">👎 {data.dislike_count || 0}</span>
        <span className="text-sm">🗳️ {data.vote_count || 0} 票</span>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">📝 描述</h2>
        <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
          {data.description}
        </p>
      </section>

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
