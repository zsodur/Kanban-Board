# ==============================================================================
#  Task Move API Tests
# ==============================================================================
"""
[INPUT]: 依赖 pytest, httpx.AsyncClient
[OUTPUT]: 测试 move_task API 端点
[POS]: tests 模块的任务移动测试
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""
import pytest
from httpx import AsyncClient


@pytest.fixture
async def board_with_columns(client: AsyncClient, demo_user) -> tuple[str, str, str]:
    """创建测试用看板和两个列，返回 (board_id, column1_id, column2_id)"""
    board_response = await client.post("/api/v1/boards", json={"title": "测试看板"})
    board_id = board_response.json()["id"]

    col1_response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "待办", "order_index": 0},
    )
    col1_id = col1_response.json()["id"]

    col2_response = await client.post(
        f"/api/v1/boards/{board_id}/columns",
        json={"title": "进行中", "order_index": 1},
    )
    col2_id = col2_response.json()["id"]

    return board_id, col1_id, col2_id


@pytest.mark.asyncio
async def test_move_task_same_column(
    client: AsyncClient, board_with_columns: tuple[str, str, str]
) -> None:
    """测试同列内移动任务"""
    board_id, col1_id, _ = board_with_columns

    # 创建三个任务
    t1 = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务1", "column_id": col1_id, "position": 0},
    )
    t2 = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务2", "column_id": col1_id, "position": 1},
    )
    t3 = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务3", "column_id": col1_id, "position": 2},
    )

    task1_id = t1.json()["id"]
    task3_id = t3.json()["id"]

    # 将任务3移动到位置0（最前面）
    response = await client.patch(
        f"/api/v1/tasks/{task3_id}/move",
        json={"column_id": col1_id, "position": 0},
    )
    assert response.status_code == 200
    assert response.json()["position"] == 0

    # 验证任务顺序
    tasks_response = await client.get(f"/api/v1/boards/{board_id}/tasks")
    tasks = tasks_response.json()
    titles = [t["title"] for t in sorted(tasks, key=lambda x: x["position"])]
    assert titles == ["任务3", "任务1", "任务2"]


@pytest.mark.asyncio
async def test_move_task_cross_column(
    client: AsyncClient, board_with_columns: tuple[str, str, str]
) -> None:
    """测试跨列移动任务"""
    board_id, col1_id, col2_id = board_with_columns

    # 在列1创建任务
    t1 = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "任务A", "column_id": col1_id, "position": 0},
    )
    task_id = t1.json()["id"]

    # 移动到列2
    response = await client.patch(
        f"/api/v1/tasks/{task_id}/move",
        json={"column_id": col2_id, "position": 0},
    )
    assert response.status_code == 200
    assert response.json()["column_id"] == col2_id
    assert response.json()["position"] == 0


@pytest.mark.asyncio
async def test_move_task_to_first_position(
    client: AsyncClient, board_with_columns: tuple[str, str, str]
) -> None:
    """测试移动到列首"""
    board_id, col1_id, col2_id = board_with_columns

    # 在列2创建两个任务
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "已存在1", "column_id": col2_id, "position": 0},
    )
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "已存在2", "column_id": col2_id, "position": 1},
    )

    # 在列1创建任务
    t = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "新任务", "column_id": col1_id, "position": 0},
    )
    task_id = t.json()["id"]

    # 移动到列2的位置0
    response = await client.patch(
        f"/api/v1/tasks/{task_id}/move",
        json={"column_id": col2_id, "position": 0},
    )
    assert response.status_code == 200
    assert response.json()["position"] == 0


@pytest.mark.asyncio
async def test_move_task_to_last_position(
    client: AsyncClient, board_with_columns: tuple[str, str, str]
) -> None:
    """测试移动到列尾"""
    board_id, col1_id, col2_id = board_with_columns

    # 在列2创建两个任务
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "已存在1", "column_id": col2_id, "position": 0},
    )
    await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "已存在2", "column_id": col2_id, "position": 1},
    )

    # 在列1创建任务
    t = await client.post(
        f"/api/v1/boards/{board_id}/tasks",
        json={"title": "新任务", "column_id": col1_id, "position": 0},
    )
    task_id = t.json()["id"]

    # 移动到列2的末尾（position=99 会被修正为实际末尾）
    response = await client.patch(
        f"/api/v1/tasks/{task_id}/move",
        json={"column_id": col2_id, "position": 99},
    )
    assert response.status_code == 200
    assert response.json()["position"] == 2  # 0, 1, 2


@pytest.mark.asyncio
async def test_reorder_preserves_positions(
    client: AsyncClient, board_with_columns: tuple[str, str, str]
) -> None:
    """测试重排后 position 保持连续 (0, 1, 2, ...)"""
    board_id, col1_id, _ = board_with_columns

    # 创建多个任务
    for i in range(5):
        await client.post(
            f"/api/v1/boards/{board_id}/tasks",
            json={"title": f"任务{i}", "column_id": col1_id, "position": i},
        )

    # 获取所有任务
    tasks_response = await client.get(f"/api/v1/boards/{board_id}/tasks")
    tasks = tasks_response.json()

    # 移动中间的任务到开头
    task_id = [t for t in tasks if t["title"] == "任务2"][0]["id"]
    await client.patch(
        f"/api/v1/tasks/{task_id}/move",
        json={"column_id": col1_id, "position": 0},
    )

    # 验证所有 position 连续
    tasks_response = await client.get(f"/api/v1/boards/{board_id}/tasks")
    tasks = sorted(tasks_response.json(), key=lambda x: x["position"])
    positions = [t["position"] for t in tasks]
    assert positions == [0, 1, 2, 3, 4]
