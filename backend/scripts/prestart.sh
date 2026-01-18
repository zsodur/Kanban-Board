#!/bin/bash
# ==============================================================================
#  启动前脚本 - 数据库迁移与初始化
# ==============================================================================
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -e

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Prestart complete"
