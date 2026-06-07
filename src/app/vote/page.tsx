"use client";

import { useState, useEffect, useCallback } from "react";
import TabSwitch from "@/components/TabSwitch";
import CycleStatusBanner from "@/components/CycleStatusBanner";
import VoteCard from "@/components/VoteCard";
import RankingCard from "@/components/RankingCard";
import AuthGuard from "@/components/AuthGuard";
import type { CycleStatus, Character, Modifier } from "@/types";

interface CycleInfo {
  id: number;
  type: string;
  start_date: string;
  voting_end_date: string;
  is_current: boolean;
  phase: string;
}

function VoteContent() {
  const [tab, setTab] = useState("character");
  const [charStatus, setCharStatus] = useState<CycleStatus | null>(null);
  const [modStatus, setModStatus] = useState<CycleStatus | null>(null);
  const [submissions, setSubmissions] = useState<(Character | Modifier)[]>([]);
  const [rankings, setRankings] = useState<{ rank: number; submission_id: number; name: string; username: string; vote_count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 往期周期列表
  const [cycles, setCycles] = useState<CycleInfo[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const status = tab === "character" ? charStatus : modStatus;

  // 加载周期状态 + 周期列表
  useEffect(() => {
    Promise.all([
      fetch("/api/cycles/current?type=character").then((r) => r.json()),
      fetch("/api/cycles/current?type=modifier").then((r) => r.json()),
    ]).then(([charData, modData]) => {
      if (charData.success) setCharStatus(charData.data);
      if (modData.success) setModStatus(modData.data);
    });
  }, []);

  // 加载周期列表
  useEffect(() => {
    fetch(`/api/cycles?type=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCycles(d.data);
          // 默认选中：如果是投票期就选当前周期，否则选上一个
          if (d.data.length > 0) {
            const current = d.data.find((c: CycleInfo) => c.is_current);
            if (current && current.phase === "voting") {
              setSelectedCycleId(current.id);
            } else if (d.data.length >= 2 && current) {
              // 当前不是投票期，默认显示上一周期
              setSelectedCycleId(d.data[1].id);
            } else {
              setSelectedCycleId(d.data[0].id);
            }
          }
        }
      });
  }, [tab]);

  // 加载选中周期的数据
  const loadData = useCallback(async () => {
    if (!selectedCycleId) return;
    setLoading(true);

    const selectedCycle = cycles.find((c) => c.id === selectedCycleId);
    const isCurrentVoting = selectedCycle?.is_current && status?.isVoting;

    if (isCurrentVoting) {
      // 当前投票期 → 加载投稿列表
      const api = tab === "character" ? "/api/characters" : "/api/modifiers";
      const res = await fetch(`${api}?cycle_id=${selectedCycleId}`);
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
    } else {
      // 往期或非投票期 → 加载排名
      setSubmissions([]);
      const res = await fetch(`/api/vote/results?type=${tab}&cycle_id=${selectedCycleId}`);
      const data = await res.json();
      if (data.success) setRankings(data.data);
      else setRankings([]);
    }
    setLoading(false);
  }, [tab, selectedCycleId, cycles, status]);

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
        loadData();
      } else {
        setError(data.error || "投票失败");
      }
    } catch {
      setError("网络错误");
    }
  };

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);
  const isCurrentVoting = selectedCycle?.is_current && status?.isVoting;

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
          onTabChange={(t) => { setTab(t); setError(""); setSelectedCycleId(null); }}
        />
      </div>

      {status && (
        <div className="mb-4">
          <CycleStatusBanner status={status} />
        </div>
      )}

      {/* 往期选择器 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">📅 选择周期</label>
        <select
          className="w-full md:w-72 px-4 py-2.5 rounded-2xl border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          value={selectedCycleId || ""}
          onChange={(e) => setSelectedCycleId(Number(e.target.value))}
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.start_date} ~ {c.voting_end_date}
              {c.is_current ? " 【当前】" : ""}
              {!c.is_current && c.phase === "results" ? " 【已结束】" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-muted text-lg">加载中...</div>
        </div>
      ) : isCurrentVoting ? (
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
          <p className="text-muted text-sm">该周期没有投票数据</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground mb-3">
            🏆 {tab === "character" ? "角色" : "修饰符"} — {selectedCycle?.start_date} ~ {selectedCycle?.voting_end_date} 排名
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
