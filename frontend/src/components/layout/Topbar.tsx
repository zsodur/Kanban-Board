/**
 * [INPUT]: 依赖 react
 * [OUTPUT]: 对外提供 Topbar 组件
 * [POS]: layout 组件的顶部导航
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "看板" }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b flex items-center px-4 shadow-sm">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
    </header>
  );
}
