'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  TrendingUp,
  Calendar,
  ClipboardList,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { useAuthStore } from '@/store/auth-store';
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

// Mock data for charts
const monthlyRevenueData = [
  { month: 'Sep', revenue: 450000 },
  { month: 'Oct', revenue: 520000 },
  { month: 'Nov', revenue: 480000 },
  { month: 'Dec', revenue: 390000 },
  { month: 'Jan', revenue: 560000 },
  { month: 'Fev', revenue: 540000 },
  { month: 'Mar', revenue: 620000 },
  { month: 'Avr', revenue: 580000 },
  { month: 'Mai', revenue: 650000 },
];

const attendanceData = [
  { day: 'Dim', present: 85, absent: 15 },
  { day: 'Lun', present: 92, absent: 8 },
  { day: 'Mar', present: 88, absent: 12 },
  { day: 'Mer', present: 95, absent: 5 },
  { day: 'Jeu', present: 90, absent: 10 },
  { day: 'Sam', present: 87, absent: 13 },
];

const gradeDistribution = [
  { name: 'Excellent (16-20)', value: 25, color: 'var(--chart-2)' },
  { name: 'Bien (14-15.99)', value: 35, color: 'var(--chart-1)' },
  { name: 'Passable (10-13.99)', value: 28, color: 'var(--chart-3)' },
  { name: 'Insuffisant (0-9.99)', value: 12, color: 'var(--chart-5)' },
];

const recentActivities = [
  { id: 1, type: 'student', title: 'Nouvel etudiant inscrit', description: 'Karim Bensalem - 1AM-A', time: 'Il y a 5 min' },
  { id: 2, type: 'grade', title: 'Notes ajoutees', description: 'Math 2AS - Composition T1', time: 'Il y a 15 min' },
  { id: 3, type: 'payment', title: 'Paiement recu', description: 'Ahmed Benali - 25,000 DA', time: 'Il y a 30 min' },
  { id: 4, type: 'attendance', title: 'Absence signalee', description: 'Fatima Zerrouki - 3AM-B', time: 'Il y a 1h' },
  { id: 5, type: 'student', title: 'Nouvel etudiant inscrit', description: 'Lina Amrani - 2AS-Science', time: 'Il y a 2h' },
];

const upcomingEvents = [
  { id: 1, title: 'Composition T1 - Math', date: '15 Nov', time: '08:00', class: '3AS-Math' },
  { id: 2, title: 'Reunion parents', date: '18 Nov', time: '14:00', class: 'Tous' },
  { id: 3, title: 'Examen Physique', date: '20 Nov', time: '10:00', class: '2AS-Science' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon apres-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${user?.firstName || 'Utilisateur'}`}
        description="Voici un apercu de votre etablissement scolaire"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Etudiants"
          value="1,248"
          description="Inscrits cette annee"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Enseignants"
          value="86"
          description="Personnel actif"
          icon={GraduationCap}
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          title="Classes"
          value="42"
          description="CEM et Lycee"
          icon={BookOpen}
        />
        <StatsCard
          title="Revenus Mensuels"
          value="5.8M DA"
          description="Paiements recus"
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <ClipboardList className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux de presence</p>
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
              <p className="text-sm text-muted-foreground">Moyenne generale</p>
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
              <CreditCard className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paiements en retard</p>
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
            <CardTitle>Revenus Mensuels</CardTitle>
            <CardDescription>Evolution des paiements sur l&apos;annee scolaire</CardDescription>
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
                    formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Revenus']}
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
            <CardTitle>Distribution des Notes</CardTitle>
            <CardDescription>Repartition par tranche</CardDescription>
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
                    formatter={(value: number) => [`${value}%`, 'Etudiants']}
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
            <CardTitle>Presence Hebdomadaire</CardTitle>
            <CardDescription>Taux de presence par jour</CardDescription>
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
                  <Bar dataKey="present" name="Present" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Events */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Activites</TabsTrigger>
                <TabsTrigger value="events">Evenements</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="overview" className="mt-0 space-y-4">
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
              </TabsContent>

              <TabsContent value="events" className="mt-0 space-y-4">
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
                <Button variant="outline" className="w-full">
                  Voir tous les evenements
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
