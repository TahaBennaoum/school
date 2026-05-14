'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FileQuestion,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth-store';

// Mock data
const quizzes = [
  {
    id: '1',
    title: 'Calculus Midterm Exam',
    description: 'Comprehensive exam covering limits, derivatives, and basic integrals.',
    subject: 'Mathematics',
    course: 'Introduction to Calculus',
    duration: 90,
    questions: 25,
    maxAttempts: 1,
    passingScore: 60,
    startDate: '2024-11-20',
    endDate: '2024-11-20',
    isPublished: true,
    attempts: 28,
    avgScore: 72,
    status: 'active',
  },
  {
    id: '2',
    title: 'Physics Quiz: Kinematics',
    description: 'Quick assessment on motion, velocity, and acceleration concepts.',
    subject: 'Physics',
    course: 'Mechanics and Motion',
    duration: 30,
    questions: 15,
    maxAttempts: 2,
    passingScore: 50,
    startDate: '2024-11-15',
    endDate: '2024-11-22',
    isPublished: true,
    attempts: 45,
    avgScore: 68,
    status: 'active',
  },
  {
    id: '3',
    title: 'Organic Chemistry Practice',
    description: 'Practice quiz on organic compound naming and structures.',
    subject: 'Chemistry',
    course: 'Organic Chemistry Basics',
    duration: 45,
    questions: 20,
    maxAttempts: 3,
    passingScore: 70,
    startDate: '2024-11-25',
    endDate: '2024-11-30',
    isPublished: false,
    attempts: 0,
    avgScore: 0,
    status: 'draft',
  },
  {
    id: '4',
    title: 'French Literature Quiz',
    description: 'Test your knowledge of 19th century French literary movements.',
    subject: 'French',
    course: 'French Literature',
    duration: 60,
    questions: 30,
    maxAttempts: 1,
    passingScore: 55,
    startDate: '2024-11-10',
    endDate: '2024-11-10',
    isPublished: true,
    attempts: 24,
    avgScore: 75,
    status: 'completed',
  },
];

const studentQuizzes = [
  {
    id: '1',
    title: 'Calculus Midterm Exam',
    subject: 'Mathematics',
    duration: 90,
    questions: 25,
    dueDate: '2024-11-20',
    status: 'pending',
    attemptsLeft: 1,
  },
  {
    id: '2',
    title: 'Physics Quiz: Kinematics',
    subject: 'Physics',
    duration: 30,
    questions: 15,
    dueDate: '2024-11-22',
    status: 'completed',
    score: 85,
    passed: true,
    attemptsLeft: 1,
  },
  {
    id: '4',
    title: 'French Literature Quiz',
    subject: 'French',
    duration: 60,
    questions: 30,
    dueDate: '2024-11-10',
    status: 'missed',
    attemptsLeft: 0,
  },
];

export default function QuizzesPage() {
  const { t } = useTranslation();
  const { can, isStudent } = usePermissions();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const getStatusBadge = (status: string, passed?: boolean) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{t('quizzes.active')}</Badge>;
      case 'completed':
        return passed !== undefined ? (
          passed ? (
            <Badge variant="default" className="bg-accent">
              <CheckCircle className="mr-1 h-3 w-3" />
              {t('quizzes.passed')}
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              {t('quizzes.failed')}
            </Badge>
          )
        ) : (
          <Badge variant="secondary">{t('quizzes.completed')}</Badge>
        );
      case 'draft':
        return <Badge variant="outline">{t('quizzes.draft')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('quizzes.pending')}</Badge>;
      case 'missed':
        return <Badge variant="destructive">{t('quizzes.missed')}</Badge>;
      default:
        return null;
    }
  };

  // Teacher View
  if (!isStudent) {
    const filteredQuizzes = quizzes.filter((quiz) => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'active') return matchesSearch && quiz.status === 'active';
      if (activeTab === 'draft') return matchesSearch && quiz.status === 'draft';
      if (activeTab === 'completed') return matchesSearch && quiz.status === 'completed';
      return matchesSearch;
    });

    return (
      <div className="space-y-6">
        <PageHeader
          title={t('quizzes.title')}
          description={t('quizzes.teacherDescription')}
        >
          {can('quizzes.create') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('quizzes.addQuiz')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{t('quizzes.addQuiz')}</DialogTitle>
                  <DialogDescription>
                    {t('quizzes.createDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">{t('quizzes.quizTitle')}</Label>
                    <Input id="title" placeholder={t('quizzes.titlePlaceholder')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">{t('common.description')}</Label>
                    <Textarea id="description" placeholder={t('quizzes.descriptionPlaceholder')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('quizzes.duration')}</Label>
                      <Input type="number" placeholder="60" />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('quizzes.maxAttempts')}</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('quizzes.startDate')}</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('quizzes.endDate')}</Label>
                      <Input type="datetime-local" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('quizzes.passingScore')} (%)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    {t('quizzes.createAndAddQuestions')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('quizzes.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="active">{t('quizzes.active')}</TabsTrigger>
              <TabsTrigger value="draft">{t('quizzes.draft')}</TabsTrigger>
              <TabsTrigger value="completed">{t('quizzes.completed')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quiz Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{quiz.subject}</Badge>
                        {getStatusBadge(quiz.status)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('quizzes.preview')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            {t('quizzes.viewResults')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileQuestion className="h-4 w-4" />
                        <span>{quiz.questions} {t('quizzes.questions')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{quiz.attempts} {t('quizzes.attempts')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>{quiz.avgScore > 0 ? `${quiz.avgScore}%` : '-'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{quiz.startDate}</span>
                      </div>
                      <span>{t('quizzes.passingScore')}: {quiz.passingScore}%</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('quizzes.noQuizzes')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? t('quizzes.noSearchResults') : t('quizzes.createFirst')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Student View
  const filteredStudentQuizzes = studentQuizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && quiz.status === 'pending';
    if (activeTab === 'completed') return matchesSearch && quiz.status === 'completed';
    if (activeTab === 'missed') return matchesSearch && quiz.status === 'missed';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('quizzes.title')}
        description={t('quizzes.studentDescription')}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('quizzes.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('quizzes.pending')}</TabsTrigger>
            <TabsTrigger value="completed">{t('quizzes.completed')}</TabsTrigger>
            <TabsTrigger value="missed">{t('quizzes.missed')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Quiz List for Students */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredStudentQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        quiz.status === 'pending' ? 'bg-primary/10 text-primary' :
                        quiz.status === 'completed' ? (quiz.passed ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive') :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <FileQuestion className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{quiz.title}</h3>
                          {getStatusBadge(quiz.status, quiz.passed)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{quiz.subject}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileQuestion className="h-4 w-4" />
                            <span>{quiz.questions} {t('quizzes.questions')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{quiz.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{quiz.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {quiz.status === 'completed' && quiz.score !== undefined && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">{quiz.score}%</p>
                          <p className="text-xs text-muted-foreground">{t('quizzes.yourScore')}</p>
                        </div>
                      )}
                      {quiz.status === 'pending' && (
                        <Button>
                          <Play className="mr-2 h-4 w-4" />
                          {t('quizzes.startQuiz')}
                        </Button>
                      )}
                      {quiz.status === 'completed' && (
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          {t('quizzes.viewResults')}
                        </Button>
                      )}
                      {quiz.status === 'missed' && (
                        <Button variant="outline" disabled>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          {t('quizzes.expired')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredStudentQuizzes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('quizzes.noQuizzes')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('quizzes.noQuizzesAvailable')}
          </p>
        </div>
      )}
    </div>
  );
}
