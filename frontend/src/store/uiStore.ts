/**
 * [INPUT]: 依赖 zustand
 * [OUTPUT]: 对外提供 useUIStore hook
 * [POS]: store 模块的 UI 状态管理
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { create } from "zustand";

interface UIState {
  // 任务编辑弹窗
  editingTaskId: string | null;
  isTaskDialogOpen: boolean;

  // 操作
  openTaskDialog: (taskId: string | null) => void;
  closeTaskDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  editingTaskId: null,
  isTaskDialogOpen: false,

  openTaskDialog: (taskId) =>
    set({ editingTaskId: taskId, isTaskDialogOpen: true }),

  closeTaskDialog: () => set({ editingTaskId: null, isTaskDialogOpen: false }),
}));
