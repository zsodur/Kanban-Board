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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setIsConfirmingDelete(false);
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
    await deleteTask.mutateAsync(task.id);
    closeTaskDialog();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-border">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text">编辑任务</h2>
          <button
            onClick={closeTaskDialog}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="输入任务标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="添加详细描述..."
            />
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-border">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
              <span className="text-sm text-gray-500 mr-1">确定删除?</span>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                确定
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <i className="fas fa-trash-alt"></i>
              删除
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={closeTaskDialog}
              className="px-5 py-2.5 text-gray-600 hover:text-text hover:bg-gray-200/50 rounded-xl font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-600 font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
