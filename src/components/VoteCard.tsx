"use client";

interface VoteCardProps {
  type: "character" | "modifier";
  id: number;
  name: string;
  username: string;
  subtitle?: string;
  description: string;
  voteCount: number;
  userVoted: boolean;
  onVote: () => void;
  disabled: boolean;
}

export default function VoteCard({
  name,
  username,
  subtitle,
  description,
  voteCount,
  userVoted,
  onVote,
  disabled,
}: VoteCardProps) {
  return (
    <div className={`bg-white rounded-3xl border p-5 transition-all ${
      userVoted ? "border-accent/50 ring-2 ring-accent/20" : "border-border hover:shadow-md"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-lg">{name}</h3>
            {subtitle && (
              <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium">
                {subtitle}
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            作者：<span className="text-foreground font-medium">{username}</span>
          </p>
        </div>
        {userVoted && (
          <span className="shrink-0 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
            ✓ 已投票
          </span>
        )}
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-wrap line-clamp-3">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">🗳️ {voteCount} 票</span>
        <button
          onClick={onVote}
          disabled={disabled}
          className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
            userVoted
              ? "bg-green-50 text-green-600 cursor-default"
              : "bg-accent text-white hover:opacity-90"
          } disabled:opacity-50`}
        >
          {userVoted ? "已投票" : "投票"}
        </button>
      </div>
    </div>
  );
}
