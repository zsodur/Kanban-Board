/**
 * [INPUT]: 依赖 react, @dnd-kit/*, hooks/useBoard, hooks/useWebSocket, store/uiStore, 子组件, types/kanban
 * [OUTPUT]: 对外提供 BoardView 组件
 * [POS]: kanban 组件的看板容器，拖拽核心（官方 multiple containers 策略）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  MeasuringStrategy,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import type { Column, Task } from "../../types/kanban";

// =============================================================================
//  类型定义
// =============================================================================

interface BoardViewProps {
  boardId: string;
}

/** 容器 ID -> 项目 ID 数组（官方推荐的状态结构） */
type Items = Record<string, string[]>;

// =============================================================================
//  工具函数
// =============================================================================

/** 从任务数组构建 Items 结构 */
function buildItems(columns: Column[], tasks: Task[]): Items {
  const items: Items = {};
  columns.forEach((col) => {
    items[col.id] = [];
  });
  tasks
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach((task) => {
      if (items[task.column_id]) {
        items[task.column_id].push(task.id);
      }
    });
  return items;
}

// =============================================================================
//  组件
// =============================================================================

export function BoardView({ boardId }: BoardViewProps) {
  const { data: columns = [], isLoading: columnsLoading } = useColumns(boardId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(boardId);
  const moveTask = useMoveTask(boardId);
  const createTask = useCreateTask(boardId);
  const { openTaskDialog, searchQuery } = useUIStore();

  // WebSocket 实时同步（传递 isMovePending 避免干扰乐观更新）
  useWebSocket(boardId, { isMovePending: moveTask.isPending });

  // ---------------------------------------------------------------------------
  //  派生数据
  // ---------------------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const serverItems = useMemo(
    () => buildItems(columns, filteredTasks),
    [columns, filteredTasks]
  );

  // ---------------------------------------------------------------------------
  //  拖拽状态（官方 multiple containers 策略）
  // ---------------------------------------------------------------------------
  const [items, setItems] = useState<Items>(serverItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  // 服务端数据变化时同步（非拖拽且非提交中）
  // 用 JSON 序列化做深比较避免无限循环
  const serverItemsKey = JSON.stringify(serverItems);
  useEffect(() => {
    if (!activeId && !moveTask.isPending) {
      setItems(serverItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverItemsKey, activeId, moveTask.isPending]);

  // 跨容器移动后重置标志
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  // 当前拖拽的任务
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((t) => t.id === activeId) ?? null;
  }, [activeId, tasks]);

  // ---------------------------------------------------------------------------
  //  传感器
  // ---------------------------------------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ---------------------------------------------------------------------------
  //  碰撞检测（官方策略）
  // ---------------------------------------------------------------------------
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      // 先用 pointerWithin，再用 rectIntersection
      const pointerCollisions = pointerWithin(args);
      const intersections =
        pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        // 如果 overId 是容器，尝试找到其中最近的子项
        if (overId in items) {
          const containerItems = items[overId as string];
          if (containerItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId && containerItems.includes(container.id as string)
              ),
            });
            if (closest.length > 0) {
              overId = closest[0].id;
            }
          }
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // 刚跨容器时保持 activeId
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  // ---------------------------------------------------------------------------
  //  查找容器
  // ---------------------------------------------------------------------------
  const findContainer = useCallback(
    (id: UniqueIdentifier): string | undefined => {
      if (id in items) return id as string;
      return Object.keys(items).find((key) => items[key].includes(id as string));
    },
    [items]
  );

  // ---------------------------------------------------------------------------
  //  拖拽事件处理（官方策略）
  // ---------------------------------------------------------------------------
  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      setActiveId(active.id);
      setClonedItems(items); // 保存快照用于取消
    },
    [items]
  );

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      const overId = over?.id;
      if (overId == null) return;

      const overContainer = findContainer(overId);
      const activeContainer = findContainer(active.id);
      if (!overContainer || !activeContainer) return;

      // 只处理跨容器移动
      if (activeContainer !== overContainer) {
        setItems((prev) => {
          const activeItems = prev[activeContainer];
          const overItems = prev[overContainer];
          const activeIndex = activeItems.indexOf(active.id as string);
          const overIndex = overItems.indexOf(overId as string);

          let newIndex: number;
          if (overId in prev) {
            // 拖到空容器
            newIndex = overItems.length;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height;
            const modifier = isBelowOverItem ? 1 : 0;
            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
          }

          recentlyMovedToNewContainer.current = true;

          return {
            ...prev,
            [activeContainer]: prev[activeContainer].filter(
              (item) => item !== active.id
            ),
            [overContainer]: [
              ...prev[overContainer].slice(0, newIndex),
              activeItems[activeIndex],
              ...prev[overContainer].slice(newIndex),
            ],
          };
        });
      }
    },
    [findContainer]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const activeContainer = findContainer(active.id);
      if (!activeContainer) {
        setActiveId(null);
        return;
      }

      const overId = over?.id;
      if (overId == null) {
        setActiveId(null);
        return;
      }

      const overContainer = findContainer(overId);
      if (!overContainer) {
        setActiveId(null);
        return;
      }

      // 同容器内排序（仅当 over 是有效任务时）
      const activeIndex = items[activeContainer].indexOf(active.id as string);
      const overIndex = items[overContainer].indexOf(overId as string);

      let finalItems = items;
      if (
        activeContainer === overContainer &&
        activeIndex !== overIndex &&
        overIndex !== -1
      ) {
        finalItems = {
          ...items,
          [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
        };
        setItems(finalItems);
      }

      // 提交到服务器
      const targetContainer = overContainer;
      const newPosition = finalItems[targetContainer].indexOf(active.id as string);
      const task = tasks.find((t) => t.id === active.id);

      if (task && (task.column_id !== targetContainer || task.position !== newPosition)) {
        moveTask.mutate({
          taskId: active.id as string,
          data: { column_id: targetContainer, position: newPosition },
        });
      }

      setActiveId(null);
      setClonedItems(null);
    },
    [findContainer, items, moveTask, tasks]
  );

  const handleDragCancel = useCallback(() => {
    if (clonedItems) {
      setItems(clonedItems); // 恢复快照
    }
    setActiveId(null);
    setClonedItems(null);
  }, [clonedItems]);

  // ---------------------------------------------------------------------------
  //  添加任务
  // ---------------------------------------------------------------------------
  const handleAddTask = useCallback(
    (columnId: string) => {
      const position = items[columnId]?.length ?? 0;
      createTask.mutate(
        { column_id: columnId, title: "新任务", position },
        { onSuccess: (newTask) => openTaskDialog(newTask.id) }
      );
    },
    [items, createTask, openTaskDialog]
  );

  // ---------------------------------------------------------------------------
  //  根据 items 获取列的任务对象数组
  // ---------------------------------------------------------------------------
  const getColumnTasks = useCallback(
    (columnId: string): Task[] => {
      const ids = items[columnId] || [];
      return ids
        .map((id) => filteredTasks.find((t) => t.id === id))
        .filter((t): t is Task => t != null);
    },
    [items, filteredTasks]
  );

  // ---------------------------------------------------------------------------
  //  渲染
  // ---------------------------------------------------------------------------
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
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ minHeight: "calc(100vh - 140px)" }}
        >
          {columns
            .sort((a, b) => a.order_index - b.order_index)
            .map((column) => (
              <SortableContext
                key={column.id}
                items={items[column.id] || []}
                strategy={verticalListSortingStrategy}
              >
                <ColumnView
                  column={column}
                  tasks={getColumnTasks(column.id)}
                  onTaskClick={(task) => openTaskDialog(task.id)}
                  onAddTask={() => handleAddTask(column.id)}
                />
              </SortableContext>
            ))}
        </div>

        {createPortal(
          <DragOverlay adjustScale={false} dropAnimation={null}>
            {activeTask && <DragOverlayCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <TaskEditorDialog boardId={boardId} tasks={tasks} />
    </>
  );
}
