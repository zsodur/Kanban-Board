# Kanban Board - 详细任务清单

> 按里程碑拆分，精确到每个文件、函数、测试用例
> 使用 Markdown checkbox 格式，可直接勾选追踪进度

---

## M1: 项目骨架 + Docker 联调

### 1.1 环境配置
- [x] 创建 `.env.example`（POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL, VITE_API_URL）
- [x] 创建 `.env` 本地开发配置

### 1.2 后端入口
- [x] `backend/app/main.py` - FastAPI 应用实例 + CORS 配置
- [x] `backend/app/api/v1/endpoints/health.py` - GET /health 端点
- [x] `backend/app/api/v1/api.py` - 路由聚合
- [x] `backend/app/api/deps.py` - 依赖注入（get_db）
- [x] `backend/app/core/config.py` - Settings 配置类

### 1.3 数据库配置
- [x] `backend/app/db/session.py` - AsyncSession 工厂
- [x] `backend/app/db/base.py` - SQLAlchemy 基类

### 1.4 后端基础设施
- [x] `backend/Dockerfile` - Python 镜像配置
- [x] `backend/requirements.txt` - 生产依赖
- [x] `backend/requirements-dev.txt` - 开发依赖（pytest, httpx 等）
- [x] `backend/scripts/prestart.sh` - 启动前脚本（迁移/seed）
- [x] `backend/scripts/start.sh` - 启动脚本

### 1.5 前端初始化
- [x] `frontend/package.json` - 依赖声明
- [x] `frontend/vite.config.ts` - Vite 配置 + API 代理
- [x] `frontend/tsconfig.json` - TypeScript 配置
- [x] `frontend/tsconfig.node.json` - Node 环境 TS 配置
- [x] `frontend/tailwind.config.ts` - Tailwind 配置
- [x] `frontend/postcss.config.js` - PostCSS 配置
- [x] `frontend/index.html` - 入口 HTML
- [x] `frontend/src/main.tsx` - React 入口
- [x] `frontend/src/App.tsx` - 根组件
- [x] `frontend/Dockerfile` - Node 镜像配置

### 1.6 Docker Compose
- [x] 更新 `docker-compose.yml` - 完整的 db/backend/frontend 服务配置

### 1.7 测试: M1
- [x] `backend/tests/conftest.py` - pytest fixtures（TestClient, test_db）
- [x] `backend/tests/test_health.py::test_health_returns_ok`

---

## M2: 数据模型 + CRUD API ✅

### 2.1 ORM 模型
- [x] `backend/app/models/user.py` - User 模型（id, email, hashed_password, display_name, created_at, updated_at）
- [x] `backend/app/models/board.py` - Board 模型（id, owner_id, title, created_at, updated_at）
- [x] `backend/app/models/column.py` - Column 模型（id, board_id, title, order_index, created_at, updated_at）
- [x] `backend/app/models/task.py` - Task 模型（id, board_id, column_id, title, description, position, created_at, updated_at）
- [x] `backend/app/models/__init__.py` - 统一导出

### 2.2 Pydantic Schemas
- [x] `backend/app/schemas/user.py` - UserCreate, UserRead, UserUpdate
- [x] `backend/app/schemas/board.py` - BoardCreate, BoardRead, BoardUpdate
- [x] `backend/app/schemas/column.py` - ColumnCreate, ColumnRead, ColumnUpdate
- [x] `backend/app/schemas/task.py` - TaskCreate, TaskRead, TaskUpdate, TaskMove
- [x] `backend/app/schemas/__init__.py` - 统一导出

### 2.3 CRUD 操作
- [x] `backend/app/crud/users.py` - create_user, get_user_by_email, get_user_by_id
- [x] `backend/app/crud/boards.py` - create_board, get_boards_by_owner, get_board, update_board, delete_board
- [x] `backend/app/crud/columns.py` - create_column, get_columns_by_board, get_column, update_column, delete_column
- [x] `backend/app/crud/tasks.py` - create_task, get_tasks_by_board, get_tasks_by_column, get_task, update_task, delete_task

### 2.4 数据库初始化
- [x] `backend/app/db/init_db.py` - init_db() 创建表 + seed_default_board() 种子数据
- [x] `backend/alembic.ini` - Alembic 配置
- [x] `backend/alembic/env.py` - 迁移环境
- [x] `backend/alembic/script.py.mako` - 迁移模板
- [x] `backend/alembic/versions/0001_init.py` - 初始迁移

### 2.5 API 端点: Boards
- [x] `backend/app/api/v1/endpoints/boards.py::list_boards` - GET /boards
- [x] `backend/app/api/v1/endpoints/boards.py::create_board` - POST /boards
- [x] `backend/app/api/v1/endpoints/boards.py::get_board` - GET /boards/{board_id}
- [x] `backend/app/api/v1/endpoints/boards.py::update_board` - PATCH /boards/{board_id}
- [x] `backend/app/api/v1/endpoints/boards.py::delete_board` - DELETE /boards/{board_id}

### 2.6 API 端点: Columns
- [x] `backend/app/api/v1/endpoints/columns.py::list_columns` - GET /boards/{board_id}/columns
- [x] `backend/app/api/v1/endpoints/columns.py::create_column` - POST /boards/{board_id}/columns
- [x] `backend/app/api/v1/endpoints/columns.py::update_column` - PATCH /columns/{column_id}
- [x] `backend/app/api/v1/endpoints/columns.py::delete_column` - DELETE /columns/{column_id}

### 2.7 API 端点: Tasks
- [x] `backend/app/api/v1/endpoints/tasks.py::list_tasks` - GET /boards/{board_id}/tasks
- [x] `backend/app/api/v1/endpoints/tasks.py::create_task` - POST /boards/{board_id}/tasks
- [x] `backend/app/api/v1/endpoints/tasks.py::get_task` - GET /tasks/{task_id}
- [x] `backend/app/api/v1/endpoints/tasks.py::update_task` - PATCH /tasks/{task_id}
- [x] `backend/app/api/v1/endpoints/tasks.py::delete_task` - DELETE /tasks/{task_id}

### 2.8 测试: M2
- [x] `backend/tests/test_boards.py::test_create_board`
- [x] `backend/tests/test_boards.py::test_list_boards`
- [x] `backend/tests/test_boards.py::test_get_board`
- [x] `backend/tests/test_boards.py::test_update_board`
- [x] `backend/tests/test_boards.py::test_delete_board`
- [x] `backend/tests/test_columns.py::test_list_columns`
- [x] `backend/tests/test_columns.py::test_create_column`
- [x] `backend/tests/test_tasks.py::test_create_task`
- [x] `backend/tests/test_tasks.py::test_list_tasks`
- [x] `backend/tests/test_tasks.py::test_update_task`
- [x] `backend/tests/test_tasks.py::test_delete_task`

---

## M3: 拖拽功能 + 持久化 ✅

### 3.1 后端 Move 逻辑
- [x] `backend/app/services/ordering.py::move_task` - 事务移动（跨列/同列）
- [x] `backend/app/services/ordering.py::reorder_column` - 整列重排 position
- [x] `backend/app/api/v1/endpoints/tasks.py::move_task` - PATCH /tasks/{task_id}/move

### 3.2 前端 API 客户端
- [x] `frontend/src/api/client.ts` - axios/fetch 封装
- [x] `frontend/src/api/boards.ts` - getBoards, getBoard, createBoard
- [x] `frontend/src/api/columns.ts` - getColumns
- [x] `frontend/src/api/tasks.ts` - getTasks, createTask, updateTask, deleteTask, moveTask

### 3.3 前端类型定义
- [x] `frontend/src/types/kanban.ts` - Board, Column, Task 类型
- [x] `frontend/src/types/api.ts` - API 响应类型
- [x] `frontend/src/types/index.ts` - 统一导出

### 3.4 前端状态管理
- [x] `frontend/src/store/uiStore.ts` - Zustand UI 状态（dialog, selectedTask）
- [x] `frontend/src/hooks/useBoard.ts` - TanStack Query hooks（useColumns, useTasks, mutations）

### 3.5 前端看板组件
- [x] `frontend/src/components/kanban/BoardView.tsx` - 看板容器 + DndContext
- [x] `frontend/src/components/kanban/ColumnView.tsx` - 列组件 + SortableContext
- [x] `frontend/src/components/kanban/TaskCard.tsx` - 任务卡片 + useSortable
- [x] `frontend/src/components/kanban/DragOverlayCard.tsx` - 拖拽浮层
- [x] `frontend/src/components/kanban/TaskEditorDialog.tsx` - 任务编辑弹窗

### 3.6 前端布局组件
- [x] `frontend/src/components/layout/AppShell.tsx` - 应用外壳
- [x] `frontend/src/components/layout/Topbar.tsx` - 顶部导航

### 3.7 前端页面
- [x] `frontend/src/pages/BoardPage.tsx` - 看板页面 (静态版本)
- [x] `frontend/src/router.tsx` - React Router 配置

### 3.8 测试: M3
- [x] `backend/tests/test_move_task.py::test_move_task_same_column`
- [x] `backend/tests/test_move_task.py::test_move_task_cross_column`
- [x] `backend/tests/test_move_task.py::test_move_task_to_first_position`
- [x] `backend/tests/test_move_task.py::test_move_task_to_last_position`
- [x] `backend/tests/test_move_task.py::test_reorder_preserves_positions`

---

## M4: WebSocket 实时同步 ✅

### 4.1 后端 WebSocket
- [x] `backend/app/services/realtime.py::ConnectionManager` - 连接管理器（connect, disconnect, broadcast）
- [x] `backend/app/services/realtime.py::broadcast_event` - 广播事件
- [x] `backend/app/schemas/events.py` - WebSocket 事件类型（TaskCreated, TaskUpdated, TaskMoved, TaskDeleted）
- [x] `backend/app/api/v1/endpoints/ws.py` - WebSocket /ws/boards/{board_id}

### 4.2 后端事件触发
- [x] 修改 `tasks.py::create_task` - 创建后广播 task_created
- [x] 修改 `tasks.py::update_task` - 更新后广播 task_updated
- [x] 修改 `tasks.py::delete_task` - 删除后广播 task_deleted
- [x] 修改 `tasks.py::move_task` - 移动后广播 task_moved

### 4.3 前端 WebSocket
- [x] `frontend/src/hooks/useWebSocket.ts` - WebSocket 连接 hook
- [x] 修改 `useBoard.ts` - 收到事件后更新 TanStack Query cache

### 4.4 测试: M4
- [x] `backend/tests/test_websocket.py::test_connect_to_board`
- [x] `backend/tests/test_websocket.py::test_manager_broadcast`
- [x] `backend/tests/test_websocket.py::test_manager_connect_disconnect`
- [x] `backend/tests/test_websocket.py::test_broadcast_event_helper`
- [x] `backend/tests/test_websocket.py::test_broadcast_no_connections`
- [x] `backend/tests/test_websocket.py::test_broadcast_removes_dead_connections`

---

## M5: 体验完善 + 测试覆盖

### 5.1 UI 组件（shadcn/ui）
- [ ] `frontend/src/components/ui/button.tsx`
- [ ] `frontend/src/components/ui/card.tsx`
- [ ] `frontend/src/components/ui/dialog.tsx`
- [ ] `frontend/src/components/ui/input.tsx`
- [ ] `frontend/src/components/ui/textarea.tsx`
- [x] `frontend/src/components/ui/toast.tsx`
- [ ] `frontend/src/components/ui/dropdown-menu.tsx`
- [ ] `frontend/src/components/ui/badge.tsx`
- [ ] `frontend/components.json` - shadcn/ui 配置

### 5.2 用户体验
- [ ] 空状态引导组件（无任务时显示引导）
- [ ] 加载骨架屏（Skeleton）
- [ ] `frontend/src/hooks/useToast.ts` - Toast 通知 hook
- [ ] 错误边界处理

### 5.3 样式与工具
- [x] `frontend/src/styles/globals.css` - 全局样式 + Tailwind 引入
- [x] `frontend/src/lib/utils.ts` - 工具函数（cn 等）
- [x] `frontend/src/lib/constants.ts` - 常量定义
- [x] `frontend/src/lib/validations.ts` - 前端校验规则

### 5.4 前端测试
- [ ] `frontend/vitest.config.ts` - Vitest 配置
- [ ] `frontend/src/components/kanban/__tests__/TaskCard.test.tsx`
- [ ] `frontend/src/components/kanban/__tests__/BoardView.test.tsx`
- [ ] `frontend/src/hooks/__tests__/useBoard.test.ts`

### 5.5 可选: 鉴权
- [ ] `backend/app/core/security.py` - JWT 签发/验证
- [ ] `backend/app/api/v1/endpoints/auth.py` - register, login, me
- [ ] `backend/app/schemas/token.py` - Token schema
- [ ] `frontend/src/api/auth.ts` - 鉴权 API
- [ ] `frontend/src/pages/LoginPage.tsx` - 登录页
- [ ] `frontend/src/store/authStore.ts` - 鉴权状态
- [ ] `frontend/src/hooks/useAuth.ts` - 鉴权 hook
- [ ] `backend/tests/test_auth.py` - 鉴权测试

### 5.6 代码质量
- [ ] `frontend/eslint.config.js` - ESLint 配置
- [x] `frontend/.prettierrc` - Prettier 配置
- [x] `backend/pytest.ini` - pytest 配置

---

## 验证清单

完成所有任务后，执行以下验证：

1. **一键启动**
   - [ ] `docker compose up --build` 成功启动
   - [ ] 访问 http://localhost:5173 看到看板界面
   - [ ] 访问 http://localhost:8000/docs 看到 Swagger 文档

2. **功能验证**
   - [ ] 任务 CRUD 操作正常
   - [ ] 拖拽移动持久化
   - [ ] 刷新页面数据不丢失

3. **实时同步验证**
   - [ ] 多标签页实时同步

4. **测试通过**
   - [ ] `pytest` 后端测试通过
   - [ ] `npm test` 前端测试通过

---

## 文件统计

| 模块 | 文件数 | 状态 |
|------|--------|------|
| M1: 项目骨架 | 18 | ✅ |
| M2: 数据模型 + CRUD | 29 | ✅ |
| M3: 拖拽功能 | 17 | ✅ |
| M4: WebSocket | 8 | ✅ |
| M5: 体验完善 | 23 | ⬜ |
| **总计** | **95** | ⬜ |

---

> 最后更新: 2026-01-18
> [PROTOCOL]: 变更时更新此文档，保持与实际进度同步
