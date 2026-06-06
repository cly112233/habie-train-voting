"use client";

import { useState, useEffect } from "react";

interface SuggestModalProps {
  submissionType: "character" | "modifier";
  submissionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestModal({
  submissionType,
  submissionId,
  isOpen,
  onClose,
}: SuggestModalProps) {
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: number; username: string; content: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/suggestions?type=${submissionType}&submissionId=${submissionId}`)
        .then((r) => r.json())
        .then((d) => d.success && setSuggestions(d.data));
    }
  }, [isOpen, submissionType, submissionId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: submissionType, submissionId, content: content.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setContent("");
        fetch(`/api/suggestions?type=${submissionType}&submissionId=${submissionId}`)
          .then((r) => r.json())
          .then((d) => d.success && setSuggestions(d.data));
      } else {
        setError(data.error || "提交失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">💡 建议</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-accent-light transition-colors text-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">暂无建议，来留下第一条吧</p>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="bg-accent-light/50 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-accent">{s.username}</span>
                  <span className="text-xs text-muted">{s.created_at}</span>
                </div>
                <p className="text-sm text-foreground">{s.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-4 border-t border-border bg-white">
          {error && <p className="text-xs text-danger mb-2">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              placeholder="写下你的建议..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="px-5 py-2.5 rounded-2xl bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
