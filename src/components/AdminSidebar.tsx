import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui-admin/sidebar';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Shield,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    requiredRole: 'viewer'
  },
  {
    title: 'Users',
    url: '/admin/users', 
    icon: Users,
    requiredRole: 'viewer'
  },
  {
    title: 'Wallets',
    url: '/admin/wallets',
    icon: Wallet,
    requiredRole: 'viewer'
  },
  {
    title: 'Transactions',
    url: '/admin/transactions',
    icon: ArrowLeftRight,
    requiredRole: 'viewer'
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
    requiredRole: 'manager'
  },
  {
    title: 'Security',
    url: '/admin/security',
    icon: Shield,
    requiredRole: 'admin'
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
    requiredRole: 'manager'
  },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  
  const roleHierarchy = { admin: 3, manager: 2, viewer: 1 };
  const userRole = roleHierarchy[user?.role || 'viewer'];

  const filteredItems = menuItems.filter(item => {
    const requiredLevel = roleHierarchy[item.requiredRole];
    return userRole >= requiredLevel;
  });

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const collapsed = !open;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <motion.div 
            className="flex items-center space-x-3"
            initial={false}
            animate={{ 
              justifyContent: collapsed ? 'center' : 'flex-start',
              opacity: 1 
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Wallet className="w-8 h-8 text-primary" />
              <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-gradient">Renee Wallet</h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="group relative"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-primary text-primary-foreground shadow-primary glow-primary' 
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon 
                            className={`w-5 h-5 transition-transform duration-200 ${
                              isActive ? 'scale-110' : 'group-hover:scale-105'
                            }`} 
                          />
                          {!collapsed && (
                            <motion.span
                              className="font-medium"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.title}
                            </motion.span>
                          )}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-lg bg-gradient-primary opacity-20"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.2 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats - Only show when expanded */}
        {!collapsed && (
          <motion.div
            className="mt-auto p-4 border-t border-sidebar-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="glass p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">System Status</span>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">All Systems Online</span>
              </div>
            </div>
          </motion.div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}