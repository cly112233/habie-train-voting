"use client";

interface ShopItem {
  name: string;
  price: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "character" | "modifier";
  name: string;
  subtitle?: string;
  shortDesc?: string;
  description: string;
  shopItems?: ShopItem[];
  story?: string;
  username: string;
}

export default function DetailModal({
  isOpen,
  onClose,
  type,
  name,
  subtitle,
  shortDesc,
  description,
  shopItems,
  story,
  username,
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-3xl px-6 pt-6 pb-4 border-b border-border z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted">
                  {type === "character" ? "🎭 角色" : "✨ 修饰符"}
                </span>
                {subtitle && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium">
                    {subtitle}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              {shortDesc && (
                <p className="text-sm text-muted mt-1">{shortDesc}</p>
              )}
              <p className="text-xs text-muted mt-2">
                作者：<span className="text-foreground font-medium">{username}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 ml-3 p-1.5 rounded-xl hover:bg-accent-light transition-colors text-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* 角色描述 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              {type === "character" ? "角色描述" : "描述"}
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {/* 商店道具 */}
          {shopItems && shopItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">🏪 角色商店</h3>
              <div className="space-y-1.5">
                {shopItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-accent-light/30 rounded-xl px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-accent">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 角色故事 */}
          {story && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">📖 背景故事</h3>
              <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                {story}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
