/**
 * [INPUT]: 依赖 api/client, types/kanban
 * [OUTPUT]: 对外提供 columns API 函数
 * [POS]: api 模块的列 API
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { apiClient } from "./client";
import type { Column } from "../types/kanban";

export interface CreateColumnInput {
  title: string;
  order_index: number;
}

export interface UpdateColumnInput {
  title?: string;
  order_index?: number;
}

export const columnsApi = {
  list: (boardId: string) =>
    apiClient.get<Column[]>(`/boards/${boardId}/columns`),

  create: (boardId: string, data: CreateColumnInput) =>
    apiClient.post<Column>(`/boards/${boardId}/columns`, data),

  update: (columnId: string, data: UpdateColumnInput) =>
    apiClient.patch<Column>(`/columns/${columnId}`, data),

  delete: (columnId: string) => apiClient.delete<void>(`/columns/${columnId}`),
};
