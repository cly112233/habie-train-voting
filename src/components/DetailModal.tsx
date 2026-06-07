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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl w-full max-w-2xl mx-2 max-h-[92vh] overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-muted">
                  {type === "character" ? "🎭 角色" : "✨ 修饰符"}
                </span>
                {subtitle && (
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium">
                    {subtitle}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground break-words">{name}</h2>
              {shortDesc && (
                <p className="text-sm text-muted mt-1 break-words">{shortDesc}</p>
              )}
              <p className="text-xs text-muted mt-2">
                作者：<span className="text-foreground font-medium">{username}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl hover:bg-accent-light transition-colors text-muted"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* 描述 */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">
              {type === "character" ? "🎯 角色描述" : "📝 描述"}
            </h3>
            <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
              {description}
            </p>
          </div>

          {/* 商店道具 */}
          {shopItems && shopItems.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">🏪 角色商店</h3>
              <div className="space-y-2">
                {shopItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-accent-light/30 rounded-xl px-4 py-3"
                  >
                    <span className="text-base font-medium text-foreground break-words">{item.name}</span>
                    <span className="text-sm text-accent shrink-0 ml-4">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 背景故事 */}
          {story && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">📖 背景故事</h3>
              <p className="text-base text-foreground/70 leading-relaxed whitespace-pre-wrap break-words">
                {story}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
