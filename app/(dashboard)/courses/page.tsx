'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  BookMarked,
  FileText,
  Video,
  Link as LinkIcon,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Upload,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
const courses = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'Learn the fundamentals of calculus including limits, derivatives, and integrals.',
    subject: 'Mathematics',
    level: '3AS',
    teacher: { name: 'Mr. Hadj', avatar: 'MH' },
    resources: 12,
    students: 32,
    progress: 65,
    isPublished: true,
    createdAt: '2024-09-15',
  },
  {
    id: '2',
    title: 'Mechanics and Motion',
    description: 'Understanding Newton laws, kinematics, and dynamics.',
    subject: 'Physics',
    level: '2AS',
    teacher: { name: 'Mrs. Amrani', avatar: 'MA' },
    resources: 8,
    students: 28,
    progress: 45,
    isPublished: true,
    createdAt: '2024-09-20',
  },
  {
    id: '3',
    title: 'Organic Chemistry Basics',
    description: 'Introduction to organic compounds, reactions, and nomenclature.',
    subject: 'Chemistry',
    level: '3AS',
    teacher: { name: 'Mr. Benali', avatar: 'MB' },
    resources: 6,
    students: 30,
    progress: 30,
    isPublished: false,
    createdAt: '2024-10-01',
  },
  {
    id: '4',
    title: 'French Literature',
    description: 'Study of major French literary movements and authors.',
    subject: 'French',
    level: '3AS',
    teacher: { name: 'Mrs. Martin', avatar: 'MM' },
    resources: 15,
    students: 25,
    progress: 80,
    isPublished: true,
    createdAt: '2024-09-10',
  },
];

const resources = [
  { id: '1', title: 'Chapter 1: Limits', type: 'PDF', size: '2.5 MB', uploadedAt: 'Sep 15' },
  { id: '2', title: 'Video: Understanding Derivatives', type: 'VIDEO', duration: '15:30', uploadedAt: 'Sep 18' },
  { id: '3', title: 'Practice Problems Set 1', type: 'PDF', size: '1.2 MB', uploadedAt: 'Sep 20' },
  { id: '4', title: 'Interactive Graphing Tool', type: 'LINK', url: 'https://...', uploadedAt: 'Sep 22' },
];

export default function CoursesPage() {
  const { t } = useTranslation();
  const { can, isStudent } = usePermissions();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'published') return matchesSearch && course.isPublished;
    if (activeTab === 'draft') return matchesSearch && !course.isPublished;
    return matchesSearch;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'LINK':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('courses.title')}
        description={isStudent ? t('courses.studentDescription') : t('courses.teacherDescription')}
      >
        {can('courses.create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('courses.addCourse')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('courses.addCourse')}</DialogTitle>
                <DialogDescription>
                  {t('courses.createDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t('courses.courseTitle')}</Label>
                  <Input id="title" placeholder={t('courses.titlePlaceholder')} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('courses.description')}</Label>
                  <Textarea id="description" placeholder={t('courses.descriptionPlaceholder')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('courses.subject')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('courses.selectSubject')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('courses.level')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('courses.selectLevel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1AM">1AM</SelectItem>
                        <SelectItem value="2AM">2AM</SelectItem>
                        <SelectItem value="3AM">3AM</SelectItem>
                        <SelectItem value="4AM">4AM</SelectItem>
                        <SelectItem value="1AS">1AS</SelectItem>
                        <SelectItem value="2AS">2AS</SelectItem>
                        <SelectItem value="3AS">3AS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>{t('courses.publishImmediately')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('courses.publishDescription')}
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  {t('courses.createCourse')}
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
            placeholder={t('courses.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {!isStudent && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="published">{t('courses.published')}</TabsTrigger>
              <TabsTrigger value="draft">{t('courses.draft')}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
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
                      <Badge variant="outline">{course.subject}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    {!isStudent && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="mr-2 h-4 w-4" />
                            {t('courses.addResource')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{course.resources} {t('courses.resources')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                  {isStudent && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('courses.progress')}</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{course.teacher.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{course.teacher.name}</span>
                    </div>
                    {!course.isPublished && (
                      <Badge variant="secondary">{t('courses.draft')}</Badge>
                    )}
                    {course.isPublished && isStudent && course.progress === 100 && (
                      <Badge variant="default" className="bg-accent">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('courses.completed')}
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('courses.noCourses')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? t('courses.noSearchResults') : t('courses.createFirst')}
          </p>
        </div>
      )}
    </div>
  );
}
