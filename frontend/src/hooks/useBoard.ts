/**
 * [INPUT]: 依赖 @tanstack/react-query, api/*, types/*
 * [OUTPUT]: 对外提供 useColumns, useTasks, useMoveTask 等 hooks
 * [POS]: hooks 模块的看板数据管理
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { columnsApi } from "../api/columns";
import {
  tasksApi,
  type CreateTaskInput,
  type MoveTaskInput,
  type UpdateTaskInput,
} from "../api/tasks";
import type { Task } from "../types/kanban";

// ============================================================================
//  Query Keys
// ============================================================================
export const boardKeys = {
  all: ["boards"] as const,
  detail: (id: string) => ["boards", id] as const,
  columns: (boardId: string) => ["boards", boardId, "columns"] as const,
  tasks: (boardId: string) => ["boards", boardId, "tasks"] as const,
};

// ============================================================================
//  Columns
// ============================================================================
export function useColumns(boardId: string) {
  return useQuery({
    queryKey: boardKeys.columns(boardId),
    queryFn: () => columnsApi.list(boardId),
    enabled: !!boardId,
  });
}

// ============================================================================
//  Tasks
// ============================================================================
export function useTasks(boardId: string) {
  return useQuery({
    queryKey: boardKeys.tasks(boardId),
    queryFn: () => tasksApi.list(boardId),
    enabled: !!boardId,
  });
}

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}

export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      tasksApi.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}

// ============================================================================
//  Move Task (拖拽核心)
// ============================================================================
export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: MoveTaskInput }) =>
      tasksApi.move(taskId, data),

    // 乐观更新 - 完整重排 position
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.tasks(boardId) });

      const previousTasks = queryClient.getQueryData<Task[]>(
        boardKeys.tasks(boardId)
      );

      if (previousTasks) {
        const task = previousTasks.find((t) => t.id === taskId);
        if (!task) return { previousTasks };

        const fromColumnId = task.column_id;
        const toColumnId = data.column_id;
        const toPosition = data.position;

        // 创建新的任务数组
        let updatedTasks = previousTasks.map((t) => ({ ...t }));

        // 从原列移除
        const fromColumnTasks = updatedTasks
          .filter((t) => t.column_id === fromColumnId && t.id !== taskId)
          .sort((a, b) => a.position - b.position);

        // 重排原列 position
        fromColumnTasks.forEach((t, idx) => {
          t.position = idx;
        });

        // 获取目标列任务（不含被移动的任务）
        const toColumnTasks = updatedTasks
          .filter((t) => t.column_id === toColumnId && t.id !== taskId)
          .sort((a, b) => a.position - b.position);

        // 插入到目标位置
        const movedTask = updatedTasks.find((t) => t.id === taskId)!;
        movedTask.column_id = toColumnId;
        toColumnTasks.splice(toPosition, 0, movedTask);

        // 重排目标列 position
        toColumnTasks.forEach((t, idx) => {
          t.position = idx;
        });

        // 合并所有任务
        const otherTasks = updatedTasks.filter(
          (t) => t.column_id !== fromColumnId && t.column_id !== toColumnId
        );

        updatedTasks = [...otherTasks, ...fromColumnTasks, ...toColumnTasks];

        // 如果同列，只保留目标列
        if (fromColumnId === toColumnId) {
          updatedTasks = [
            ...updatedTasks.filter((t) => t.column_id !== toColumnId),
            ...toColumnTasks,
          ];
        }

        queryClient.setQueryData(boardKeys.tasks(boardId), updatedTasks);
      }

      return { previousTasks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          boardKeys.tasks(boardId),
          context.previousTasks
        );
      }
    },

    // 成功后用服务器数据替换，确保一致性
    onSuccess: (serverTask) => {
      queryClient.setQueryData<Task[]>(boardKeys.tasks(boardId), (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === serverTask.id ? serverTask : t));
      });
    },

    // 不再 invalidate，依赖 WebSocket 保持同步
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    // },
  });
}
