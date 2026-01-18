"""
[INPUT]: 依赖 fastapi 的 FastAPI，依赖 app.api.v1.api 的 api_router
[OUTPUT]: 对外提供 app (FastAPI 应用实例)
[POS]: 应用入口，被 uvicorn 直接加载
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    yield
    # 关闭时


app = FastAPI(
    title="Kanban Board API",
    description="类 Trello 的轻量看板任务管理系统",
    version="0.1.0",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# -------------------------------------------------------------------------
#  CORS 中间件
# -------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://frontend:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
#  注册路由
# -------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root():
    """根路径 - 服务信息"""
    return {
        "service": "Kanban Board API",
        "version": "0.1.0",
        "docs": "/docs",
    }
