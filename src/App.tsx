import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";

console.log("=== App Component Initialization ===");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      onError: (error) => {
        console.error("Query error:", error);
      },
    },
  },
});

const RouteLogger = () => {
  const location = useLocation();
  console.log("=== Route Change ===");
  console.log("Current route:", location.pathname);
  console.log("Search params:", location.search);
  console.log("Hash:", location.hash);
  console.log("State:", location.state);
  return null;
};

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <RouteLogger />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="*" element={
              (() => {
                console.log("404 Route hit:", window.location.pathname);
                return <Navigate to="/" replace />;
              })()
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;