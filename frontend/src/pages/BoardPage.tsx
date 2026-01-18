/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 BoardPage 页面组件
 * [POS]: pages 模块的看板页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

function BoardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ------------------------------------------------------------------ */}
      {/*  顶部导航                                                          */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Kanban Board</h1>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            + 新建任务
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*  看板主体                                                          */}
      {/* ------------------------------------------------------------------ */}
      <main className="p-6">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {/* Todo 列 */}
          <div className="flex-shrink-0 w-80 bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">Todo</h2>
              <span className="text-sm text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                0
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-slate-500 text-center">
                暂无任务
              </div>
            </div>
          </div>

          {/* Doing 列 */}
          <div className="flex-shrink-0 w-80 bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">Doing</h2>
              <span className="text-sm text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                0
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-slate-500 text-center">
                暂无任务
              </div>
            </div>
          </div>

          {/* Done 列 */}
          <div className="flex-shrink-0 w-80 bg-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">Done</h2>
              <span className="text-sm text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                0
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-slate-500 text-center">
                暂无任务
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BoardPage;
