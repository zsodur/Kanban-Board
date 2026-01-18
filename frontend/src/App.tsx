/**
 * [INPUT]: 依赖 react-router-dom, @tanstack/react-query
 * [OUTPUT]: 对外提供 App 根组件
 * [POS]: 应用根组件，提供路由和全局状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toast";
import AppRouter from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
