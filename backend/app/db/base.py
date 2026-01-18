"""
[INPUT]: 依赖 sqlalchemy 的 DeclarativeBase, Mapped, mapped_column
[OUTPUT]: 对外提供 Base 基类，用于所有 ORM 模型继承
[POS]: db 模块的基础设施，被 models 模块消费
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """SQLAlchemy 声明式基类"""

    pass


class TimestampMixin:
    """时间戳混入 - 自动管理 created_at / updated_at"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """UUID 主键混入"""

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )
