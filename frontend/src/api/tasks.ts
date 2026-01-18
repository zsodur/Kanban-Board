/**
 * [INPUT]: 依赖 api/client, types/kanban
 * [OUTPUT]: 对外提供 tasks API 函数
 * [POS]: api 模块的任务 API
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { apiClient } from "./client";
import type { Task } from "../types/kanban";

export interface CreateTaskInput {
  column_id: string;
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
}

export interface MoveTaskInput {
  column_id: string;
  position: number;
}

export const tasksApi = {
  list: (boardId: string) => apiClient.get<Task[]>(`/boards/${boardId}/tasks`),

  get: (taskId: string) => apiClient.get<Task>(`/tasks/${taskId}`),

  create: (boardId: string, data: CreateTaskInput) =>
    apiClient.post<Task>(`/boards/${boardId}/tasks`, data),

  update: (taskId: string, data: UpdateTaskInput) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, data),

  delete: (taskId: string) => apiClient.delete<void>(`/tasks/${taskId}`),

  move: (taskId: string, data: MoveTaskInput) =>
    apiClient.patch<Task>(`/tasks/${taskId}/move`, data),
};
