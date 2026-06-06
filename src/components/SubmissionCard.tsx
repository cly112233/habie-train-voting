"use client";

import { useState } from "react";
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
  likeCount,
  dislikeCount,
  voteCount,
  userReaction,
}: SubmissionCardProps) {
  const [showSuggest, setShowSuggest] = useState(false);

  return (
    <>
      <div className="bg-white rounded-3xl border border-border p-5 hover:shadow-md transition-shadow">
        {/* Header */}
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
            {shortDesc && (
              <p className="text-muted text-xs mt-0.5">{shortDesc}</p>
            )}
            <p className="text-xs text-muted mt-1">
              作者：<span className="text-foreground font-medium">{username}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-3 whitespace-pre-wrap">
          {description}
        </p>

        {/* Shop Items */}
        {shopItems && shopItems.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-muted font-medium">🏪 角色商店</span>
            <div className="mt-1.5 space-y-1">
              {shopItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-accent-light/30 rounded-xl px-3 py-2 text-sm">
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-accent text-xs">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra fields (story etc) */}
        {extra && extra.length > 0 && (
          <div className="space-y-2 mb-3">
            {extra.map((e) => (
              e.value && (
                <div key={e.label} className="text-sm">
                  <span className="text-muted">{e.label}：</span>
                  <span className="text-foreground">{e.value}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <ReactionButtons
            submissionType={type}
            submissionId={id}
            initialLike={likeCount}
            initialDislike={dislikeCount}
            initialUserReaction={userReaction}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">🗳️ {voteCount} 票</span>
            <button
              onClick={() => setShowSuggest(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-muted hover:bg-accent-light hover:text-accent transition-all"
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
