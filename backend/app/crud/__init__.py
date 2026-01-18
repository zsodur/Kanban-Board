# ==============================================================================
#  CRUD Module - 数据访问层
# ==============================================================================
"""
[INPUT]: 依赖 users, boards, columns, tasks 子模块
[OUTPUT]: 对外提供所有 CRUD 操作
[POS]: crud 模块入口，统一导出所有数据访问函数
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from app.crud.boards import (
    create_board,
    delete_board,
    get_board,
    get_boards_by_owner,
    update_board,
)
from app.crud.columns import (
    create_column,
    delete_column,
    get_column,
    get_columns_by_board,
    update_column,
)
from app.crud.tasks import (
    create_task,
    delete_task,
    get_task,
    get_tasks_by_board,
    get_tasks_by_column,
    update_task,
)
from app.crud.users import create_user, get_user_by_email, get_user_by_id

__all__ = [
    # Users
    "create_user",
    "get_user_by_email",
    "get_user_by_id",
    # Boards
    "create_board",
    "get_boards_by_owner",
    "get_board",
    "update_board",
    "delete_board",
    # Columns
    "create_column",
    "get_columns_by_board",
    "get_column",
    "update_column",
    "delete_column",
    # Tasks
    "create_task",
    "get_tasks_by_board",
    "get_tasks_by_column",
    "get_task",
    "update_task",
    "delete_task",
]
