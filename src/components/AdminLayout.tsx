import React from "react";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui-admin/sidebar"; // <- barrel path
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { ProtectedRoute } from "./ProtectedRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "manager" | "viewer";
}

export function AdminLayout({ children, requiredRole = "viewer" }: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <SidebarProvider className="dark">
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />

          <div className="flex-1 flex flex-col">
            <AdminNavbar />

            <motion.main
              className="flex-1 p-6 overflow-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="max-w-7xl mx-auto">{children}</div>
            </motion.main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
