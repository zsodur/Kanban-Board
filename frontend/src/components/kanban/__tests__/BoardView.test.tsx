/**
 * [INPUT]: 依赖 @testing-library/react, vitest, @tanstack/react-query
 * [OUTPUT]: 对外提供 BoardView 组件测试
 * [POS]: kanban/__tests__ 模块的 BoardView 测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BoardView } from "../BoardView";

// Mock hooks
vi.mock("../../../hooks/useBoard", () => ({
  useColumns: vi.fn(() => ({
    data: [
      { id: "col-1", board_id: "board-1", title: "To Do", order_index: 0 },
      { id: "col-2", board_id: "board-1", title: "Doing", order_index: 1 },
    ],
    isLoading: false,
  })),
  useTasks: vi.fn(() => ({
    data: [
      {
        id: "task-1",
        board_id: "board-1",
        column_id: "col-1",
        title: "Task 1",
        description: null,
        position: 0,
      },
    ],
    isLoading: false,
  })),
  useMoveTask: vi.fn(() => ({ mutate: vi.fn() })),
  useCreateTask: vi.fn(() => ({ mutate: vi.fn() })),
  boardKeys: {
    all: ["boards"],
    lists: () => ["boards", "list"],
    list: (id: string) => ["boards", "list", id],
    details: () => ["boards", "details"],
    detail: (id: string) => ["boards", "detail", id],
    columns: (id: string) => ["boards", id, "columns"],
    tasks: (id: string) => ["boards", id, "tasks"],
  },
}));

vi.mock("../../../hooks/useWebSocket", () => ({
  useWebSocket: vi.fn(),
}));

vi.mock("../../../store/uiStore", () => ({
  useUIStore: vi.fn(() => ({
    openTaskDialog: vi.fn(),
    closeTaskDialog: vi.fn(),
    isTaskDialogOpen: false,
    editingTaskId: null,
  })),
}));

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCorners: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
  sortableKeyboardCoordinates: vi.fn(),
}));

describe("BoardView", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders column titles", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BoardView boardId="board-1" />
      </QueryClientProvider>
    );
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Doing")).toBeInTheDocument();
  });

  it("renders task in correct column", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BoardView boardId="board-1" />
      </QueryClientProvider>
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });
});
