/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供应用常量
 * [POS]: lib 模块的常量定义
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const API_BASE_URL = "/api/v1";

export const COLUMN_TITLES = {
  TODO: "Todo",
  DOING: "Doing",
  DONE: "Done",
} as const;
