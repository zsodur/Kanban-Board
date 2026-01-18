"""
[INPUT]: 依赖 fastapi 的 Depends，依赖 app.db.session 的 get_db
[OUTPUT]: 对外提供 get_db 依赖注入
[POS]: api 模块的依赖注入层，被所有 endpoints 消费
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db as _get_db


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """数据库会话依赖"""
    async for session in _get_db():
        yield session
