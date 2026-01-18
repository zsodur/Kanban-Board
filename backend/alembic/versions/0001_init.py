"""初始迁移 - 空数据库

Revision ID: 0001
Revises:
Create Date: 2026-01-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # M1 阶段只需要空迁移，确保 alembic 可以运行
    pass


def downgrade() -> None:
    pass
