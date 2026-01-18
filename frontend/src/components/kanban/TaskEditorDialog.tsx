/**
 * [INPUT]: 依赖 react, hooks/useBoard, store/uiStore, types/kanban
 * [OUTPUT]: 对外提供 TaskEditorDialog 组件
 * [POS]: kanban 组件的任务编辑弹窗
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { useUpdateTask, useDeleteTask } from "../../hooks/useBoard";
import type { Task } from "../../types/kanban";

interface TaskEditorDialogProps {
  boardId: string;
  tasks: Task[];
}

export function TaskEditorDialog({ boardId, tasks }: TaskEditorDialogProps) {
  const { editingTaskId, isTaskDialogOpen, closeTaskDialog } = useUIStore();
  const updateTask = useUpdateTask(boardId);
  const deleteTask = useDeleteTask(boardId);

  const task = tasks.find((t) => t.id === editingTaskId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  if (!isTaskDialogOpen || !task) return null;

  const handleSave = async () => {
    await updateTask.mutateAsync({
      taskId: task.id,
      data: { title, description: description || undefined },
    });
    closeTaskDialog();
  };

  const handleDelete = async () => {
    if (confirm("确定删除此任务?")) {
      await deleteTask.mutateAsync(task.id);
      closeTaskDialog();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">编辑任务</h2>
          <button
            onClick={closeTaskDialog}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            删除任务
          </button>
          <div className="flex gap-2">
            <button
              onClick={closeTaskDialog}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
