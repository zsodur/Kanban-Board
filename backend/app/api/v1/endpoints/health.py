"""
[INPUT]: 依赖 fastapi 的 APIRouter，依赖 sqlalchemy 的 text
[OUTPUT]: 对外提供 router (health 路由)
[POS]: endpoints 模块的健康检查端点，用于服务可用性探测
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    健康检查端点
    - 验证服务运行状态
    - 验证数据库连接
    """
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "database": db_status,
    }
