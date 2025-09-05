// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/ui/Footer";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SendPage from "./pages/Send";
import ReceivePage from "./pages/Receive";
import ConvertPage from "./pages/Convert";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import Staking from '@/pages/Staking' // <-- add this import
import NotFound from "./pages/NotFound";
import { WalletModalProvider } from "@/components/wallet/walletModalContext";
import WalletConnectModal from "@/components/wallet/WalletModal";
const queryClient = new QueryClient();

const AppShell = () => {
  const location = useLocation();
  // include /staking here so navbar/footer render on Staking too
  const walletRoutes = [
    "/dashboard",
    "/staking",
    "/send",
    "/receive",
    "/convert",
    "/history",
    "/settings",
  ];
  const isWalletView = walletRoutes.some((r) => location.pathname.startsWith(r));

  return (
    <div className="min-h-screen bg-background flex flex-col">

<Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staking" element={<Staking />} /> {/* <-- router entry */}
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WalletModalProvider> 
            <AppShell />
            <WalletConnectModal />
          </WalletModalProvider>
         
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
