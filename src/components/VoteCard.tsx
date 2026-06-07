"use client";

import { useRouter } from "next/navigation";

interface VoteCardProps {
  type: "character" | "modifier";
  id: number;
  name: string;
  username: string;
  subtitle?: string;
  shortDesc?: string;
  description: string;
  voteCount: number;
  userVoted: boolean;
  onVote: () => void;
  disabled: boolean;
}

export default function VoteCard({
  type,
  id,
  name,
  username,
  subtitle,
  shortDesc,
  description,
  voteCount,
  userVoted,
  onVote,
  disabled,
}: VoteCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/detail/${type}/${id}`)}
      className={`bg-white rounded-3xl border p-5 transition-all cursor-pointer flex flex-col h-[220px] ${
        userVoted ? "border-accent/50 ring-2 ring-accent/20" : "border-border hover:shadow-md hover:border-accent/30"
      }`}
    >
      {/* Header */}
      <div className="shrink-0 mb-2 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-base truncate">{name}</h3>
            {subtitle && (
              <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium shrink-0">
                {subtitle}
              </span>
            )}
          </div>
          {shortDesc && (
            <p className="text-muted text-xs mt-0.5 truncate">{shortDesc}</p>
          )}
          <p className="text-xs text-muted mt-1">
            作者：<span className="text-foreground font-medium">{username}</span>
          </p>
        </div>
        {userVoted && (
          <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
            已投票
          </span>
        )}
      </div>

      {/* Description - 2 line clamp */}
      <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-auto break-words">
        {description}
      </p>

      {/* Actions */}
      <div className="shrink-0 flex items-center justify-between pt-3 mt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-muted">🗳️ {voteCount} 票</span>
        <button
          onClick={onVote}
          disabled={disabled}
          className={`px-5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            userVoted
              ? "bg-green-50 text-green-600 cursor-default"
              : "bg-accent text-white hover:opacity-90"
          } disabled:opacity-50`}
        >
          {userVoted ? "✓ 已投票" : "投票"}
        </button>
      </div>
    </div>
  );
}
