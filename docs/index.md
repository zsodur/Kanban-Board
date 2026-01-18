下面给出你要的 3 个交付物（按仓库落盘即可）：

1. **详细 PRD（docs/PRD.md）**
2. **技术 SPEC（docs/SPEC.md）**
3. **完整文件树（Git 版本库应提交的所有文件；不包含 node_modules / dist / **pycache** 等生成物）**

---

## PRD（docs/PRD.md）

```md
# 看板任务管理（Kanban Board）PRD

## 1. 文档信息
- 产品名称：Kanban Board（类 Trello 的轻量看板）
- 目标版本：MVP v0.1
- 文档版本：1.0
- 作者：（你/团队）
- 日期：YYYY-MM-DD

## 2. 背景与问题
团队/个人在处理中小规模任务时，常需要：
- 直观查看任务状态（Todo / Doing / Done）
- 通过拖拽快速流转任务
- 多端/多标签页实时同步，避免“我刚挪的卡片你还没看到”
- 数据持久化（刷新不丢）

现有工具（如 Trello）功能强但对“自建、可控、可扩展”不友好，且对学习/二次开发不便。

## 3. 产品目标
### 3.1 目标（Must）
- 提供一个看板页面，包含至少 3 列：Todo / Doing / Done
- 支持卡片（任务）在列间拖拽移动、列内拖拽排序
- 支持任务的创建、编辑、删除
- 所有变更持久化到数据库
- 支持数据同步：
  - 基础：刷新/重开页面能看到最新数据
  - 增强（推荐）：多客户端实时同步（WebSocket 推送变更事件）
- 前端 + 后端 API + 数据库必须可通过 `docker compose` 一键启动联调

### 3.2 成功指标（MVP 指标建议）
- 功能可用性：
  - 任务拖拽移动成功率 ≥ 99%（正常网络条件）
  - 刷新页面数据一致（无丢失、无重复、顺序正确）
- 性能：
  - 首屏可交互（本地开发）< 2s（参考）
  - 单个看板 500 张卡片仍可流畅拖拽（参考）
- 稳定性：
  - API 500 错误率（本地/CI）趋近 0
  - 关键操作（move/reorder）有事务保护，顺序不乱

## 4. 用户与场景
### 4.1 目标用户
- 个人用户：用于个人任务管理
- 小团队：用于轻协作（后续可扩展共享/权限）

### 4.2 核心场景
1) 用户打开看板 -> 看到 Todo/Doing/Done 三列与任务
2) 用户新建任务，默认进入 Todo
3) 用户拖拽任务从 Todo -> Doing（自动保存）
4) 用户调整 Doing 内的任务优先级（拖拽排序）
5) 另一个浏览器/标签页打开同一个看板 -> 实时看到任务变化（推荐）

## 5. 范围定义
### 5.1 MVP 功能清单
#### A. 看板
- 默认提供一个看板（可 seed）
-（可选）支持创建多个看板、切换看板（建议做，但 MVP 可先单看板）

#### B. 列（Columns）
- 默认 3 列：Todo / Doing / Done
- MVP：列名可显示（可选支持重命名）
- MVP：列顺序固定（可选支持列排序）

#### C. 任务（Tasks）
- 字段（MVP 必需）：
  - 标题 title（必填）
  - 描述 description（可选）
  - 状态列 column_id（必需）
  - 顺序 position（必需，列内排序）
  - 创建/更新时间 created_at / updated_at（必需）
- 能力：
  - 创建任务（在某列顶部/底部，产品定义一种即可）
  - 编辑任务（标题、描述）
  - 删除任务
  - 列间移动、列内排序

#### D. 拖拽体验（Must）
- 拖拽时显示 DragOverlay（拖拽浮层）
- 拖拽完成后：
  - 前端立即更新（乐观更新）
  - 后端落库；失败则回滚并 toast 提示
- 支持触摸板/鼠标
-（可选）键盘可访问拖拽（后续增强）

#### E. 数据同步（Must + Recommended）
- Must：CRUD + move/reorder 走 API 持久化
- Recommended：WebSocket 推送事件，做到：
  - 多标签页/多客户端实时同步
  - 避免频繁轮询

#### F. 基础可用性
- 空状态（无任务）展示引导
- 错误提示（网络失败、校验失败）
- 加载态（骨架屏/Spinner）

### 5.2 非目标（MVP 不做）
- 复杂权限（看板分享、成员角色）
- 评论、附件、富文本
- 子任务、依赖关系、甘特图
- 离线编辑与冲突合并（可在 vNext 做）

## 6. 交互与页面
### 6.1 页面信息架构
- /login（可选：若启用鉴权）
- /board（MVP 主页面：看板）
- /boards/:id（可选：多看板）

### 6.2 看板页面组件
- 顶部 Topbar：
  - 产品名 / 当前看板名
  - 新建任务按钮
  -（可选）用户菜单/退出
- 主体 Board：
  - 三列 Column
  - 列头：列名 + 任务数量
  - 列内：TaskCard 列表
- 任务详情弹窗 Task Dialog：
  - 标题（可编辑）
  - 描述（可编辑）
  - 保存/关闭
  - 删除（危险操作二次确认）

## 7. 业务规则与校验
- 任务 title 必填，长度 1~120
- description 可选，长度 0~5000
- position 为整数且在列内唯一（后端保证最终一致）
- move/reorder 需要事务，避免并发导致顺序错乱
-（若启用鉴权）用户只能访问自己的看板

## 8. 数据同步与一致性策略（推荐方案）
- 前端采用乐观更新：
  - 拖拽完成立即更新 UI
  - 发起 PATCH /tasks/{id}/move
  - 失败：回滚本地状态并提示
- WebSocket 事件：
  - 后端在写入成功后广播事件（task_created / task_updated / task_moved / task_deleted）
  - 前端收到事件后更新缓存（TanStack Query cache）以保持一致

## 9. 埋点与日志（可选）
- 事件：task_create, task_edit, task_move, task_delete
- 指标：平均每天移动次数、列内任务数分布
- 后端日志：请求耗时、错误栈、关键操作审计（move/reorder）

## 10. 验收标准（MVP）
- docker compose 一键启动：
  - 前端可访问（localhost:5173）
  - 后端可访问（localhost:8000，Swagger 可用）
  - 数据库启动并可被后端连接
- 任务 CRUD：
  - 创建后刷新页面仍存在
  - 编辑后刷新页面仍为最新
  - 删除后刷新页面不再出现
- 拖拽移动：
  - Todo -> Doing -> Done 都可
  - 列内排序变化持久化
- 同步（若启用 WebSocket）：
  - 两个浏览器窗口同时打开，同步看到对方的拖拽结果

## 11. 里程碑建议
- M1：项目骨架 + docker compose 联调跑通（前端空页面 + 后端 health + DB）
- M2：数据模型 + CRUD API + 前端列表渲染
- M3：拖拽（列间移动/列内排序）+ 持久化
- M4：WebSocket 推送 + 前端实时同步
- M5：完善体验（toast、loading、空状态、测试、lint）

## 12. 风险与对策
- 风险：拖拽排序并发导致 position 混乱
  - 对策：后端 move/reorder 使用事务 + 重排策略（必要时整列重排）
- 风险：WebSocket 多实例广播
  - 对策：MVP 单实例；生产用 Redis PubSub/消息队列扩展（SPEC 中给出扩展点）
```

---

## SPEC（docs/SPEC.md）

```md
# Kanban Board 技术规格（SPEC）

## 1. 技术栈（推荐落地）
### 1.1 前端
- React 18 + TypeScript
- Vite（开发/构建）
- TailwindCSS
- shadcn/ui（基于 Radix UI）
- @dnd-kit（拖拽排序）
- TanStack Query（服务端状态缓存 + 乐观更新）
- Zustand（轻量本地状态：token/UI 状态）
- zod（前端表单校验）

### 1.2 后端
- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy 2.x（建议走 2.0 风格）
- Alembic（迁移）
- Pydantic v2（schema）
- psycopg（PostgreSQL 驱动）
-（可选）python-jose / passlib[bcrypt]（JWT 鉴权）

### 1.3 数据库
- PostgreSQL 16

### 1.4 容器与联调
- docker compose
- 约定端口：
  - 前端：5173
  - 后端：8000
  - DB：5432（仅本地可暴露，或不暴露也可）

---

## 2. 总体架构
```

Browser
|
|  [http://localhost:5173](http://localhost:5173) (Vite Dev Server)
|   - /api/*  反向代理到 backend
|   - /ws/*   反向代理到 backend websocket
v
Frontend (React)
|
v
Backend (FastAPI)  ---> PostgreSQL
|
+-- WebSocket 广播（单实例内存广播；可扩展到 Redis PubSub）

````

### 2.1 联调关键点（推荐方案）
- 浏览器访问的是 `localhost:5173`
- 前端所有 API 调用使用相对路径：
  - REST：`/api/v1/...`
  - WS：`/ws/boards/{board_id}`
- Vite dev server 在容器内将 `/api` 与 `/ws` **代理**到 `backend:8000`
- 好处：避免 CORS、环境变量更简单、体验更贴近生产反向代理

---

## 3. 数据模型（ERD 与表结构）
### 3.1 ERD（文字版）
- User 1 --- N Board
- Board 1 --- N Column
- Column 1 --- N Task
- Board 1 --- N Task（冗余 board_id 便于查询与约束）

### 3.2 表结构（建议）
> 主键统一使用 UUID（uuid4），时间使用 timestamptz（UTC）。

#### users
- id uuid PK
- email varchar(255) UNIQUE NOT NULL
- hashed_password varchar(255) NOT NULL
- display_name varchar(120) NOT NULL
- created_at timestamptz NOT NULL
- updated_at timestamptz NOT NULL

索引：
- unique(email)

#### boards
- id uuid PK
- owner_id uuid NOT NULL FK -> users.id
- title varchar(120) NOT NULL
- created_at timestamptz NOT NULL
- updated_at timestamptz NOT NULL

索引：
- idx_boards_owner_id(owner_id)

#### columns
- id uuid PK
- board_id uuid NOT NULL FK -> boards.id
- title varchar(60) NOT NULL
- order_index int NOT NULL  （列顺序；MVP 可固定 0/1/2）
- created_at timestamptz NOT NULL
- updated_at timestamptz NOT NULL

约束：
- UNIQUE(board_id, order_index)

索引：
- idx_columns_board_id(board_id)

#### tasks
- id uuid PK
- board_id uuid NOT NULL FK -> boards.id
- column_id uuid NOT NULL FK -> columns.id
- title varchar(120) NOT NULL
- description text NULL
- position int NOT NULL    （列内顺序，0..n-1）
- created_at timestamptz NOT NULL
- updated_at timestamptz NOT NULL

约束：
- UNIQUE(column_id, position) （可选：若使用整列重排强一致）
  - 或不加唯一约束，靠事务重排，避免高并发下死锁（推荐：不加唯一，靠逻辑保证最终一致）

索引：
- idx_tasks_board_id(board_id)
- idx_tasks_column_id(column_id)
-（可选）GIN/trgm 索引用于搜索 title/description

---

## 4. API 设计（REST）
### 4.1 通用约定
- Base path：`/api/v1`
- Content-Type：`application/json`
- 统一错误格式：
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required",
    "details": { "field": "title" }
  }
}
````

### 4.2 鉴权（可选但推荐）

> MVP 若想更轻：可以用“开发默认用户”跳过 /auth；但为了“类 Trello”和多端数据隔离，建议保留。

#### POST /auth/register

Request:

```json
{ "email": "a@b.com", "password": "123456", "display_name": "Alice" }
```

Response:

```json
{ "id": "uuid", "email": "a@b.com", "display_name": "Alice" }
```

#### POST /auth/login

Request:

```json
{ "email": "a@b.com", "password": "123456" }
```

Response:

```json
{ "access_token": "jwt", "token_type": "bearer" }
```

#### GET /auth/me

Header: `Authorization: Bearer <jwt>`
Response:

```json
{ "id": "uuid", "email": "a@b.com", "display_name": "Alice" }
```

---

## 5. 看板与列

### 5.1 Boards

#### GET /boards

Response:

```json
[
  { "id": "uuid", "title": "My Board", "owner_id": "uuid", "created_at": "...", "updated_at": "..." }
]
```

#### POST /boards

Request:

```json
{ "title": "New Board" }
```

#### GET /boards/{board_id}

返回 board 基本信息（列与任务分开拉取也可）

#### PATCH /boards/{board_id}

Request:

```json
{ "title": "Renamed" }
```

#### DELETE /boards/{board_id}

* 删除 board 及其 columns/tasks（CASCADE 或应用层删除）

### 5.2 Columns

#### GET /boards/{board_id}/columns

Response:

```json
[
  { "id": "uuid", "board_id": "uuid", "title": "Todo", "order_index": 0 },
  { "id": "uuid", "board_id": "uuid", "title": "Doing", "order_index": 1 },
  { "id": "uuid", "board_id": "uuid", "title": "Done", "order_index": 2 }
]
```

#### POST /boards/{board_id}/columns（可选）

MVP 可不开放（列固定）；若开放：
Request:

```json
{ "title": "Review", "order_index": 3 }
```

#### PATCH /columns/{column_id}

Request:

```json
{ "title": "In Progress" }
```

#### DELETE /columns/{column_id}（可选）

需要决定列下任务如何处理（禁止删除 / 迁移到 Todo / 级联删除）

---

## 6. Tasks（任务）

### 6.1 获取任务

#### GET /boards/{board_id}/tasks?column_id=&q=&limit=&offset=

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "board_id": "uuid",
      "column_id": "uuid",
      "title": "Implement DnD",
      "description": "",
      "position": 0,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total": 12
}
```

### 6.2 创建任务

#### POST /boards/{board_id}/tasks

Request:

```json
{ "column_id": "uuid", "title": "New Task", "description": "" }
```

Response: 返回创建后的 task（包含 position）

* position 策略：

  * 默认插入到列末尾：position = 当前最大+1

### 6.3 编辑任务

#### PATCH /tasks/{task_id}

Request:

```json
{ "title": "Updated", "description": "..." }
```

### 6.4 删除任务

#### DELETE /tasks/{task_id}

---

## 7. Move/Reorder（拖拽核心）

### 7.1 PATCH /tasks/{task_id}/move

用于“列内排序”和“跨列移动”。

Request:

```json
{
  "to_column_id": "uuid",
  "to_position": 2
}
```

后端事务逻辑（推荐，强一致）：

1. SELECT 目标列任务列表（按 position asc）
2. 从原列移除该 task（若同列移动，先移除再插入）
3. 在目标列列表的 to_position 插入
4. 对受影响的两列（或同一列）执行 **整列重排**：重新写入 position = 0..n-1
5. COMMIT
6. 广播 WebSocket 事件 task_moved（包含 task_id、from/to、最终 position）

返回：

```json
{
  "id": "uuid",
  "column_id": "uuid",
  "position": 2,
  "updated_at": "..."
}
```

> 说明：整列重排简单可靠；即使列内任务较多，也能接受（MVP）。后续可优化为“局部重排/稀疏排序/lexorank”。

---

## 8. WebSocket（实时同步，推荐）

### 8.1 连接

* URL：`/ws/boards/{board_id}`
* 若启用鉴权：

  * Query：`?token=...` 或 Header（浏览器 WS 限制 header 不易）
* 心跳：可选 ping/pong（或前端定时发送 ping）

### 8.2 消息格式（统一 envelope）

```json
{
  "type": "task_moved",
  "board_id": "uuid",
  "ts": "2026-01-18T12:00:00Z",
  "payload": { ... }
}
```

### 8.3 事件类型

* task_created
* task_updated
* task_deleted
* task_moved
* column_updated（可选）
* board_updated（可选）

### 8.4 广播实现（MVP）

* 单 backend 实例：进程内维护 board_id -> connections 集合
* 写操作成功后向对应 board 的连接广播
* 扩展：Redis PubSub（多实例）：

  * 写操作 publish 到 redis channel: board:{board_id}
  * 所有实例 subscribe 后转发给本机连接

---

## 9. 前端实现要点

### 9.1 状态管理策略

* TanStack Query：

  * queryKey: ["board", boardId, "columns"]
  * queryKey: ["board", boardId, "tasks"]
* mutations：

  * createTaskMutation / updateTaskMutation / deleteTaskMutation
  * moveTaskMutation（含 optimistic update + rollback）
* Zustand：

  * authStore：token、user
  * uiStore：dialog open、选中 taskId 等

### 9.2 拖拽（@dnd-kit）

* Column 内：SortableContext（按 task.id）
* DragOverlay：显示 TaskCard 的 preview
* onDragEnd：

  * 计算 from_column_id、to_column_id、to_position
  * 先本地乐观更新（更新 query cache）
  * 调用 move API
  * 成功：用后端返回的最终 position 校正
  * 失败：rollback + toast

### 9.3 与 WebSocket 的集成

* connect 后监听事件：

  * task_moved：更新 tasks cache 中对应 task 的 column_id/position，并对对应列做本地重排（按 position 排序）
  * task_created/deleted/updated：增删改 cache
* 避免“自己操作收到回声”：

  * 可在事件 payload 带 actor_id 或 request_id
  * 前端为每次 mutation 生成 request_id；后端原样广播；前端若命中则忽略或只校正

---

## 10. 后端实现要点

### 10.1 目录分层

* api：路由层（FastAPI router）
* schemas：Pydantic 输入输出
* models：SQLAlchemy ORM
* crud：基础 CRUD
* services：领域逻辑（move/reorder、广播、校验）
* db：session、base、初始化 seed

### 10.2 数据库会话

* 使用 SQLAlchemy session（建议每个请求一个 session）
* move/reorder 使用显式事务（session.begin）

### 10.3 CORS

* 若走 Vite proxy，相对路径同源基本不需要 CORS
* 仍建议在开发环境允许：

  * [http://localhost:5173](http://localhost:5173)

---

## 11. Docker Compose（一键联调）

### 11.1 目标

* `docker compose up --build` 后：

  * DB ready
  * backend 自动迁移 + seed
  * frontend dev server 可访问，并能代理到 backend API/WS

### 11.2 约定

* backend 服务名：backend（容器内 DNS：[http://backend:8000）](http://backend:8000）)
* db 服务名：db（容器内 DNS：db:5432）

---

## 12. 测试策略（建议）

### 12.1 后端

* pytest + httpx TestClient
* 覆盖：

  * health
  * task CRUD
  * task move（跨列/同列）
  * position 重排正确性（关键）

### 12.2 前端

* Vitest + React Testing Library（可选）
* E2E（可选）：Playwright
* 覆盖：

  * 新建任务
  * 拖拽移动（E2E 更合适）

---

## 13. 运维与可观测性（MVP）

* backend 日志：请求方法/路径/耗时/状态码
* 错误：统一异常处理输出 error envelope
* /health：返回 ok + db connectivity（可选）

````

---

## 完整文件树（包含所有应提交文件，不包含生成物）

> 说明：以下 file tree 以一个 **monorepo** 为例（根目录同时包含前后端与 docs）。你可以直接照这个结构创建项目；如果你希望拆成两个仓库，也可以把 frontend/backend 拆出去，但 `docker-compose.yml` 建议仍在根目录。

```text
kanban-board/
├── .editorconfig
├── .env.example
├── .gitignore
├── README.md
├── docker-compose.yml
├── docs/
│   ├── PRD.md
│   └── SPEC.md
├── backend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── requirements-dev.txt
│   ├── requirements.txt
│   ├── scripts/
│   │   ├── prestart.sh
│   │   └── start.sh
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 0001_init.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── api.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── auth.py
│   │   │           ├── boards.py
│   │   │           ├── columns.py
│   │   │           ├── health.py
│   │   │           └── tasks.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── boards.py
│   │   │   ├── columns.py
│   │   │   ├── tasks.py
│   │   │   └── users.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── init_db.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── board.py
│   │   │   ├── column.py
│   │   │   ├── task.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── board.py
│   │   │   ├── column.py
│   │   │   ├── events.py
│   │   │   ├── task.py
│   │   │   ├── token.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ordering.py
│   │   │   └── realtime.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── errors.py
│   │       └── time.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_health.py
│       └── test_move_task.py
├── frontend/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── .prettierrc
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── App.tsx
│       ├── env.d.ts
│       ├── main.tsx
│       ├── router.tsx
│       ├── api/
│       │   ├── auth.ts
│       │   ├── boards.ts
│       │   ├── client.ts
│       │   ├── columns.ts
│       │   └── tasks.ts
│       ├── components/
│       │   ├── kanban/
│       │   │   ├── BoardView.tsx
│       │   │   ├── ColumnView.tsx
│       │   │   ├── DragOverlayCard.tsx
│       │   │   ├── TaskCard.tsx
│       │   │   └── TaskEditorDialog.tsx
│       │   ├── layout/
│       │   │   ├── AppShell.tsx
│       │   │   └── Topbar.tsx
│       │   └── ui/
│       │       ├── badge.tsx
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── input.tsx
│       │       ├── textarea.tsx
│       │       └── toast.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useBoard.ts
│       │   ├── useDebouncedValue.ts
│       │   ├── useToast.ts
│       │   └── useWebSocket.ts
│       ├── lib/
│       │   ├── constants.ts
│       │   ├── utils.ts
│       │   └── validations.ts
│       ├── pages/
│       │   ├── BoardPage.tsx
│       │   └── LoginPage.tsx
│       ├── store/
│       │   ├── authStore.ts
│       │   └── uiStore.ts
│       ├── styles/
│       │   └── globals.css
│       └── types/
│           ├── api.ts
│           ├── index.ts
│           └── kanban.ts
└── scripts/
    └── dev.sh
````

---

如果你下一步希望我把这些文件**进一步补齐为“可直接运行的一套完整代码（含 docker-compose.yml、FastAPI 路由实现、迁移脚本、React 页面与拖拽逻辑、WS 同步、shadcn 组件落地）”**，我也可以继续按上述 file tree **逐文件给出内容**（你复制到对应文件即可跑起来）。
