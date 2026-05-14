'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
  BookOpen,
  ClipboardList,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookMarked,
  FileQuestion,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatsCard } from '@/components/shared/stats-card';
import Link from 'next/link';

// Mock data for teacher
const teacherClasses = [
  { id: 1, name: '3AS-Math', students: 32, subject: 'Mathematics', nextSession: 'Today 10:00' },
  { id: 2, name: '2AS-Science', students: 28, subject: 'Mathematics', nextSession: 'Today 14:00' },
  { id: 3, name: '1AS-A', students: 35, subject: 'Mathematics', nextSession: 'Tomorrow 08:00' },
  { id: 4, name: '3AM-B', students: 30, subject: 'Mathematics', nextSession: 'Tomorrow 10:00' },
];

const todaySchedule = [
  { id: 1, time: '08:00 - 09:00', class: '3AS-Math', room: 'Room 12', status: 'completed' },
  { id: 2, time: '09:00 - 10:00', class: '3AS-Math', room: 'Room 12', status: 'completed' },
  { id: 3, time: '10:00 - 11:00', class: '2AS-Science', room: 'Room 8', status: 'current' },
  { id: 4, time: '14:00 - 15:00', class: '1AS-A', room: 'Room 15', status: 'upcoming' },
  { id: 5, time: '15:00 - 16:00', class: '1AS-A', room: 'Room 15', status: 'upcoming' },
];

const pendingTasks = [
  { id: 1, title: 'Grade Term 1 Exams', class: '3AS-Math', deadline: '2 days left', progress: 65 },
  { id: 2, title: 'Prepare Quiz', class: '2AS-Science', deadline: '5 days left', progress: 20 },
  { id: 3, title: 'Submit Attendance', class: '1AS-A', deadline: 'Today', progress: 0 },
];

const recentStudentPerformance = [
  { id: 1, name: 'Ahmed Benali', class: '3AS-Math', average: 17.5, trend: 'up' },
  { id: 2, name: 'Sara Meziane', class: '3AS-Math', average: 16.8, trend: 'up' },
  { id: 3, name: 'Karim Hadj', class: '2AS-Science', average: 14.2, trend: 'down' },
  { id: 4, name: 'Lina Amrani', class: '1AS-A', average: 15.5, trend: 'stable' },
];

export function TeacherDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.myClasses')}
          value="4"
          description={t('dashboard.assignedClasses')}
          icon={BookOpen}
        />
        <StatsCard
          title={t('dashboard.totalStudents')}
          value="125"
          description={t('dashboard.acrossAllClasses')}
          icon={Users}
        />
        <StatsCard
          title={t('dashboard.sessionsToday')}
          value="5"
          description={t('dashboard.hoursTeaching')}
          icon={Clock}
        />
        <StatsCard
          title={t('dashboard.pendingGrades')}
          value="48"
          description={t('dashboard.awaitingInput')}
          icon={FileText}
          trend={{ value: 12, isPositive: false }}
        />
      </div>

      {/* Today's Schedule and Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.todaySchedule')}</CardTitle>
                <CardDescription>{t('dashboard.yourClassesToday')}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/schedule">{t('dashboard.fullSchedule')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 rounded-lg border p-3 ${
                    session.status === 'current' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.class}</p>
                      {session.status === 'current' && (
                        <Badge variant="default" className="text-xs">{t('dashboard.inProgress')}</Badge>
                      )}
                      {session.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">{t('dashboard.completed')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{session.time} - {session.room}</p>
                  </div>
                  {session.status === 'current' && (
                    <Button size="sm">{t('dashboard.takeAttendance')}</Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.pendingTasks')}</CardTitle>
                <CardDescription>{t('dashboard.tasksToComplete')}</CardDescription>
              </div>
              <Badge variant="outline">{pendingTasks.length} {t('dashboard.pending')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.progress === 0 ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <Badge variant={task.deadline === 'Today' ? 'destructive' : 'secondary'}>
                      {task.deadline}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{task.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.class}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/attendance">
            <ClipboardList className="h-6 w-6" />
            <span>{t('dashboard.takeAttendance')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/grades">
            <FileText className="h-6 w-6" />
            <span>{t('dashboard.enterGrades')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/courses">
            <BookMarked className="h-6 w-6" />
            <span>{t('dashboard.manageCourses')}</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
          <Link href="/quizzes">
            <FileQuestion className="h-6 w-6" />
            <span>{t('dashboard.createQuiz')}</span>
          </Link>
        </Button>
      </div>

      {/* My Classes and Student Performance */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.myClasses')}</CardTitle>
            <CardDescription>{t('dashboard.classesAssigned')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/classes/${cls.id}`}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {cls.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.students} {t('dashboard.students')} - {cls.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{t('dashboard.nextSession')}</p>
                    <p className="text-xs text-muted-foreground">{cls.nextSession}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.studentPerformance')}</CardTitle>
                <CardDescription>{t('dashboard.topPerformers')}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/grades">{t('common.viewAll')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudentPerformance.map((student) => (
                <div key={student.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.class}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{student.average}/20</span>
                    {student.trend === 'up' && <TrendingUp className="h-4 w-4 text-accent" />}
                    {student.trend === 'down' && <TrendingUp className="h-4 w-4 text-destructive rotate-180" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
