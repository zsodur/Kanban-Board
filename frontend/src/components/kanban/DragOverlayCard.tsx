/**
 * [INPUT]: 依赖 react, types/kanban
 * [OUTPUT]: 对外提供 DragOverlayCard 组件
 * [POS]: kanban 组件的拖拽浮层卡片
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { Task } from "../../types/kanban";

interface DragOverlayCardProps {
  task: Task;
}

export function DragOverlayCard({ task }: DragOverlayCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-xl border border-primary/20 w-72 cursor-grabbing">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          #{task.id.slice(0, 8)}
        </span>
        <div>
          <i className="fas fa-ellipsis text-gray-400"></i>
        </div>
      </div>

      <h3 className="font-medium text-text mb-2 line-clamp-2">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}
