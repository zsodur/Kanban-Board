/**
 * [INPUT]: 依赖 clsx, tailwind-merge
 * [OUTPUT]: 对外提供 cn 工具函数
 * [POS]: lib 模块的样式工具
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
