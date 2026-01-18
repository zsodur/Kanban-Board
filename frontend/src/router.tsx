/**
 * [INPUT]: 依赖 react-router-dom 的 Routes, Route
 * [OUTPUT]: 对外提供 AppRouter 路由组件
 * [POS]: 应用路由配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Routes, Route, Navigate } from "react-router-dom";
import BoardPage from "@/pages/BoardPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route path="/board" element={<BoardPage />} />
    </Routes>
  );
}

export default AppRouter;
