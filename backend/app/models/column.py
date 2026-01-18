# ==============================================================================
#  Column ORM Model
# ==============================================================================
"""
[INPUT]: 依赖 app.db.base 的 Base, TimestampMixin, UUIDMixin
[OUTPUT]: 对外提供 Column ORM 模型
[POS]: models 模块的列实体，属于 Board，包含 Task
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Column(Base, UUIDMixin, TimestampMixin):
    """列模型"""

    __tablename__ = "columns"

    board_id: Mapped[UUID] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(100))
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # -------------------------------------------------------------------------
    #  关系
    # -------------------------------------------------------------------------
    board: Mapped["Board"] = relationship("Board", back_populates="columns")  # noqa: F821
    tasks: Mapped[list["Task"]] = relationship(  # noqa: F821
        "Task", back_populates="column", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Column {self.title}>"
