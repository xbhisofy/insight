import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import KeyLogin from "./pages/KeyLogin";
import KeyGuard from "./components/KeyGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/system-x9v2-portal-auth-k8m-login-xyz789" element={<AdminLogin />} />
          <Route path="/system-x9v2-dashboard-manage-k8m-xyz789" element={<AdminPanel />} />
          <Route path="/key-login" element={<KeyLogin />} />
          <Route
            path="/"
            element={
              <KeyGuard>
                <Index />
              </KeyGuard>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
