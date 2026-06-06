"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    id: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleNext = () => {
    if (!form.id || !form.username || !form.password || !form.confirmPassword) {
      setError("请填写所有必填项");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (form.password.length < 6) {
      setError("密码长度至少6位");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { id: form.id, username: form.username, password: form.password, bio: form.bio }
        : { id: form.id, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/browse");
      } else {
        setError(data.error || "操作失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-border bg-white text-foreground placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all text-sm";

  return (
    <div className="max-w-md mx-auto">
      {/* 切换登录/注册 */}
      <div className="flex bg-border/50 rounded-2xl p-1 mb-8">
        <button
          onClick={() => { setIsRegister(false); setStep(1); setError(""); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            !isRegister ? "bg-white text-accent shadow-sm" : "text-muted"
          }`}
        >
          登录
        </button>
        <button
          onClick={() => { setIsRegister(true); setStep(1); setError(""); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isRegister ? "bg-white text-accent shadow-sm" : "text-muted"
          }`}
        >
          注册
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!isRegister ? (
        /* 登录表单 */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">用户ID</label>
            <input
              type="text"
              className={inputClass}
              placeholder="请输入用户ID"
              value={form.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">密码</label>
            <input
              type="password"
              className={inputClass}
              placeholder="请输入密码"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      ) : step === 1 ? (
        /* 注册第一步 */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">用户ID</label>
            <input
              type="text"
              className={inputClass}
              placeholder="2-20个字符"
              value={form.id}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">用户名称</label>
            <input
              type="text"
              className={inputClass}
              placeholder="你的昵称"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">密码</label>
            <input
              type="password"
              className={inputClass}
              placeholder="至少6位"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">再次输入密码</label>
            <input
              type="password"
              className={inputClass}
              placeholder="确认密码"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
            />
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-2xl bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            下一步
          </button>
        </div>
      ) : (
        /* 注册第二步 */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">个人简介</label>
            <textarea
              className={inputClass}
              rows={3}
              placeholder="向大家介绍一下自己吧（选填）"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-2xl border border-border text-muted font-medium text-sm hover:bg-accent-light transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-accent text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "注册中..." : "完成注册"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
