#!/bin/bash
# ==============================================================================
#  启动脚本 - 启动 FastAPI 应用
# ==============================================================================
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -e

# 执行启动前脚本
./scripts/prestart.sh

echo "==> Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
