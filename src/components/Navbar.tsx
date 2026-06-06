"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  username: string;
  avatar: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});
  }, [pathname]);

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-accent text-white"
        : "text-muted hover:text-foreground hover:bg-accent-light"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🎭</span>
          <span className="font-semibold text-foreground text-base hidden sm:inline">
            哈比列车投票
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/submit" className={linkClass("/submit")}>
            投稿
          </Link>
          <Link href="/browse" className={linkClass("/browse")}>
            查看投稿
          </Link>
          <Link href="/vote" className={linkClass("/vote")}>
            投票
          </Link>
          {user && (
            <Link href="/profile" className={linkClass("/profile")}>
              我的
            </Link>
          )}
          {user ? (
            <Link
              href="/profile"
              className="ml-3 flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-accent-light transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent-light overflow-hidden flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-accent font-medium">
                    {user.username.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-foreground">{user.username}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-5 py-2 rounded-full text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
            >
              登录
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-accent-light transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
          <Link href="/submit" className={linkClass("/submit")} onClick={() => setMenuOpen(false)}>
            投稿
          </Link>
          <Link href="/browse" className={linkClass("/browse")} onClick={() => setMenuOpen(false)}>
            查看投稿
          </Link>
          <Link href="/vote" className={linkClass("/vote")} onClick={() => setMenuOpen(false)}>
            投票
          </Link>
          {user && (
            <Link href="/profile" className={linkClass("/profile")} onClick={() => setMenuOpen(false)}>
              我的
            </Link>
          )}
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-foreground hover:bg-accent-light transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-7 h-7 rounded-full bg-accent-light overflow-hidden flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-accent font-medium">{user.username.charAt(0)}</span>
                )}
              </div>
              {user.username}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-sm font-medium bg-accent text-white text-center"
              onClick={() => setMenuOpen(false)}
            >
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
