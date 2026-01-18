"""
[INPUT]: 依赖 fastapi 的 APIRouter，依赖各 endpoints 模块的 router
[OUTPUT]: 对外提供 api_router (v1 路由聚合)
[POS]: api/v1 模块的路由聚合器，被 main.py 消费
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()

# -------------------------------------------------------------------------
#  注册路由
# -------------------------------------------------------------------------
api_router.include_router(health.router)
