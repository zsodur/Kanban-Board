/**
 * [INPUT]: 依赖 react, @dnd-kit/*, hooks/useBoard, hooks/useWebSocket, store/uiStore, 子组件, types/kanban
 * [OUTPUT]: 对外提供 BoardView 组件
 * [POS]: kanban 组件的看板容器，拖拽核心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimationSideEffects,
  pointerWithin,
  rectIntersection,
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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

interface BoardViewProps {
  boardId: string;
}

type TasksByColumn = Record<string, Task[]>;

function buildTasksByColumn(columns: Column[], tasks: Task[]): TasksByColumn {
  const map: TasksByColumn = {};
  columns.forEach((col) => {
    map[col.id] = [];
  });
  tasks.forEach((task) => {
    const list = map[task.column_id];
    if (list) {
      list.push({ ...task });
    }
  });
  Object.values(map).forEach((taskList) => {
    taskList.sort((a, b) => a.position - b.position);
  });
  return map;
}

export function BoardView({ boardId }: BoardViewProps) {
  const { data: columns = [], isLoading: columnsLoading } = useColumns(boardId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(boardId);
  const moveTask = useMoveTask(boardId);
  const createTask = useCreateTask(boardId);
  const { openTaskDialog, searchQuery } = useUIStore();

  // WebSocket 实时同步
  useWebSocket(boardId);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const orderedTasksByColumnRef = useRef<TasksByColumn>({});
  const activeClearTimeoutRef = useRef<number | null>(null);
  const dropAnimationDuration = 180;

  // 列 ID 集合
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);
  const columnIdSet = useMemo(() => new Set(columnIds), [columnIds]);

  // 根据搜索词过滤任务
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

  // 按列分组任务
  const tasksByColumn = useMemo(
    () => buildTasksByColumn(columns, filteredTasks),
    [columns, filteredTasks]
  );

  // 拖拽过程中的本地顺序
  const [orderedTasksByColumn, setOrderedTasksByColumn] =
    useState<TasksByColumn>(tasksByColumn);

  useEffect(() => {
    if (!isDragging) {
      setOrderedTasksByColumn(tasksByColumn);
      orderedTasksByColumnRef.current = tasksByColumn;
    }
  }, [tasksByColumn, isDragging]);

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return (
      tasks.find((task) => task.id === activeTaskId) ||
      Object.values(orderedTasksByColumn)
        .flat()
        .find((task) => task.id === activeTaskId) ||
      null
    );
  }, [activeTaskId, tasks, orderedTasksByColumn]);

  const dropAnimationConfig = useMemo(
    () => ({
      duration: dropAnimationDuration,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      sideEffects: defaultDropAnimationSideEffects({
        styles: {
          active: {
            opacity: "0",
          },
        },
      }),
    }),
    [dropAnimationDuration]
  );

  const scheduleActiveTaskClear = useCallback(() => {
    if (activeClearTimeoutRef.current) {
      window.clearTimeout(activeClearTimeoutRef.current);
    }
    activeClearTimeoutRef.current = window.setTimeout(() => {
      setActiveTaskId(null);
      activeClearTimeoutRef.current = null;
    }, dropAnimationDuration);
  }, [dropAnimationDuration]);

  useEffect(() => {
    return () => {
      if (activeClearTimeoutRef.current) {
        window.clearTimeout(activeClearTimeoutRef.current);
      }
    };
  }, []);

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
      const pointerCollisions = pointerWithin(args);
      const intersections = rectIntersection(args);
      const collisions = pointerCollisions.length > 0 ? pointerCollisions : intersections;
      let overId = collisions[0]?.id;

      if (overId) {
        if (columnIdSet.has(overId as string)) {
          const columnTasks = orderedTasksByColumn[overId as string] || [];
          if (columnTasks.length > 0) {
            const closestTask = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter((container) =>
                columnTasks.some((task) => task.id === container.id)
              ),
            })[0]?.id;
            if (closestTask) {
              overId = closestTask;
            }
          }
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      if (lastOverId.current) {
        return [{ id: lastOverId.current }];
      }

      return closestCenter(args);
    },
    [columnIdSet, orderedTasksByColumn]
  );

  // -------------------------------------------------------------------------
  //  查找任务所属列
  // -------------------------------------------------------------------------
  const findColumnId = useCallback(
    (id: UniqueIdentifier, containers: TasksByColumn): string | null => {
      const targetId = id as string;
      if (columnIdSet.has(targetId)) {
        return targetId;
      }
      for (const columnId of columnIds) {
        if (containers[columnId]?.some((task) => task.id === targetId)) {
          return columnId;
        }
      }
      return null;
    },
    [columnIdSet, columnIds]
  );

  const getOverIndex = useCallback(
    (overId: UniqueIdentifier, overTasks: Task[]) => {
      if (columnIdSet.has(overId as string)) {
        return overTasks.length;
      }
      const index = overTasks.findIndex((task) => task.id === overId);
      return index >= 0 ? index : overTasks.length;
    },
    [columnIdSet]
  );

  const moveTaskAcrossColumns = useCallback(
    (
      current: TasksByColumn,
      activeId: string,
      overId: string,
      fromColumnId: string,
      toColumnId: string
    ) => {
      const activeTasks = current[fromColumnId] || [];
      const overTasksAll = current[toColumnId] || [];
      const activeIndex = activeTasks.findIndex((task) => task.id === activeId);
      if (activeIndex < 0) return current;

      const activeTask = activeTasks[activeIndex];
      const overTasks = overTasksAll.filter((task) => task.id !== activeId);
      const overIndex = getOverIndex(overId, overTasks);

      const nextActiveTasks = activeTasks.filter((task) => task.id !== activeId);
      const nextOverTasks = [...overTasks];
      nextOverTasks.splice(overIndex, 0, {
        ...activeTask,
        column_id: toColumnId,
      });

      return {
        ...current,
        [fromColumnId]: nextActiveTasks,
        [toColumnId]: nextOverTasks,
      };
    },
    [getOverIndex]
  );

  // -------------------------------------------------------------------------
  //  拖拽事件
  // -------------------------------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    if (activeClearTimeoutRef.current) {
      window.clearTimeout(activeClearTimeoutRef.current);
      activeClearTimeoutRef.current = null;
    }
    setActiveTaskId(event.active.id as string);
    orderedTasksByColumnRef.current = orderedTasksByColumn;
    setIsDragging(true);
    lastOverId.current = event.active.id;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    setOrderedTasksByColumn((current) => {
      const activeId = active.id as string;
      const overId = over.id as string;
      const activeColumnId = findColumnId(activeId, current);
      const overColumnId = findColumnId(overId, current);
      if (!activeColumnId || !overColumnId) {
        return current;
      }
      if (activeColumnId === overColumnId) {
        return current;
      }

      const next = moveTaskAcrossColumns(
        current,
        activeId,
        overId,
        activeColumnId,
        overColumnId
      );
      orderedTasksByColumnRef.current = next;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    scheduleActiveTaskClear();
    lastOverId.current = null;

    if (!over) {
      setOrderedTasksByColumn(tasksByColumn);
      setIsDragging(false);
      return;
    }

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      setOrderedTasksByColumn(tasksByColumn);
      setIsDragging(false);
      return;
    }

    let finalOrderedTasks = orderedTasksByColumnRef.current;
    const activeColumnId = findColumnId(taskId, finalOrderedTasks);
    const overColumnId = findColumnId(over.id, finalOrderedTasks);
    if (!activeColumnId || !overColumnId) {
      setOrderedTasksByColumn(tasksByColumn);
      setIsDragging(false);
      return;
    }

    if (activeColumnId === overColumnId) {
      const columnTasks = finalOrderedTasks[activeColumnId] || [];
      const activeIndex = columnTasks.findIndex((t) => t.id === taskId);
      let overIndex = columnTasks.findIndex((t) => t.id === over.id);
      if (overIndex < 0) {
        overIndex = Math.max(columnTasks.length - 1, 0);
      }
      if (activeIndex >= 0 && overIndex >= 0 && activeIndex !== overIndex) {
        const nextColumnTasks = arrayMove(columnTasks, activeIndex, overIndex);
        finalOrderedTasks = {
          ...finalOrderedTasks,
          [activeColumnId]: nextColumnTasks,
        };
        orderedTasksByColumnRef.current = finalOrderedTasks;
      }
    }

    setOrderedTasksByColumn(finalOrderedTasks);

    const targetColumnId = findColumnId(taskId, finalOrderedTasks);
    if (!targetColumnId) {
      setOrderedTasksByColumn(tasksByColumn);
      setIsDragging(false);
      return;
    }

    const columnTasks = finalOrderedTasks[targetColumnId] || [];
    const targetPosition = columnTasks.findIndex((t) => t.id === taskId);
    if (targetPosition < 0) {
      setOrderedTasksByColumn(tasksByColumn);
      setIsDragging(false);
      return;
    }

    if (task.column_id === targetColumnId && task.position === targetPosition) {
      setIsDragging(false);
      return;
    }

    moveTask.mutate(
      {
        taskId,
        data: { column_id: targetColumnId, position: targetPosition },
      },
      {
        onSettled: () => {
          setIsDragging(false);
        },
      }
    );
  };

  const handleDragCancel = () => {
    scheduleActiveTaskClear();
    lastOverId.current = null;
    setIsDragging(false);
    setOrderedTasksByColumn(tasksByColumn);
    orderedTasksByColumnRef.current = tasksByColumn;
  };

  // -------------------------------------------------------------------------
  //  添加任务
  // -------------------------------------------------------------------------
  const handleAddTask = (columnId: string) => {
    const columnTasks = tasksByColumn[columnId] || [];
    const position = columnTasks.length;
    createTask.mutate(
      {
        column_id: columnId,
        title: "新任务",
        position,
      },
      {
        onSuccess: (newTask) => {
          openTaskDialog(newTask.id);
        },
      }
    );
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
        onDragCancel={handleDragCancel}
      >
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ minHeight: "calc(100vh - 140px)" }}
        >
          {columns
            .sort((a, b) => a.order_index - b.order_index)
            .map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                tasks={orderedTasksByColumn[column.id] || []}
                onTaskClick={(task) => openTaskDialog(task.id)}
                onAddTask={() => handleAddTask(column.id)}
              />
            ))}
        </div>

        <DragOverlay adjustScale={false} dropAnimation={dropAnimationConfig}>
          {activeTask && <DragOverlayCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      <TaskEditorDialog boardId={boardId} tasks={tasks} />
    </>
  );
}
