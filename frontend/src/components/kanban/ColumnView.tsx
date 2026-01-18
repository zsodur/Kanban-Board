/**
 * [INPUT]: 依赖 react, @dnd-kit/*, types/kanban, TaskCard
 * [OUTPUT]: 对外提供 ColumnView 组件
 * [POS]: kanban 组件的列视图
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
  const taskIds = sortedTasks.map((t) => t.id);

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg flex flex-col max-h-full">
      {/* 列头 */}
      <div className="p-3 font-semibold text-gray-700 flex items-center justify-between">
        <span>{column.title}</span>
        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* 任务列表 */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] transition-colors ${
          isOver ? "bg-blue-50" : ""
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            暂无任务
          </div>
        )}
      </div>

      {/* 添加任务按钮 */}
      <button
        onClick={onAddTask}
        className="m-2 p-2 text-sm text-gray-500 hover:bg-gray-200 rounded transition-colors flex items-center justify-center gap-1"
      >
        <span>+</span>
        <span>添加任务</span>
      </button>
    </div>
  );
}
