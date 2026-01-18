/**
 * [INPUT]: 依赖 react, Topbar
 * [OUTPUT]: 对外提供 AppShell 组件
 * [POS]: layout 组件的应用外壳
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <Topbar title={title} />
      <main className="pt-28 px-4 pb-8 h-screen flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
