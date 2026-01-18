/**
 * [INPUT]: 依赖 react, Topbar, uiStore
 * [OUTPUT]: 对外提供 AppShell 组件
 * [POS]: layout 组件的应用外壳，集成搜索状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Topbar } from "./Topbar";
import { useUIStore } from "../../store/uiStore";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="min-h-screen bg-surface font-sans">
      <Topbar
        title={title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="pt-28 px-4 pb-8 h-screen flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
