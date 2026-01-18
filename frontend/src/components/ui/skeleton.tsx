/**
 * [INPUT]: 依赖 react
 * [OUTPUT]: 对外提供 Skeleton 组件
 * [POS]: ui 模块的加载骨架屏
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// -------------------------------------------------------------------------
//  看板专用骨架屏
// -------------------------------------------------------------------------
function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3 space-y-3">
      <Skeleton className="h-5 w-24" />
      <div className="space-y-2">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-4 overflow-x-auto h-full">
      <ColumnSkeleton />
      <ColumnSkeleton />
      <ColumnSkeleton />
    </div>
  );
}

export { Skeleton, TaskCardSkeleton, ColumnSkeleton, BoardSkeleton };
