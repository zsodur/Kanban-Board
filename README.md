# Kanban Board

全栈看板任务管理应用，支持拖拽排序、实时同步。

## 技术栈

**前端**: React 18 + TypeScript + Vite + TailwindCSS + @dnd-kit
**后端**: Python 3.12 + FastAPI + SQLAlchemy 2.x + PostgreSQL
**部署**: Docker Compose

## 快速启动

```bash
docker compose up
```

浏览器打开 `http://localhost:5173`

## 项目结构

```
├── frontend/          # React 前端
├── backend/           # FastAPI 后端
├── docs/              # 项目文档
├── docker-compose.yml # 容器编排
└── CLAUDE.md          # AI 开发规范
```

## 功能

- 三列看板 (待办 / 进行中 / 已完成)
- 任务拖拽排序
- 任务创建、编辑、删除
- 实时搜索过滤 (⌘K 快捷键)
