# ==============================================================================
#  Database Initialization
# ==============================================================================
"""
[INPUT]: 依赖 app.db.base.Base, app.db.session, app.models, app.crud
[OUTPUT]: 对外提供 init_db, seed_default_board
[POS]: db 模块的初始化逻辑
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import create_board, create_column, create_task, create_user
from app.db.base import Base
from app.db.session import async_engine
from app.schemas import BoardCreate, ColumnCreate, TaskCreate, UserCreate


async def init_db() -> None:
    """创建所有表"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_default_board(db: AsyncSession) -> None:
    """创建默认看板（含三列和示例任务）"""
    # 创建默认用户
    user = await create_user(
        db,
        UserCreate(
            email="demo@example.com",
            display_name="Demo User",
            password="demo123",
        ),
        hashed_password="$2b$12$demo_hashed_password_placeholder",
    )

    # 创建默认看板
    board = await create_board(db, BoardCreate(title="我的看板"), owner_id=user.id)

    # 创建三列
    col_todo = await create_column(
        db, ColumnCreate(title="待办", order_index=0), board_id=board.id
    )
    col_doing = await create_column(
        db, ColumnCreate(title="进行中", order_index=1), board_id=board.id
    )
    col_done = await create_column(
        db, ColumnCreate(title="已完成", order_index=2), board_id=board.id
    )

    # 创建示例任务
    await create_task(
        db,
        TaskCreate(title="欢迎使用看板", column_id=col_todo.id, position=0),
        board_id=board.id,
    )
    await create_task(
        db,
        TaskCreate(title="尝试拖拽任务卡片", column_id=col_todo.id, position=1),
        board_id=board.id,
    )
    await create_task(
        db,
        TaskCreate(
            title="点击编辑任务",
            description="单击任务卡片即可编辑详情",
            column_id=col_doing.id,
            position=0,
        ),
        board_id=board.id,
    )
    await create_task(
        db,
        TaskCreate(title="完成的任务", column_id=col_done.id, position=0),
        board_id=board.id,
    )
