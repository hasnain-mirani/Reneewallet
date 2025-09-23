import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SidebarTrigger,
  useSidebar 
} from '@/components/ui-admin//sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui-admin/button';
import { Input } from '@/components/ui-admin/input';
import { Badge } from '@/components/ui-admin/badge';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Shield,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const mockNotifications = [
  { id: 1, title: 'New user registered', time: '2 mins ago', type: 'info' },
  { id: 2, title: 'Wallet frozen due to suspicious activity', time: '5 mins ago', type: 'warning' },
  { id: 3, title: 'Transaction failed', time: '10 mins ago', type: 'error' },
  { id: 4, title: 'System backup completed', time: '1 hour ago', type: 'success' },
];

export function AdminNavbar() {
  const { user, logout } = useAuth();
  const { open } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: 'text-blue-400',
      warning: 'text-warning',
      error: 'text-destructive',
      success: 'text-success',
    };
    return icons[type as keyof typeof icons] || 'text-muted-foreground';
  };

  const unreadCount = mockNotifications.length;

  return (
    <motion.header 
      className="flex items-center justify-between h-16 px-6 bg-card border-b border-border shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users, transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80 bg-input border-border focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-accent hover:bg-accent"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{notification.title}</span>
                    <span className={`w-2 h-2 rounded-full ${getNotificationIcon(notification.type)}`} />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}