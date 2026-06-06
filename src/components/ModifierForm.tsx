"use client";

import { useState } from "react";

interface ModifierFormProps {
  defaultValues?: {
    name: string;
    description: string;
    story: string;
  };
  onSuccess?: () => void;
}

export default function ModifierForm({ defaultValues, onSuccess }: ModifierFormProps) {
  const [form, setForm] = useState({
    name: defaultValues?.name || "",
    description: defaultValues?.description || "",
    story: defaultValues?.story || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("请填写名称");
      return;
    }
    if (!form.description.trim()) {
      setError("请填写描述");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/modifiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("投稿成功！");
        if (!defaultValues) {
          setForm({ name: "", description: "", story: "" });
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

      <div>
        <label className={labelClass}>
          名称 <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={inputClass}
          placeholder="修饰符名称"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>
          描述 <span className="text-danger">*</span>
          <span className="text-muted font-normal ml-1">（修饰符的作用）</span>
        </label>
        <textarea
          className={inputClass}
          rows={4}
          placeholder="请描述这个修饰符的作用..."
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>
          故事 <span className="text-muted font-normal">（选填）</span>
        </label>
        <textarea
          className={inputClass}
          rows={3}
          placeholder="修饰符的背景故事..."
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
