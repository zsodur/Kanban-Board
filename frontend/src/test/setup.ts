/**
 * [INPUT]: 依赖 @testing-library/jest-dom
 * [OUTPUT]: 对外提供测试环境设置
 * [POS]: test 模块的全局设置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import "@testing-library/jest-dom";

// Mock matchMedia for tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
