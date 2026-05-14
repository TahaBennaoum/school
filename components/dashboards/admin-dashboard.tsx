'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  TrendingUp,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  AlertCircle,
  Activity,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/shared/stats-card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Link from 'next/link';
import { useState } from 'react';

// Mock data
const monthlyRevenueData = [
  { month: 'Sep', revenue: 450000 },
  { month: 'Oct', revenue: 520000 },
  { month: 'Nov', revenue: 480000 },
  { month: 'Dec', revenue: 390000 },
  { month: 'Jan', revenue: 560000 },
  { month: 'Feb', revenue: 540000 },
  { month: 'Mar', revenue: 620000 },
  { month: 'Apr', revenue: 580000 },
  { month: 'May', revenue: 650000 },
];

const attendanceData = [
  { day: 'Sun', present: 85, absent: 15 },
  { day: 'Mon', present: 92, absent: 8 },
  { day: 'Tue', present: 88, absent: 12 },
  { day: 'Wed', present: 95, absent: 5 },
  { day: 'Thu', present: 90, absent: 10 },
  { day: 'Sat', present: 87, absent: 13 },
];

const gradeDistribution = [
  { name: 'Excellent (16-20)', value: 25, color: 'var(--chart-2)' },
  { name: 'Good (14-15.99)', value: 35, color: 'var(--chart-1)' },
  { name: 'Pass (10-13.99)', value: 28, color: 'var(--chart-3)' },
  { name: 'Fail (0-9.99)', value: 12, color: 'var(--chart-5)' },
];

const pendingUsers = [
  { id: 1, name: 'Ahmed Benali', email: 'ahmed@example.com', role: 'TEACHER', createdAt: '2 hours ago' },
  { id: 2, name: 'Fatima Zerrouki', email: 'fatima@example.com', role: 'STUDENT', createdAt: '5 hours ago' },
  { id: 3, name: 'Karim Hadj', email: 'karim@example.com', role: 'PARENT', createdAt: '1 day ago' },
];

const recentActivities = [
  { id: 1, type: 'student', title: 'New student registered', description: 'Karim Bensalem - 1AM-A', time: '5 min ago' },
  { id: 2, type: 'grade', title: 'Grades added', description: 'Math 2AS - Term 1', time: '15 min ago' },
  { id: 3, type: 'payment', title: 'Payment received', description: 'Ahmed Benali - 25,000 DA', time: '30 min ago' },
  { id: 4, type: 'attendance', title: 'Absence reported', description: 'Fatima Zerrouki - 3AM-B', time: '1h ago' },
];

const upcomingEvents = [
  { id: 1, title: 'Term 1 Exam - Math', date: '15 Nov', time: '08:00', class: '3AS-Math' },
  { id: 2, title: 'Parent Meeting', date: '18 Nov', time: '14:00', class: 'All' },
  { id: 3, title: 'Physics Exam', date: '20 Nov', time: '10:00', class: '2AS-Science' },
];

export function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('activities');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.totalStudents')}
          value="1,248"
          description={t('dashboard.enrolledThisYear')}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={t('dashboard.teachers')}
          value="86"
          description={t('dashboard.activeStaff')}
          icon={GraduationCap}
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title={t('dashboard.classes')}
          value="42"
          description={t('dashboard.cemAndLycee')}
          icon={BookOpen}
        />
        <StatsCard
          title={t('dashboard.monthlyRevenue')}
          value="5.8M DA"
          description={t('dashboard.paymentsReceived')}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-warning" />
                  <CardTitle className="text-base">{t('dashboard.pendingValidation')}</CardTitle>
                  <Badge variant="secondary">{pendingUsers.length}</Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/users">{t('common.viewAll')}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {pendingUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{t(`roles.${user.role}`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <ClipboardList className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.attendanceRate')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">94.5%</p>
                <span className="flex items-center text-xs text-accent">
                  <ArrowUpRight className="h-3 w-3" /> 2.1%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.overallAverage')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">13.8/20</p>
                <span className="flex items-center text-xs text-accent">
                  <ArrowUpRight className="h-3 w-3" /> 0.5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.latePayments')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">28</p>
                <span className="flex items-center text-xs text-destructive">
                  <ArrowDownRight className="h-3 w-3" /> 5
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.monthlyRevenue')}</CardTitle>
            <CardDescription>{t('dashboard.revenueDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} DA`, t('dashboard.revenue')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.gradeDistribution')}</CardTitle>
            <CardDescription>{t('dashboard.gradeDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, t('dashboard.students')]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Attendance Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyAttendance')}</CardTitle>
            <CardDescription>{t('dashboard.attendanceByDay')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="present" name={t('dashboard.present')} fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name={t('dashboard.absent')} fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Events */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activities">{t('dashboard.activities')}</TabsTrigger>
                <TabsTrigger value="events">{t('dashboard.events')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === 'activities' ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-bold">{event.date.split(' ')[0]}</span>
                      <span className="text-[10px]">{event.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.time} - {event.class}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/schedule">{t('dashboard.viewAllEvents')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
