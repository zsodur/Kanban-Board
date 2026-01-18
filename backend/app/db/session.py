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
#  根据数据库 URL 类型决定配置参数
# -------------------------------------------------------------------------
_is_sqlite = settings.async_database_url.startswith("sqlite")

_engine_kwargs: dict = {
    "echo": settings.debug,
}

if not _is_sqlite:
    _engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    })
else:
    _engine_kwargs.update({
        "connect_args": {"check_same_thread": False},
    })

async_engine = create_async_engine(settings.async_database_url, **_engine_kwargs)

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
