'use client';

import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/shared/page-header';
import { useAuthStore } from '@/store/auth-store';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { TeacherDashboard } from '@/components/dashboards/teacher-dashboard';
import { StudentDashboard } from '@/components/dashboards/student-dashboard';
import { ParentDashboard } from '@/components/dashboards/parent-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function PendingApprovalMessage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <CardTitle>{t('auth.accountPending')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.pendingDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Badge variant="secondary" className="text-sm">
            {t('auth.pendingStatus')}
          </Badge>
          <p className="mt-4 text-sm text-muted-foreground">
            {t('auth.pendingNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RejectedMessage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">{t('auth.accountRejected')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.rejectedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {user?.rejectionNote && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">{t('auth.rejectionReason')}:</p>
              <p className="mt-1 text-muted-foreground">{user.rejectionNote}</p>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {t('auth.rejectedNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SuspendedMessage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-warning/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <CardTitle>{t('auth.accountSuspended')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.suspendedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.suspendedNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  // Check user status first
  if (user?.status === 'PENDING') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${getGreeting()}, ${user?.firstName || t('common.user')}`}
          description={t('dashboard.welcomeMessage')}
        />
        <PendingApprovalMessage />
      </div>
    );
  }

  if (user?.status === 'REJECTED') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${getGreeting()}, ${user?.firstName || t('common.user')}`}
          description={t('dashboard.welcomeMessage')}
        />
        <RejectedMessage />
      </div>
    );
  }

  if (user?.status === 'SUSPENDED') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`${getGreeting()}, ${user?.firstName || t('common.user')}`}
          description={t('dashboard.welcomeMessage')}
        />
        <SuspendedMessage />
      </div>
    );
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
      case 'DIRECTOR':
        return <AdminDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      case 'PARENT':
        return <ParentDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${user?.firstName || t('common.user')}`}
        description={t('dashboard.welcomeMessage')}
      />
      {renderDashboard()}
    </div>
  );
}
