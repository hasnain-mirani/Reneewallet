// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { AuthProvider } from "@/contexts/AuthContext"; // uses useNavigate inside
import { WalletModalProvider } from "@/components/wallet/WalletModalContext";
import WalletConnectModal from "@/components/wallet/WalletConnectModal";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/ui/Footer";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import SendPage from "./pages/Send";
import ReceivePage from "./pages/Receive";
import ConvertPage from "./pages/Convert";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import Staking from "./pages/Staking";
import NotFound from "./pages/NotFound";

// Admin
import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Wallets from "./pages/admin/Wallets";
import Transactions from "./pages/admin/Transactions";
import Analytics from "./pages/admin/Analytics";
import Security from "./pages/admin/Security";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// ✅ one global language switcher
import LanguageSwitcher from "@/components/LanguageSwitcher";

const queryClient = new QueryClient();

function AppShell() {
  // Hide switcher on Landing ("/" or "/landing")
  const { pathname } = useLocation();
  const hideLang = pathname === "/" || pathname === "/landing";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Global Language Switcher (single instance) */}
      {!hideLang && (
        <div className="px-4 pt-2 flex justify-end">
          <LanguageSwitcher />
        </div>
      )}

      <main className="flex-1">
        <Routes>
          {/* Public */}
          {/* Removed: <Route element={<RootLayout />} /> (no-op before) */}
          <Route path="/" element={<Landing />} />
          <Route path="/portfolio" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/convert" element={<ConvertPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin login (public) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wallets"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <AdminLayout>
                  <Wallets />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute roles={["manager", "admin"]}>
                <AdminLayout>
                  <Transactions />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={["manager"]}>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/security"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={["manager"]}>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Router MUST wrap AuthProvider if AuthProvider uses useNavigate */}
        <BrowserRouter>
          <AuthProvider>
            <WalletModalProvider>
              <AppShell />
              <WalletConnectModal />
            </WalletModalProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
