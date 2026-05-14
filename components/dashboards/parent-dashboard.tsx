'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  ClipboardList,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Bell,
  ChevronRight,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/shared/stats-card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Link from 'next/link';

// Mock data for parent
const children = [
  {
    id: 1,
    name: 'Ahmed Benali',
    class: '3AS-Math',
    average: 15.8,
    rank: 5,
    totalStudents: 32,
    attendanceRate: 96,
    trend: 'up',
    unpaidFees: 25000,
  },
  {
    id: 2,
    name: 'Sara Benali',
    class: '1AM-A',
    average: 14.2,
    rank: 12,
    totalStudents: 35,
    attendanceRate: 92,
    trend: 'stable',
    unpaidFees: 0,
  },
];

const gradeHistory = {
  1: [
    { month: 'Sep', average: 14.5 },
    { month: 'Oct', average: 15.0 },
    { month: 'Nov', average: 15.8 },
  ],
  2: [
    { month: 'Sep', average: 13.8 },
    { month: 'Oct', average: 14.0 },
    { month: 'Nov', average: 14.2 },
  ],
};

const recentGrades = {
  1: [
    { subject: 'Mathematics', grade: 17.5, date: 'Nov 10', type: 'Exam' },
    { subject: 'Physics', grade: 16.0, date: 'Nov 8', type: 'Quiz' },
    { subject: 'French', grade: 14.5, date: 'Nov 5', type: 'Assignment' },
  ],
  2: [
    { subject: 'Mathematics', grade: 15.0, date: 'Nov 10', type: 'Exam' },
    { subject: 'Arabic', grade: 14.0, date: 'Nov 9', type: 'Quiz' },
    { subject: 'Science', grade: 13.5, date: 'Nov 6', type: 'Assignment' },
  ],
};

const recentAbsences = {
  1: [
    { date: 'Nov 5', reason: 'Sick', justified: true },
  ],
  2: [
    { date: 'Nov 8', reason: 'Family event', justified: true },
    { date: 'Nov 3', reason: 'Not specified', justified: false },
  ],
};

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: 'Nov 18', time: '14:00', children: 'All' },
  { id: 2, title: 'Term 1 Exam - Math', date: 'Nov 20', time: '08:00', children: 'Ahmed' },
  { id: 3, title: 'Science Fair', date: 'Nov 25', time: '10:00', children: 'Sara' },
];

const paymentHistory = [
  { id: 1, description: 'Term 1 Fees - Ahmed', amount: 25000, status: 'pending', dueDate: 'Nov 30' },
  { id: 2, description: 'Term 1 Fees - Sara', amount: 25000, status: 'paid', paidDate: 'Oct 15' },
  { id: 3, description: 'Books - Ahmed', amount: 5000, status: 'paid', paidDate: 'Sep 20' },
];

export function ParentDashboard() {
  const { t } = useTranslation();
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const currentChild = children.find(c => c.id === selectedChild) || children[0];

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {t('dashboard.selectChild')}:
            </span>
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                className="gap-2 whitespace-nowrap"
                onClick={() => setSelectedChild(child.id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {child.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {child.name}
                {child.unpaidFees > 0 && (
                  <Badge variant="destructive" className="ml-1">!</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.overallAverage')}
          value={`${currentChild.average}/20`}
          description={`${t('dashboard.rank')} ${currentChild.rank}/${currentChild.totalStudents}`}
          icon={TrendingUp}
          trend={{ value: 0.5, isPositive: currentChild.trend === 'up' }}
        />
        <StatsCard
          title={t('dashboard.attendanceRate')}
          value={`${currentChild.attendanceRate}%`}
          description={currentChild.class}
          icon={ClipboardList}
        />
        <StatsCard
          title={t('dashboard.class')}
          value={currentChild.class}
          description={t('dashboard.currentYear')}
          icon={Users}
        />
        <StatsCard
          title={t('dashboard.unpaidFees')}
          value={currentChild.unpaidFees > 0 ? `${currentChild.unpaidFees.toLocaleString()} DA` : t('dashboard.allPaid')}
          description={currentChild.unpaidFees > 0 ? t('dashboard.paymentDue') : t('dashboard.upToDate')}
          icon={CreditCard}
          trend={currentChild.unpaidFees > 0 ? { value: 0, isPositive: false } : undefined}
        />
      </div>

      {/* Alerts */}
      {(currentChild.unpaidFees > 0 || recentAbsences[currentChild.id as keyof typeof recentAbsences]?.some(a => !a.justified)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {currentChild.unpaidFees > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium">{t('dashboard.paymentReminder')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.amountDue')}: {currentChild.unpaidFees.toLocaleString()} DA
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/payments">{t('dashboard.payNow')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {recentAbsences[currentChild.id as keyof typeof recentAbsences]?.some(a => !a.justified) && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="flex items-center gap-4 p-4">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">{t('dashboard.unjustifiedAbsence')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.pleaseJustify')}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/attendance">{t('dashboard.viewDetails')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Grade Evolution and Recent Grades */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Grade Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.gradeEvolution')}</CardTitle>
            <CardDescription>{currentChild.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gradeHistory[currentChild.id as keyof typeof gradeHistory]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[0, 20]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--chart-1)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.recentGrades')}</CardTitle>
                <CardDescription>{currentChild.name}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/grades">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades[currentChild.id as keyof typeof recentGrades]?.map((grade, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${
                    grade.grade >= 16 ? 'bg-accent/10 text-accent' :
                    grade.grade >= 10 ? 'bg-primary/10 text-primary' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {grade.grade}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{grade.subject}</p>
                    <p className="text-xs text-muted-foreground">{grade.type} - {grade.date}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">/20</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance, Events, Payments */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Absences */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.recentAbsences')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/attendance">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAbsences[currentChild.id as keyof typeof recentAbsences]?.length > 0 ? (
              <div className="space-y-3">
                {recentAbsences[currentChild.id as keyof typeof recentAbsences]?.map((absence, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                    {absence.justified ? (
                      <CheckCircle className="h-5 w-5 text-accent" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{absence.date}</p>
                      <p className="text-xs text-muted-foreground">{absence.reason}</p>
                    </div>
                    <Badge variant={absence.justified ? 'secondary' : 'outline'}>
                      {absence.justified ? t('dashboard.justified') : t('dashboard.unjustified')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-accent mb-2" />
                <p className="text-sm text-muted-foreground">{t('dashboard.noAbsences')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.upcomingEvents')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/schedule">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-bold">{event.date.split(' ')[0]}</span>
                    <span className="text-[10px]">{event.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time} - {event.children}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.payments')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/payments">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {payment.status === 'paid' ? (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{payment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.amount.toLocaleString()} DA
                    </p>
                  </div>
                  <Badge variant={payment.status === 'paid' ? 'secondary' : 'destructive'}>
                    {payment.status === 'paid' ? t('dashboard.paid') : t('dashboard.pending')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/messages">
            <MessageSquare className="h-6 w-6" />
            <span>{t('dashboard.contactTeacher')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/grades">
            <FileText className="h-6 w-6" />
            <span>{t('dashboard.viewBulletin')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/payments">
            <CreditCard className="h-6 w-6" />
            <span>{t('dashboard.makePayment')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/schedule">
            <Calendar className="h-6 w-6" />
            <span>{t('dashboard.viewSchedule')}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
