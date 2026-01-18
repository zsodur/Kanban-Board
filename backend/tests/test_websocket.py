# ==============================================================================
#  WebSocket 测试
# ==============================================================================
"""
[INPUT]: 依赖 pytest, starlette.testclient, app.main
[OUTPUT]: 对外提供 WebSocket 测试用例
[POS]: tests 模块的 WebSocket 测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import json
from uuid import uuid4, UUID

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.realtime import manager


# -------------------------------------------------------------------------
#  Fixtures
# -------------------------------------------------------------------------
@pytest.fixture
def sync_client():
    """同步测试客户端（WebSocket 测试需要）"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def board_id():
    """生成测试看板 ID"""
    return str(uuid4())


# -------------------------------------------------------------------------
#  WebSocket 连接测试
# -------------------------------------------------------------------------
def test_connect_to_board(sync_client, board_id):
    """测试 WebSocket 连接到看板"""
    with sync_client.websocket_connect(f"/api/v1/ws/boards/{board_id}") as ws:
        # 发送 ping，验证连接正常
        ws.send_text("ping")
        response = ws.receive_text()
        assert response == "pong"


def test_connect_multiple_clients(sync_client, board_id):
    """测试多客户端连接同一看板"""
    with sync_client.websocket_connect(f"/api/v1/ws/boards/{board_id}") as ws1:
        with sync_client.websocket_connect(f"/api/v1/ws/boards/{board_id}") as ws2:
            ws1.send_text("ping")
            ws2.send_text("ping")
            assert ws1.receive_text() == "pong"
            assert ws2.receive_text() == "pong"


# -------------------------------------------------------------------------
#  ConnectionManager 单元测试
# -------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_manager_broadcast():
    """测试 ConnectionManager 广播功能"""
    from unittest.mock import AsyncMock, MagicMock

    test_manager = type(manager)()  # 创建新实例
    board_uuid = uuid4()

    # 模拟 WebSocket
    mock_ws = AsyncMock()
    mock_ws.send_text = AsyncMock()

    # 手动添加连接
    test_manager._connections[board_uuid] = [mock_ws]

    # 广播消息
    await test_manager.broadcast(board_uuid, "task_created", {"id": "123"})

    # 验证 send_text 被调用
    mock_ws.send_text.assert_called_once()
    call_args = mock_ws.send_text.call_args[0][0]
    event = json.loads(call_args)

    assert event["type"] == "task_created"
    assert event["board_id"] == str(board_uuid)
    assert event["payload"]["id"] == "123"
    assert "ts" in event


@pytest.mark.asyncio
async def test_manager_connect_disconnect():
    """测试连接和断开管理"""
    from unittest.mock import AsyncMock

    test_manager = type(manager)()
    board_uuid = uuid4()

    mock_ws = AsyncMock()

    # 连接
    await test_manager.connect(mock_ws, board_uuid)
    mock_ws.accept.assert_called_once()
    assert board_uuid in test_manager._connections
    assert mock_ws in test_manager._connections[board_uuid]

    # 断开
    test_manager.disconnect(mock_ws, board_uuid)
    assert board_uuid not in test_manager._connections


@pytest.mark.asyncio
async def test_broadcast_event_helper():
    """测试 broadcast_event 辅助函数"""
    from unittest.mock import AsyncMock, patch

    board_uuid = uuid4()

    with patch.object(manager, "broadcast", new_callable=AsyncMock) as mock_broadcast:
        from app.services.realtime import broadcast_event

        await broadcast_event(board_uuid, "task_moved", {"id": "456", "position": 2})

        mock_broadcast.assert_called_once_with(
            board_uuid, "task_moved", {"id": "456", "position": 2}
        )


@pytest.mark.asyncio
async def test_broadcast_no_connections():
    """测试无连接时广播不报错"""
    test_manager = type(manager)()
    board_uuid = uuid4()

    # 无连接时广播，应正常返回
    await test_manager.broadcast(board_uuid, "task_deleted", {"id": "789"})
    # 没有异常即通过


@pytest.mark.asyncio
async def test_broadcast_removes_dead_connections():
    """测试广播时移除失败连接"""
    from unittest.mock import AsyncMock

    test_manager = type(manager)()
    board_uuid = uuid4()

    # 模拟失败的连接
    dead_ws = AsyncMock()
    dead_ws.send_text = AsyncMock(side_effect=Exception("Connection closed"))

    # 模拟正常的连接
    live_ws = AsyncMock()

    test_manager._connections[board_uuid] = [dead_ws, live_ws]

    await test_manager.broadcast(board_uuid, "task_updated", {"id": "abc"})

    # 死连接应被移除
    assert dead_ws not in test_manager._connections.get(board_uuid, [])
    assert live_ws in test_manager._connections[board_uuid]
