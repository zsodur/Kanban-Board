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
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-3 w-72 rotate-3">
      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}
