/**
 * [INPUT]: 依赖 react
 * [OUTPUT]: 对外提供 Topbar 组件
 * [POS]: layout 组件的顶部导航，支持搜索回调和 ⌘K 快捷键
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef } from "react";

interface TopbarProps {
  title?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Topbar({
  title = "项目看板",
  searchQuery = "",
  onSearchChange,
}: TopbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K 快捷键聚焦搜索框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-border px-6 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <i className="fas fa-columns text-white text-lg"></i>
          </div>
          <h1 className="text-lg font-semibold text-text">{title}</h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-4 py-2.5 w-80">
          <i className="fas fa-search text-gray-400 mr-3"></i>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-text placeholder-gray-400"
          />
          <kbd className="hidden lg:block text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  );
}
