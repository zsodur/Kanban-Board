# Backend - FastAPI 后端服务

> L2 | 父级: /CLAUDE.md

Python 3.12 + FastAPI + SQLAlchemy 2.x + PostgreSQL

## 目录结构

```
backend/
├── app/                    # 应用主目录
│   ├── api/               # API 路由层
│   │   ├── deps.py       # 依赖注入
│   │   └── v1/           # v1 版本 API
│   │       ├── api.py    # 路由聚合
│   │       └── endpoints/# 各端点实现
│   ├── core/             # 核心配置
│   │   └── config.py     # Settings 配置类
│   ├── crud/             # 数据访问层
│   ├── db/               # 数据库相关
│   │   ├── base.py       # ORM 基类
│   │   └── session.py    # 会话工厂
│   ├── models/           # ORM 模型
│   ├── schemas/          # Pydantic 模式
│   ├── services/         # 业务逻辑层
│   └── main.py           # 应用入口
├── alembic/              # 数据库迁移
├── tests/                # 测试用例
├── scripts/              # 启动脚本
├── Dockerfile            # 容器镜像
└── requirements.txt      # 依赖清单
```

## 开发规范

- 每个文件必须包含 L3 头部注释 (INPUT/OUTPUT/POS/PROTOCOL)
- 使用异步数据库操作 (asyncpg)
- API 前缀: `/api/v1`
- 测试使用 SQLite 内存数据库

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
