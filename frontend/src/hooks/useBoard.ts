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

    // 乐观更新
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.tasks(boardId) });

      const previousTasks = queryClient.getQueryData<Task[]>(
        boardKeys.tasks(boardId)
      );

      if (previousTasks) {
        const updatedTasks = previousTasks.map((task) =>
          task.id === taskId
            ? { ...task, column_id: data.column_id, position: data.position }
            : task
        );
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

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(boardId) });
    },
  });
}
