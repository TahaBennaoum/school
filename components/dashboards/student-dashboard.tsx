'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  XCircle,
  BookMarked,
  FileQuestion,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/shared/stats-card';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Link from 'next/link';

// Mock data for student
const studentInfo = {
  class: '3AS-Math',
  overallAverage: 15.8,
  rank: 5,
  totalStudents: 32,
  attendanceRate: 96,
};

const subjectAverages = [
  { subject: 'Math', average: 17.5, fullMark: 20 },
  { subject: 'Physics', average: 16.2, fullMark: 20 },
  { subject: 'Chemistry', average: 14.8, fullMark: 20 },
  { subject: 'French', average: 15.0, fullMark: 20 },
  { subject: 'English', average: 16.5, fullMark: 20 },
  { subject: 'Arabic', average: 14.2, fullMark: 20 },
];

const gradeEvolution = [
  { term: 'T1', average: 14.5 },
  { term: 'T2', average: 15.2 },
  { term: 'T3', average: 15.8 },
];

const todayClasses = [
  { id: 1, time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Hadj', room: 'Room 12', status: 'completed' },
  { id: 2, time: '09:00 - 10:00', subject: 'Physics', teacher: 'Mrs. Amrani', room: 'Lab 3', status: 'current' },
  { id: 3, time: '10:30 - 11:30', subject: 'French', teacher: 'Mrs. Benali', room: 'Room 8', status: 'upcoming' },
  { id: 4, time: '14:00 - 15:00', subject: 'English', teacher: 'Mr. Smith', room: 'Room 5', status: 'upcoming' },
];

const upcomingExams = [
  { id: 1, subject: 'Mathematics', date: 'Nov 20', type: 'Exam', chapter: 'Functions' },
  { id: 2, subject: 'Physics', date: 'Nov 22', type: 'Quiz', chapter: 'Mechanics' },
  { id: 3, subject: 'Chemistry', date: 'Nov 25', type: 'Exam', chapter: 'Organic Chemistry' },
];

const pendingAssignments = [
  { id: 1, subject: 'Mathematics', title: 'Exercise Set 5', deadline: '2 days left', submitted: false },
  { id: 2, subject: 'Physics', title: 'Lab Report', deadline: '5 days left', submitted: false },
  { id: 3, subject: 'French', title: 'Essay', deadline: 'Submitted', submitted: true },
];

const recentGrades = [
  { id: 1, subject: 'Mathematics', type: 'Quiz', grade: 18, maxGrade: 20, date: 'Nov 10' },
  { id: 2, subject: 'Physics', type: 'Exam', grade: 16.5, maxGrade: 20, date: 'Nov 8' },
  { id: 3, subject: 'French', type: 'Assignment', grade: 15, maxGrade: 20, date: 'Nov 5' },
];

export function StudentDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.overallAverage')}
          value={`${studentInfo.overallAverage}/20`}
          description={`${t('dashboard.rank')} ${studentInfo.rank}/${studentInfo.totalStudents}`}
          icon={TrendingUp}
          trend={{ value: 0.6, isPositive: true }}
        />
        <StatsCard
          title={t('dashboard.attendanceRate')}
          value={`${studentInfo.attendanceRate}%`}
          description={t('dashboard.thisYear')}
          icon={CheckCircle}
        />
        <StatsCard
          title={t('dashboard.upcomingExams')}
          value={upcomingExams.length.toString()}
          description={t('dashboard.thisMonth')}
          icon={FileText}
        />
        <StatsCard
          title={t('dashboard.pendingAssignments')}
          value={pendingAssignments.filter(a => !a.submitted).length.toString()}
          description={t('dashboard.toSubmit')}
          icon={Target}
        />
      </div>

      {/* Today's Schedule and Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.todaySchedule')}</CardTitle>
                <CardDescription>{studentInfo.class}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/schedule">{t('dashboard.fullSchedule')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    cls.status === 'current' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cls.subject}</p>
                      {cls.status === 'current' && (
                        <Badge variant="default" className="text-xs">{t('dashboard.now')}</Badge>
                      )}
                      {cls.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">{t('dashboard.completed')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cls.time} - {cls.room} - {cls.teacher}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/courses">
                <BookMarked className="h-4 w-4" />
                {t('dashboard.viewCourses')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/quizzes">
                <FileQuestion className="h-4 w-4" />
                {t('dashboard.takeQuiz')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/grades">
                <FileText className="h-4 w-4" />
                {t('dashboard.viewGrades')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/messages">
                <MessageSquare className="h-4 w-4" />
                {t('dashboard.messages')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
                {t('dashboard.notifications')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Subject Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.subjectPerformance')}</CardTitle>
            <CardDescription>{t('dashboard.averageBySubject')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} />
                  <Radar
                    name={t('dashboard.average')}
                    dataKey="average"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grade Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.gradeEvolution')}</CardTitle>
            <CardDescription>{t('dashboard.progressOverTerms')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gradeEvolution}>
                  <defs>
                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="term" className="text-xs" />
                  <YAxis domain={[0, 20]} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGrade)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams, Assignments, Recent Grades */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.upcomingExams')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-bold">{exam.date.split(' ')[0]}</span>
                    <span className="text-[10px]">{exam.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{exam.subject}</p>
                    <p className="text-xs text-muted-foreground">{exam.chapter}</p>
                  </div>
                  <Badge variant={exam.type === 'Exam' ? 'default' : 'secondary'}>
                    {exam.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.assignments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {assignment.submitted ? (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                  </div>
                  <Badge variant={assignment.submitted ? 'secondary' : 'outline'}>
                    {assignment.deadline}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.recentGrades')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/grades">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center gap-3 rounded-lg border p-3">
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
                  <span className="text-sm text-muted-foreground">/{grade.maxGrade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
