/**
 * [INPUT]: 依赖 react
 * [OUTPUT]: 对外提供 EmptyState 组件
 * [POS]: kanban 模块的空状态引导组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  columnName: string;
  onAddTask: () => void;
}

export function EmptyState({ columnName, onAddTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Plus className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-3">
        {columnName} 暂无任务
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTask}
        className="gap-1"
      >
        <Plus className="w-4 h-4" />
        添加任务
      </Button>
    </div>
  );
}
