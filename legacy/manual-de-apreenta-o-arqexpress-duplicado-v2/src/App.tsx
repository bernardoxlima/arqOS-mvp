import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Budget from "./pages/Budget";
import PlantaLayout from "./pages/PlantaLayout";
import ShoppingList from "./pages/ShoppingList";
import AutoPreenchimento from "./pages/AutoPreenchimento";
import ProjetoManager from "./pages/ProjetoManager";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const App = () => {
  // QueryClient inside component to avoid HMR issues
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auto-preenchimento" element={<AutoPreenchimento />} />
              <Route path="/projeto" element={<ProjetoManager />} />
              {/* Legacy routes - redirect to new tabs */}
              <Route path="/planta-layout" element={<PlantaLayout />} />
              <Route path="/orcamento" element={<Budget />} />
              <Route path="/lista-compras" element={<ShoppingList />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
