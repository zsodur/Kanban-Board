/**
 * [INPUT]: 依赖 react, @dnd-kit/core, types/kanban, TaskCard
 * [OUTPUT]: 对外提供 ColumnView 组件
 * [POS]: kanban 组件的列视图，SortableContext 由父级 BoardView 提供
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import type { Column, Task } from "../../types/kanban";

interface ColumnViewProps {
  column: Column;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
}

export function ColumnView({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: ColumnViewProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-2xl border border-border p-4 h-full flex flex-col">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getColumnColor(column.title)}`}></div>
            <h2 className="font-semibold text-text">{column.title}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Tasks List - SortableContext 由父级 BoardView 提供 */}
        <div
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto space-y-3 min-h-[100px] transition-colors scrollbar-hide ${
            isOver ? "bg-gray-50/50 rounded-xl" : ""
          }`}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <i className="fas fa-plus text-sm"></i>
          <span className="text-sm font-medium">添加任务</span>
        </button>
      </div>
    </div>
  );
}

function getColumnColor(title: string): string {
  if (title.includes("待处理")) return "bg-gray-400";
  if (title.includes("进行中")) return "bg-primary";
  if (title.includes("审核")) return "bg-yellow-400";
  if (title.includes("完成")) return "bg-green-500";
  return "bg-primary";
}
