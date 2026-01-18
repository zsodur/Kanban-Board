/**
 * [INPUT]: 依赖 react, @dnd-kit/sortable, types/kanban
 * [OUTPUT]: 对外提供 TaskCard 组件
 * [POS]: kanban 组件的任务卡片
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types/kanban";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // 拖拽时完全隐藏原卡片，由 DragOverlay 显示
    opacity: isDragging ? 0 : 1,
    // 保持占位空间
    visibility: isDragging ? ("hidden" as const) : ("visible" as const),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group border border-transparent hover:border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">
          #{task.id.slice(0, 8)}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <i className="fas fa-ellipsis text-gray-400"></i>
        </div>
      </div>

      <h3 className="font-medium text-text mb-2 line-clamp-2">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Placeholder for tags/avatar to match visual style without adding features */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">Task</span> */}
        </div>
        <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
             <i className="fas fa-user text-xs text-gray-400"></i>
        </div>
      </div>
    </div>
  );
}
