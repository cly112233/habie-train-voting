"use client";

import { useState, useEffect } from "react";
import TabSwitch from "@/components/TabSwitch";
import CycleStatusBanner from "@/components/CycleStatusBanner";
import CharacterForm from "@/components/CharacterForm";
import ModifierForm from "@/components/ModifierForm";
import AuthGuard from "@/components/AuthGuard";
import type { CycleStatus } from "@/types";

function SubmitContent() {
  const [tab, setTab] = useState("character");
  const [charStatus, setCharStatus] = useState<CycleStatus | null>(null);
  const [modStatus, setModStatus] = useState<CycleStatus | null>(null);

  useEffect(() => {
    fetch("/api/cycles/current?type=character")
      .then((r) => r.json())
      .then((d) => d.success && setCharStatus(d.data));
    fetch("/api/cycles/current?type=modifier")
      .then((r) => r.json())
      .then((d) => d.success && setModStatus(d.data));
  }, []);

  const status = tab === "character" ? charStatus : modStatus;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">📬 投稿</h1>
      <p className="text-muted text-sm mb-6">
        分享你设计的自制角色或修饰符，参与社区投票
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

      {status && (
        <div className="mb-6">
          <CycleStatusBanner status={status} />
        </div>
      )}

      {status?.isOpen ? (
        tab === "character" ? (
          <CharacterForm />
        ) : (
          <ModifierForm />
        )
      ) : status ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">
            {status.isVoting ? "🗳️" : "🔒"}
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            投稿功能已关闭
          </h2>
          <p className="text-muted text-sm mb-6">
            {status.isVoting
              ? "当前为投票时间，请前往投票页参与投票"
              : "本期投稿已结束，请等待下一周期"}
          </p>
          {status.isVoting && (
            <a
              href="/vote"
              className="inline-block px-6 py-3 rounded-2xl bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              前往投票
            </a>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="animate-pulse text-muted">加载中...</div>
        </div>
      )}
    </div>
  );
}

export default function SubmitPage() {
  return (
    <AuthGuard>
      <SubmitContent />
    </AuthGuard>
  );
}
