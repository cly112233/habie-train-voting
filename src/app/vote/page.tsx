"use client";

import { useState, useEffect, useCallback } from "react";
import TabSwitch from "@/components/TabSwitch";
import CycleStatusBanner from "@/components/CycleStatusBanner";
import VoteCard from "@/components/VoteCard";
import RankingCard from "@/components/RankingCard";
import AuthGuard from "@/components/AuthGuard";
import type { CycleStatus, Character, Modifier } from "@/types";

function VoteContent() {
  const [tab, setTab] = useState("character");
  const [charStatus, setCharStatus] = useState<CycleStatus | null>(null);
  const [modStatus, setModStatus] = useState<CycleStatus | null>(null);
  const [submissions, setSubmissions] = useState<(Character | Modifier)[]>([]);
  const [rankings, setRankings] = useState<{ rank: number; submission_id: number; name: string; username: string; vote_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const status = tab === "character" ? charStatus : modStatus;

  // 加载周期状态
  useEffect(() => {
    Promise.all([
      fetch("/api/cycles/current?type=character").then((r) => r.json()),
      fetch("/api/cycles/current?type=modifier").then((r) => r.json()),
    ]).then(([charData, modData]) => {
      if (charData.success) setCharStatus(charData.data);
      if (modData.success) setModStatus(modData.data);
    });
  }, []);

  // 加载数据
  const loadData = useCallback(async () => {
    if (!status) return;
    setLoading(true);

    if (status.isVoting) {
      // 投票中 — 加载当前周期投稿
      const api = tab === "character" ? "/api/characters" : "/api/modifiers";
      const res = await fetch(`${api}?cycle_id=${status.cycle?.id}`);
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
    } else {
      // 非投票时间 — 显示上一周期排名
      const res = await fetch(`/api/vote/results?type=${tab}`);
      const data = await res.json();
      if (data.success) setRankings(data.data);
    }
    setLoading(false);
  }, [tab, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVote = async (submissionId: number) => {
    setError("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, submissionId }),
      });
      const data = await res.json();

      if (data.success) {
        loadData(); // 刷新
      } else {
        setError(data.error || "投票失败");
      }
    } catch {
      setError("网络错误");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">🗳️ 投票</h1>
      <p className="text-muted text-sm mb-6">
        为你喜欢的投稿投上宝贵的一票
      </p>

      <div className="mb-6">
        <TabSwitch
          tabs={[
            { key: "character", label: "🎭 角色投票" },
            { key: "modifier", label: "✨ 修饰符投票" },
          ]}
          activeTab={tab}
          onTabChange={(t) => { setTab(t); setError(""); }}
        />
      </div>

      {status && (
        <div className="mb-6">
          <CycleStatusBanner status={status} />
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-muted text-lg">加载中...</div>
        </div>
      ) : status?.isVoting ? (
        submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">暂无投稿可投票</h2>
            <p className="text-muted text-sm">等待玩家投稿后再来投票吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <VoteCard
                key={s.id}
                type={tab as "character" | "modifier"}
                id={s.id}
                name={s.name}
                username={s.username || "未知"}
                subtitle={"role" in s ? (s as Character).role : undefined}
                description={s.description}
                voteCount={s.vote_count || 0}
                userVoted={false}
                onVote={() => handleVote(s.id)}
                disabled={false}
              />
            ))}
          </div>
        )
      ) : rankings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">暂无排名数据</h2>
          <p className="text-muted text-sm">上一周期没有投票数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground mb-3">
            🏆 {tab === "character" ? "角色" : "修饰符"} — 上一周期排名
          </h3>
          {rankings.map((r) => (
            <RankingCard
              key={r.submission_id}
              rank={r.rank}
              name={r.name}
              username={r.username}
              voteCount={r.vote_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VotePage() {
  return (
    <AuthGuard>
      <VoteContent />
    </AuthGuard>
  );
}
