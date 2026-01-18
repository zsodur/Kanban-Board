/**
 * [INPUT]: 依赖 @testing-library/react, vitest
 * [OUTPUT]: 对外提供 TaskCard 组件测试
 * [POS]: kanban/__tests__ 模块的 TaskCard 测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "../TaskCard";
import type { Task } from "../../../types/kanban";

// Mock @dnd-kit/sortable
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockTask: Task = {
  id: "task-1",
  board_id: "board-1",
  column_id: "col-1",
  title: "Test Task",
  description: "Test Description",
  position: 0,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("TaskCard", () => {
  it("renders task title", () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    fireEvent.click(screen.getByText("Test Task"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders task description if present", () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("handles task without description", () => {
    const taskNoDesc = { ...mockTask, description: null };
    render(<TaskCard task={taskNoDesc} onClick={() => {}} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
  });
});
