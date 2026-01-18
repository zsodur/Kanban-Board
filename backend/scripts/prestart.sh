#!/bin/bash
# ==============================================================================
#  启动前脚本 - 数据库迁移与初始化
# ==============================================================================
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -e

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Seeding database..."
python -c "
import asyncio
from app.db.session import AsyncSessionLocal
from app.db.init_db import seed_default_board
from app.crud import get_user_by_email

async def seed():
    async with AsyncSessionLocal() as db:
        # 检查是否已有数据
        user = await get_user_by_email(db, 'demo@example.com')
        if not user:
            print('Creating seed data...')
            await seed_default_board(db)
            await db.commit()
            print('Seed data created!')
        else:
            print('Seed data already exists, skipping.')

asyncio.run(seed())
"

echo "==> Prestart complete"
