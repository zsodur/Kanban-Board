/**
 * [INPUT]: 依赖 zod
 * [OUTPUT]: 对外提供表单校验 schema
 * [POS]: lib 模块的校验规则
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(120, "标题不能超过120字符"),
  description: z.string().max(5000, "描述不能超过5000字符").optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
