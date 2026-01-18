/**
 * [INPUT]: 依赖 react, @dnd-kit/*, hooks/useBoard, store/uiStore, 子组件
 * [OUTPUT]: 对外提供 BoardView 组件
 * [POS]: kanban 组件的看板容器，拖拽核心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ColumnView } from "./ColumnView";
import { DragOverlayCard } from "./DragOverlayCard";
import { TaskEditorDialog } from "./TaskEditorDialog";
import {
  useColumns,
  useTasks,
  useMoveTask,
  useCreateTask,
} from "../../hooks/useBoard";
import { useUIStore } from "../../store/uiStore";
import type { Task } from "../../types/kanban";

interface BoardViewProps {
  boardId: string;
}

export function BoardView({ boardId }: BoardViewProps) {
  const { data: columns = [], isLoading: columnsLoading } = useColumns(boardId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(boardId);
  const moveTask = useMoveTask(boardId);
  const createTask = useCreateTask(boardId);
  const { openTaskDialog } = useUIStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 按列分组任务
  const tasksByColumn = useMemo(() => {
    const map = new Map<string, Task[]>();
    columns.forEach((col) => map.set(col.id, []));
    tasks.forEach((task) => {
      const list = map.get(task.column_id);
      if (list) list.push(task);
    });
    return map;
  }, [columns, tasks]);

  // 传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // -------------------------------------------------------------------------
  //  拖拽事件
  // -------------------------------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 判断目标列
    let targetColumnId = over.id as string;
    let targetPosition = 0;

    // over 可能是列 ID 或任务 ID
    const isOverColumn = columns.some((c) => c.id === over.id);
    if (isOverColumn) {
      // 放到列上，追加到末尾
      const columnTasks = tasksByColumn.get(targetColumnId) || [];
      targetPosition = columnTasks.length;
    } else {
      // 放到任务上，计算位置
      const targetTask = tasks.find((t) => t.id === over.id);
      if (targetTask) {
        targetColumnId = targetTask.column_id;
        const columnTasks = tasksByColumn.get(targetColumnId) || [];
        const sortedTasks = [...columnTasks].sort(
          (a, b) => a.position - b.position
        );
        targetPosition = sortedTasks.findIndex((t) => t.id === over.id);
        if (targetPosition === -1) targetPosition = sortedTasks.length;
      }
    }

    // 如果位置没变，跳过
    if (task.column_id === targetColumnId && task.position === targetPosition) {
      return;
    }

    moveTask.mutate({
      taskId,
      data: { column_id: targetColumnId, position: targetPosition },
    });
  };

  // -------------------------------------------------------------------------
  //  添加任务
  // -------------------------------------------------------------------------
  const handleAddTask = (columnId: string) => {
    const columnTasks = tasksByColumn.get(columnId) || [];
    const position = columnTasks.length;
    createTask.mutate({
      column_id: columnId,
      title: "新任务",
      position,
    });
  };

  // -------------------------------------------------------------------------
  //  渲染
  // -------------------------------------------------------------------------
  if (columnsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        加载中...
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 overflow-x-auto h-full">
          {columns
            .sort((a, b) => a.order_index - b.order_index)
            .map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                tasks={tasksByColumn.get(column.id) || []}
                onTaskClick={(task) => openTaskDialog(task.id)}
                onAddTask={() => handleAddTask(column.id)}
              />
            ))}
        </div>

        <DragOverlay>
          {activeTask && <DragOverlayCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <TaskEditorDialog boardId={boardId} tasks={tasks} />
    </>
  );
}
