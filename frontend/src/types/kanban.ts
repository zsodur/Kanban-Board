/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 Board, Column, Task 类型定义
 * [POS]: types 模块的看板数据类型
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export interface Board {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}
