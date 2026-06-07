"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactionButtons from "./ReactionButtons";
import SuggestModal from "./SuggestModal";

interface ShopItem {
  name: string;
  price: string;
}

interface SubmissionCardProps {
  type: "character" | "modifier";
  id: number;
  userId: string;
  username: string;
  name: string;
  subtitle?: string;
  shortDesc?: string;
  description: string;
  extra?: { label: string; value: string }[];
  shopItems?: ShopItem[];
  story?: string;
  likeCount: number;
  dislikeCount: number;
  voteCount: number;
  userReaction?: "like" | "dislike" | null;
  userVoted?: boolean;
}

export default function SubmissionCard({
  type,
  id,
  username,
  name,
  subtitle,
  shortDesc,
  description,
  extra,
  shopItems,
  story,
  likeCount,
  dislikeCount,
  voteCount,
  userReaction,
}: SubmissionCardProps) {
  const router = useRouter();
  const [showSuggest, setShowSuggest] = useState(false);

  const storyText = extra?.find((e) => e.label === "角色故事" || e.label === "故事")?.value || "";

  const handleClick = () => {
    router.push(`/detail/${type}/${id}`);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="bg-white rounded-3xl border border-border p-5 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer flex flex-col h-[220px]"
      >
        {/* Header - 固定高度 */}
        <div className="shrink-0 mb-2">
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

        {/* Description - 两行截断 */}
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-auto break-words">
          {description}
        </p>

        {/* Footer info */}
        <div className="shrink-0 flex items-center gap-2 mt-2">
          {shopItems && shopItems.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-accent-light/50 text-accent">
              🏪 x{shopItems.length}
            </span>
          )}
          {storyText && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-purple-50 text-purple-500">
              📖 有故事
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center justify-between pt-3 mt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <ReactionButtons
            submissionType={type}
            submissionId={id}
            initialLike={likeCount}
            initialDislike={dislikeCount}
            initialUserReaction={userReaction}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">🗳️ {voteCount}</span>
            <button
              onClick={() => setShowSuggest(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs text-muted hover:bg-accent-light hover:text-accent transition-all"
            >
              💡 建议
            </button>
          </div>
        </div>
      </div>

      <SuggestModal
        submissionType={type}
        submissionId={id}
        isOpen={showSuggest}
        onClose={() => setShowSuggest(false)}
      />
    </>
  );
}
