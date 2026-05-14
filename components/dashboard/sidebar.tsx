'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  BookMarked,
  FileQuestion,
  UserCheck,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/rbac/permissions';

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: number;
}

const navItems: NavItem[] = [
  { titleKey: 'nav.dashboard', href: '/', icon: LayoutDashboard, permission: 'dashboard.view' },
  { titleKey: 'nav.students', href: '/students', icon: Users, permission: 'students.view' },
  { titleKey: 'nav.teachers', href: '/teachers', icon: GraduationCap, permission: 'teachers.view' },
  { titleKey: 'nav.classes', href: '/classes', icon: BookOpen, permission: 'classes.view' },
  { titleKey: 'nav.rooms', href: '/rooms', icon: Building2, permission: 'rooms.view' },
  { titleKey: 'nav.schedule', href: '/schedule', icon: Calendar, permission: 'schedule.view' },
  { titleKey: 'nav.attendance', href: '/attendance', icon: ClipboardList, permission: 'attendance.view' },
  { titleKey: 'nav.grades', href: '/grades', icon: FileText, permission: 'grades.view' },
  { titleKey: 'nav.courses', href: '/courses', icon: BookMarked, permission: 'courses.view' },
  { titleKey: 'nav.quizzes', href: '/quizzes', icon: FileQuestion, permission: 'quizzes.view' },
  { titleKey: 'nav.payments', href: '/payments', icon: CreditCard, permission: 'payments.view' },
  { titleKey: 'nav.messages', href: '/messages', icon: MessageSquare, permission: 'messages.view' },
  { titleKey: 'nav.notifications', href: '/notifications', icon: Bell, permission: 'notifications.view' },
  { titleKey: 'nav.reports', href: '/reports', icon: BarChart3, permission: 'reports.view' },
  { titleKey: 'nav.userValidation', href: '/admin/users', icon: UserCheck, permission: 'user_validation.view' },
  { titleKey: 'nav.settings', href: '/settings', icon: Settings, permission: 'settings.view' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const { can } = usePermissions();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar rtl:left-auto rtl:right-0 rtl:border-l rtl:border-r-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-semibold text-sidebar-foreground whitespace-nowrap overflow-hidden"
                  >
                    SchoolHub
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              ) : (
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden flex-1"
                        >
                          {t(item.titleKey)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!sidebarCollapsed && item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        <div className="flex items-center gap-2">
                          {t(item.titleKey)}
                          {item.badge && item.badge > 0 && (
                            <Badge variant="secondary">{item.badge}</Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </nav>
          </ScrollArea>

          {/* User Info & Logout */}
          <div className="border-t border-sidebar-border p-3">
            {user && (
              <div className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2',
                sidebarCollapsed ? 'justify-center' : ''
              )}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 overflow-hidden"
                    >
                      <p className="truncate text-sm font-medium text-sidebar-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t(`roles.${user.role}`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent mt-2',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {t('common.logout')}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">{t('common.logout')}</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
