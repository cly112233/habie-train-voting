"use client";

import { useState } from "react";
import { CHARACTER_ROLES, type CharacterRole } from "@/types";

interface ShopItem {
  name: string;
  price: string;
}

interface CharacterFormProps {
  defaultValues?: {
    name: string;
    role: CharacterRole;
    short_desc: string;
    description: string;
    shop: string;
    story: string;
  };
  onSuccess?: () => void;
}

/** 解析 shop JSON，容错处理旧格式纯文本 */
function parseShop(raw: string): ShopItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((i: unknown) => i && typeof i === "object" && "name" in (i as object));
  } catch { /* 旧格式纯文本，忽略 */ }
  return [];
}

export default function CharacterForm({ defaultValues, onSuccess }: CharacterFormProps) {
  const [form, setForm] = useState({
    name: defaultValues?.name || "",
    role: defaultValues?.role || ("平民" as CharacterRole),
    short_desc: defaultValues?.short_desc || "",
    description: defaultValues?.description || "",
    story: defaultValues?.story || "",
  });
  const [shopItems, setShopItems] = useState<ShopItem[]>(
    parseShop(defaultValues?.shop || "")
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const addShopItem = () => {
    setShopItems((prev) => [...prev, { name: "", price: "" }]);
  };

  const removeShopItem = (index: number) => {
    setShopItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateShopItem = (index: number, field: keyof ShopItem, value: string) => {
    setShopItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("请填写角色名");
      return;
    }
    if (!form.short_desc.trim()) {
      setError("请填写角色简介");
      return;
    }
    if (form.short_desc.length > 20) {
      setError("角色简介不能超过20个字");
      return;
    }
    if (!form.description.trim()) {
      setError("请填写角色描述");
      return;
    }

    // 过滤掉空行
    const validItems = shopItems.filter((i) => i.name.trim() || i.price.trim());
    const shopJson = validItems.length > 0 ? JSON.stringify(validItems) : "";

    setLoading(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, shop: shopJson }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("投稿成功！");
        if (!defaultValues) {
          setForm({
            name: "",
            role: "平民",
            short_desc: "",
            description: "",
            story: "",
          });
          setShopItems([]);
        }
        onSuccess?.();
      } else {
        setError(data.error || "投稿失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-white text-foreground placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* 角色名 */}
      <div>
        <label className={labelClass}>
          角色名 <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="给你的角色取个名字"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      {/* 角色身份 */}
      <div>
        <label className={labelClass}>
          角色身份 <span className="text-danger">*</span>
        </label>
        <select
          className={inputClass}
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          {CHARACTER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 角色简介 */}
      <div>
        <label className={labelClass}>
          角色简介 <span className="text-danger">*</span>
          <span className="text-muted font-normal ml-1">（20字以内）</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="一句话概括角色"
          value={form.short_desc}
          maxLength={20}
          onChange={(e) => handleChange("short_desc", e.target.value)}
        />
        <div className="text-xs text-muted mt-1 text-right">{form.short_desc.length}/20</div>
      </div>

      {/* 角色描述 */}
      <div>
        <label className={labelClass}>
          角色描述 <span className="text-danger">*</span>
          <span className="text-muted font-normal ml-1">（角色的大致能力）</span>
        </label>
        <textarea
          className={inputClass}
          rows={4}
          placeholder="请描述这个角色的能力..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      {/* 角色商店 */}
      <div>
        <label className={labelClass}>
          角色商店 <span className="text-muted font-normal">（选填）</span>
        </label>

        <div className="space-y-2 mb-3">
          {shopItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-border bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                placeholder="道具名称"
                value={item.name}
                onChange={(e) => updateShopItem(index, "name", e.target.value)}
              />
              <input
                type="text"
                className="w-28 px-4 py-2.5 rounded-2xl border border-border bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                placeholder="价格"
                value={item.price}
                onChange={(e) => updateShopItem(index, "price", e.target.value)}
              />
              <button
                onClick={() => removeShopItem(index)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-danger hover:bg-red-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addShopItem}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-border text-muted text-sm hover:border-accent hover:text-accent hover:bg-accent-light transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加道具
        </button>
      </div>

      {/* 角色故事 */}
      <div>
        <label className={labelClass}>
          角色故事 <span className="text-muted font-normal">（选填）</span>
        </label>
        <textarea
          className={inputClass}
          rows={3}
          placeholder="角色的背景故事..."
          value={form.story}
          onChange={(e) => handleChange("story", e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-2xl bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "提交中..." : defaultValues ? "重新投递" : "提交投稿"}
      </button>
    </div>
  );
}
