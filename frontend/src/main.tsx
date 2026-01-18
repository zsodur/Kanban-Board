/**
 * [INPUT]: 依赖 react-dom/client 的 createRoot
 * [OUTPUT]: 对外提供 React 应用入口
 * [POS]: 前端应用入口，被 index.html 加载
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
