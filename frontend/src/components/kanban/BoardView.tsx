/**
 * [INPUT]: 依赖 react, @dnd-kit/*, hooks/useBoard, hooks/useWebSocket, store/uiStore, 子组件
 * [OUTPUT]: 对外提供 BoardView 组件
 * [POS]: kanban 组件的看板容器，拖拽核心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { ColumnView } from "./ColumnView";
import { DragOverlayCard } from "./DragOverlayCard";
import { TaskEditorDialog } from "./TaskEditorDialog";
import {
  useColumns,
  useTasks,
  useMoveTask,
  useCreateTask,
} from "../../hooks/useBoard";
import { useWebSocket } from "../../hooks/useWebSocket";
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

  // WebSocket 实时同步
  useWebSocket(boardId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // 列 ID 集合
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // 按列分组任务
  const tasksByColumn = useMemo(() => {
    const map = new Map<string, Task[]>();
    columns.forEach((col) => map.set(col.id, []));
    tasks.forEach((task) => {
      const list = map.get(task.column_id);
      if (list) list.push(task);
    });
    // 按 position 排序
    map.forEach((taskList) => {
      taskList.sort((a, b) => a.position - b.position);
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
  //  自定义碰撞检测：优先检测任务，其次检测列容器
  // -------------------------------------------------------------------------
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      // 首先检查是否与任务碰撞
      const pointerCollisions = pointerWithin(args);
      const intersectionCollisions = rectIntersection(args);

      // 合并碰撞结果
      const collisions = pointerCollisions.length > 0 ? pointerCollisions : intersectionCollisions;

      // 过滤出任务和列的碰撞
      const taskCollisions = collisions.filter(
        (collision) => !columnIds.includes(collision.id as string)
      );
      const columnCollisions = collisions.filter((collision) =>
        columnIds.includes(collision.id as string)
      );

      // 优先返回任务碰撞，否则返回列碰撞
      if (taskCollisions.length > 0) {
        return taskCollisions;
      }
      if (columnCollisions.length > 0) {
        return columnCollisions;
      }

      // 使用 closestCenter 作为后备
      return closestCenter(args);
    },
    [columnIds]
  );

  // -------------------------------------------------------------------------
  //  查找任务所属列
  // -------------------------------------------------------------------------
  const findColumnId = (id: UniqueIdentifier): string | null => {
    // 是否是列 ID
    if (columnIds.includes(id as string)) {
      return id as string;
    }
    // 查找任务所属列
    const task = tasks.find((t) => t.id === id);
    return task?.column_id || null;
  };

  // -------------------------------------------------------------------------
  //  拖拽事件
  // -------------------------------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      setActiveColumnId(task.column_id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const overColumnId = findColumnId(over.id);
    if (overColumnId && overColumnId !== activeColumnId) {
      setActiveColumnId(overColumnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumnId(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // 判断目标列和位置
    let targetColumnId: string;
    let targetPosition: number;

    const isOverColumn = columnIds.includes(over.id as string);

    if (isOverColumn) {
      // 放到列容器上，追加到末尾
      targetColumnId = over.id as string;
      const columnTasks = tasksByColumn.get(targetColumnId) || [];
      // 如果是同列，不算自己
      if (task.column_id === targetColumnId) {
        targetPosition = columnTasks.length - 1;
      } else {
        targetPosition = columnTasks.length;
      }
    } else {
      // 放到任务上，插入到该任务位置
      const targetTask = tasks.find((t) => t.id === over.id);
      if (!targetTask) return;

      targetColumnId = targetTask.column_id;
      const columnTasks = tasksByColumn.get(targetColumnId) || [];
      const targetIndex = columnTasks.findIndex((t) => t.id === over.id);

      if (task.column_id === targetColumnId) {
        // 同列移动
        const currentIndex = columnTasks.findIndex((t) => t.id === taskId);
        if (currentIndex < targetIndex) {
          targetPosition = targetIndex;
        } else {
          targetPosition = targetIndex;
        }
      } else {
        // 跨列移动
        targetPosition = targetIndex;
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
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
