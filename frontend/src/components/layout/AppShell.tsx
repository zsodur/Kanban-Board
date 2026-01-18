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
    <div className="h-screen flex flex-col bg-gray-50">
      <Topbar title={title} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
