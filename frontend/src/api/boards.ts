/**
 * [INPUT]: 依赖 api/client, types/kanban
 * [OUTPUT]: 对外提供 boards API 函数
 * [POS]: api 模块的看板 API
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { apiClient } from "./client";
import type { Board } from "../types/kanban";

export interface CreateBoardInput {
  title: string;
}

export interface UpdateBoardInput {
  title?: string;
}

export const boardsApi = {
  list: () => apiClient.get<Board[]>("/boards"),

  get: (id: string) => apiClient.get<Board>(`/boards/${id}`),

  create: (data: CreateBoardInput) => apiClient.post<Board>("/boards", data),

  update: (id: string, data: UpdateBoardInput) =>
    apiClient.patch<Board>(`/boards/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/boards/${id}`),
};
