import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SendPage from "./pages/Send";
import ReceivePage from "./pages/Receive";
import ConvertPage from "./pages/Convert";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isWalletView, setIsWalletView] = useState(false);

  // Check if user is accessing wallet routes
  useEffect(() => {
    const walletRoutes = ['/dashboard', '/send', '/receive', '/convert', '/history', '/settings'];
    const isWalletRoute = walletRoutes.some(route => window.location.pathname.startsWith(route));
    setIsWalletView(isWalletRoute);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            {isWalletView && <Navbar />}
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<SendPage />} />
              <Route path="/receive" element={<ReceivePage />} />
              <Route path="/convert" element={<ConvertPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
