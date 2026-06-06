"use client";

import { useState } from "react";

interface ReactionButtonsProps {
  submissionType: "character" | "modifier";
  submissionId: number;
  initialLike: number;
  initialDislike: number;
  initialUserReaction?: "like" | "dislike" | null;
}

export default function ReactionButtons({
  submissionType,
  submissionId,
  initialLike,
  initialDislike,
  initialUserReaction,
}: ReactionButtonsProps) {
  const [likes, setLikes] = useState(initialLike);
  const [dislikes, setDislikes] = useState(initialDislike);
  const [userReaction, setUserReaction] = useState(initialUserReaction || null);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (reaction: "like" | "dislike") => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: submissionType, submissionId, reaction }),
      });
      const data = await res.json();

      if (data.success) {
        // 切换反应
        if (userReaction === reaction) {
          // 取消
          setUserReaction(null);
          if (reaction === "like") setLikes((l) => l - 1);
          else setDislikes((d) => d - 1);
        } else {
          // 切换或新增
          if (userReaction === "like") setLikes((l) => l - 1);
          if (userReaction === "dislike") setDislikes((d) => d - 1);
          setUserReaction(reaction);
          if (reaction === "like") setLikes((l) => l + 1);
          else setDislikes((d) => d + 1);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleReaction("like")}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all ${
          userReaction === "like"
            ? "bg-green-50 text-green-600"
            : "text-muted hover:bg-gray-50 hover:text-green-600"
        }`}
      >
        👍 <span>{likes}</span>
      </button>
      <button
        onClick={() => handleReaction("dislike")}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all ${
          userReaction === "dislike"
            ? "bg-red-50 text-red-500"
            : "text-muted hover:bg-gray-50 hover:text-red-500"
        }`}
      >
        👎 <span>{dislikes}</span>
      </button>
    </div>
  );
}
