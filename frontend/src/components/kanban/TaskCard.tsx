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
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
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
