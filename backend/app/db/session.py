"""
[INPUT]: 依赖 sqlalchemy.ext.asyncio 的 async_sessionmaker, create_async_engine
[OUTPUT]: 对外提供 async_engine, AsyncSessionLocal, get_db 依赖
[POS]: db 模块的会话工厂，被 API 层通过依赖注入消费
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# -------------------------------------------------------------------------
#  异步引擎 - 连接池配置
# -------------------------------------------------------------------------
async_engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# -------------------------------------------------------------------------
#  异步会话工厂
# -------------------------------------------------------------------------
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖 - 提供数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
