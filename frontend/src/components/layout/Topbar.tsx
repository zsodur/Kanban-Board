/**
 * [INPUT]: 依赖 react
 * [OUTPUT]: 对外提供 Topbar 组件
 * [POS]: layout 组件的顶部导航
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "项目看板" }: TopbarProps) {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-border px-6 py-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <i className="fas fa-columns text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">{title}</h1>
            <p className="text-xs text-gray-500">Sprint 2024-01</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-4 py-2.5 w-80">
          <i className="fas fa-search text-gray-400 mr-3"></i>
          <input
            type="text"
            placeholder="搜索任务..."
            className="bg-transparent outline-none text-sm w-full text-text placeholder-gray-400"
          />
          <kbd className="hidden lg:block text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
            ⌘K
          </kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer">
            <i className="fas fa-bell text-gray-500"></i>
          </button>
          <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer">
            <i className="fas fa-cog text-gray-500"></i>
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
