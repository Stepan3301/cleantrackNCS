
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layouts/app-shell";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Hours from "./pages/Hours";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Protected Routes */}
          <Route element={<AppShell><Dashboard /></AppShell>} path="/dashboard" />
          <Route element={<AppShell><Hours /></AppShell>} path="/hours" />
          <Route element={<AppShell><Employees /></AppShell>} path="/employees" />
          <Route element={<AppShell><Analytics /></AppShell>} path="/analytics" />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
