# Frontend - React 前端应用

> L2 | 父级: /CLAUDE.md

React 18 + TypeScript + Vite + TailwindCSS + @dnd-kit

## 目录结构

```
frontend/
├── src/
│   ├── api/              # API 客户端
│   ├── components/       # React 组件
│   │   ├── kanban/      # 看板组件
│   │   ├── layout/      # 布局组件
│   │   └── ui/          # UI 基础组件 (shadcn)
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具函数
│   ├── pages/           # 页面组件
│   ├── store/           # Zustand 状态
│   ├── styles/          # 全局样式
│   ├── test/            # 测试配置
│   ├── types/           # TypeScript 类型
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── router.tsx       # 路由配置
├── public/              # 静态资源
├── index.html           # HTML 入口
├── vite.config.ts       # Vite 配置
├── vitest.config.ts     # 测试配置
├── tailwind.config.ts   # Tailwind 配置
├── eslint.config.js     # ESLint 配置
├── components.json      # shadcn/ui 配置
└── package.json         # 依赖清单
```

## UI 组件 (shadcn/ui)

- button.tsx - 按钮
- card.tsx - 卡片
- dialog.tsx - 对话框
- input.tsx - 输入框
- textarea.tsx - 文本域
- toast.tsx - 通知
- dropdown-menu.tsx - 下拉菜单
- badge.tsx - 徽章
- skeleton.tsx - 骨架屏

## 开发规范

- 每个文件必须包含 L3 头部注释 (INPUT/OUTPUT/POS/PROTOCOL)
- API 代理: `/api` -> `backend:8000`
- 状态管理: TanStack Query (服务端) + Zustand (客户端)
- 测试: Vitest + @testing-library/react

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
