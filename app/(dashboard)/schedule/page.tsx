'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  AlertTriangle,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

// Time slots
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];

// Mock schedule data
const scheduleData = [
  { id: '1', day: 'sunday', startTime: '08:00', endTime: '09:00', subject: 'Mathematics', teacher: 'Mr. Hadj', room: 'Room 12', class: '3AS-Math', color: 'bg-blue-500' },
  { id: '2', day: 'sunday', startTime: '09:00', endTime: '10:00', subject: 'Mathematics', teacher: 'Mr. Hadj', room: 'Room 12', class: '3AS-Math', color: 'bg-blue-500' },
  { id: '3', day: 'sunday', startTime: '10:00', endTime: '11:00', subject: 'Physics', teacher: 'Mrs. Amrani', room: 'Lab 3', class: '3AS-Math', color: 'bg-purple-500' },
  { id: '4', day: 'sunday', startTime: '14:00', endTime: '15:00', subject: 'French', teacher: 'Mrs. Martin', room: 'Room 8', class: '3AS-Math', color: 'bg-pink-500' },
  { id: '5', day: 'monday', startTime: '08:00', endTime: '09:00', subject: 'Chemistry', teacher: 'Mr. Benali', room: 'Lab 1', class: '3AS-Math', color: 'bg-green-500' },
  { id: '6', day: 'monday', startTime: '09:00', endTime: '10:00', subject: 'Chemistry', teacher: 'Mr. Benali', room: 'Lab 1', class: '3AS-Math', color: 'bg-green-500' },
  { id: '7', day: 'monday', startTime: '10:00', endTime: '11:00', subject: 'English', teacher: 'Mr. Smith', room: 'Room 5', class: '3AS-Math', color: 'bg-orange-500' },
  { id: '8', day: 'monday', startTime: '14:00', endTime: '16:00', subject: 'Arabic', teacher: 'Mr. Khalil', room: 'Room 10', class: '3AS-Math', color: 'bg-teal-500' },
  { id: '9', day: 'tuesday', startTime: '08:00', endTime: '10:00', subject: 'Mathematics', teacher: 'Mr. Hadj', room: 'Room 12', class: '3AS-Math', color: 'bg-blue-500' },
  { id: '10', day: 'tuesday', startTime: '10:00', endTime: '11:00', subject: 'History', teacher: 'Mrs. Larbi', room: 'Room 15', class: '3AS-Math', color: 'bg-amber-500' },
  { id: '11', day: 'wednesday', startTime: '08:00', endTime: '09:00', subject: 'Physics', teacher: 'Mrs. Amrani', room: 'Lab 3', class: '3AS-Math', color: 'bg-purple-500' },
  { id: '12', day: 'wednesday', startTime: '09:00', endTime: '11:00', subject: 'Philosophy', teacher: 'Mr. Ahmed', room: 'Room 7', class: '3AS-Math', color: 'bg-indigo-500' },
  { id: '13', day: 'thursday', startTime: '08:00', endTime: '10:00', subject: 'French', teacher: 'Mrs. Martin', room: 'Room 8', class: '3AS-Math', color: 'bg-pink-500' },
  { id: '14', day: 'thursday', startTime: '10:00', endTime: '11:00', subject: 'English', teacher: 'Mr. Smith', room: 'Room 5', class: '3AS-Math', color: 'bg-orange-500' },
  { id: '15', day: 'saturday', startTime: '08:00', endTime: '10:00', subject: 'Mathematics', teacher: 'Mr. Hadj', room: 'Room 12', class: '3AS-Math', color: 'bg-blue-500' },
];

const classes = ['3AS-Math', '3AS-Science', '2AS-Math', '2AS-Science', '1AS-A', '1AS-B', '4AM-A', '4AM-B'];
const teachers = ['Mr. Hadj', 'Mrs. Amrani', 'Mr. Benali', 'Mrs. Martin', 'Mr. Smith', 'Mr. Khalil'];
const rooms = ['Room 5', 'Room 7', 'Room 8', 'Room 10', 'Room 12', 'Room 15', 'Lab 1', 'Lab 3'];
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'French', 'English', 'Arabic', 'History', 'Philosophy'];

interface Conflict {
  type: 'teacher' | 'room' | 'class';
  message: string;
  slots: string[];
}

export default function SchedulePage() {
  const { t } = useTranslation();
  const { can, isStudent, isStaff } = usePermissions();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('3AS-Math');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'room'>('class');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // New slot form state
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: '',
    room: '',
    class: selectedClass,
  });

  const getSlotPosition = (startTime: string) => {
    const index = timeSlots.indexOf(startTime);
    return index >= 0 ? index : 0;
  };

  const getSlotDuration = (startTime: string, endTime: string) => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    return endIndex - startIndex;
  };

  const checkConflicts = () => {
    const newConflicts: Conflict[] = [];
    
    // Check for teacher conflicts
    const teacherSlots = scheduleData.filter(s => s.teacher === newSlot.teacher && s.day === newSlot.day);
    const overlapping = teacherSlots.some(s => {
      const slotStart = timeSlots.indexOf(s.startTime);
      const slotEnd = timeSlots.indexOf(s.endTime);
      const newStart = timeSlots.indexOf(newSlot.startTime);
      const newEnd = timeSlots.indexOf(newSlot.endTime);
      return (newStart < slotEnd && newEnd > slotStart);
    });
    
    if (overlapping) {
      newConflicts.push({
        type: 'teacher',
        message: t('schedule.teacherConflict'),
        slots: teacherSlots.map(s => s.id),
      });
    }

    // Check for room conflicts
    const roomSlots = scheduleData.filter(s => s.room === newSlot.room && s.day === newSlot.day);
    const roomOverlapping = roomSlots.some(s => {
      const slotStart = timeSlots.indexOf(s.startTime);
      const slotEnd = timeSlots.indexOf(s.endTime);
      const newStart = timeSlots.indexOf(newSlot.startTime);
      const newEnd = timeSlots.indexOf(newSlot.endTime);
      return (newStart < slotEnd && newEnd > slotStart);
    });

    if (roomOverlapping) {
      newConflicts.push({
        type: 'room',
        message: t('schedule.roomConflict'),
        slots: roomSlots.map(s => s.id),
      });
    }

    setConflicts(newConflicts);
  };

  const filteredSchedule = scheduleData.filter(slot => {
    if (viewMode === 'class') return slot.class === selectedClass;
    if (viewMode === 'teacher') return slot.teacher === selectedTeacher;
    return true;
  });

  const renderSlot = (slot: typeof scheduleData[0]) => (
    <motion.div
      key={slot.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "absolute inset-x-1 rounded-lg p-2 text-white text-xs overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/50 transition-all",
        slot.color
      )}
      style={{
        top: `${getSlotPosition(slot.startTime) * 60 + 4}px`,
        height: `${getSlotDuration(slot.startTime, slot.endTime) * 60 - 8}px`,
      }}
    >
      <div className="font-medium truncate">{slot.subject}</div>
      <div className="truncate opacity-90">{slot.teacher}</div>
      <div className="flex items-center gap-1 opacity-80 mt-1">
        <MapPin className="h-3 w-3" />
        <span className="truncate">{slot.room}</span>
      </div>
      <div className="opacity-80">
        {slot.startTime} - {slot.endTime}
      </div>
      {can('schedule.update') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 text-white hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('schedule.title')}
        description={isStudent ? t('schedule.studentDescription') : t('schedule.adminDescription')}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          {can('schedule.create') && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('schedule.addSlot')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t('schedule.addSlot')}</DialogTitle>
                  <DialogDescription>
                    {t('schedule.addSlotDescription')}
                  </DialogDescription>
                </DialogHeader>
                
                {conflicts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('schedule.conflictDetected')}</AlertTitle>
                    <AlertDescription>
                      {conflicts.map((c, i) => (
                        <p key={i}>{c.message}</p>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('schedule.dayOfWeek')}</Label>
                      <Select value={newSlot.day} onValueChange={(v) => setNewSlot({...newSlot, day: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('schedule.selectDay')} />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>{t(`schedule.${day}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('schedule.class')}</Label>
                      <Select value={newSlot.class} onValueChange={(v) => setNewSlot({...newSlot, class: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('schedule.selectClass')} />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t('schedule.startTime')}</Label>
                      <Select value={newSlot.startTime} onValueChange={(v) => setNewSlot({...newSlot, startTime: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="08:00" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('schedule.endTime')}</Label>
                      <Select value={newSlot.endTime} onValueChange={(v) => setNewSlot({...newSlot, endTime: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="09:00" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('schedule.subject')}</Label>
                    <Select value={newSlot.subject} onValueChange={(v) => setNewSlot({...newSlot, subject: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('schedule.selectSubject')} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('schedule.teacher')}</Label>
                    <Select 
                      value={newSlot.teacher} 
                      onValueChange={(v) => {
                        setNewSlot({...newSlot, teacher: v});
                        setTimeout(checkConflicts, 100);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schedule.selectTeacher')} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('schedule.room')}</Label>
                    <Select 
                      value={newSlot.room} 
                      onValueChange={(v) => {
                        setNewSlot({...newSlot, room: v});
                        setTimeout(checkConflicts, 100);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schedule.selectRoom')} />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room} value={room}>{room}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)} disabled={conflicts.length > 0}>
                    {t('schedule.addSlot')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList>
                <TabsTrigger value="class" className="gap-2">
                  <Users className="h-4 w-4" />
                  {t('schedule.byClass')}
                </TabsTrigger>
                {isStaff && (
                  <TabsTrigger value="teacher" className="gap-2">
                    <User className="h-4 w-4" />
                    {t('schedule.byTeacher')}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              {viewMode === 'class' && (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('schedule.selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {viewMode === 'teacher' && (
                <Select value={selectedTeacher || ''} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('schedule.selectTeacher')} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-7 border-b">
                <div className="p-4 text-center font-medium text-muted-foreground border-r">
                  {t('schedule.time')}
                </div>
                {days.map((day) => (
                  <div key={day} className="p-4 text-center font-medium border-r last:border-r-0">
                    {t(`schedule.${day}`)}
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-7">
                {/* Time Column */}
                <div className="border-r">
                  {timeSlots.map((time) => (
                    <div key={time} className="h-[60px] p-2 text-sm text-muted-foreground border-b">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {days.map((day) => (
                  <div key={day} className="relative border-r last:border-r-0">
                    {timeSlots.map((time) => (
                      <div key={time} className="h-[60px] border-b border-dashed" />
                    ))}
                    {/* Render slots for this day */}
                    {filteredSchedule
                      .filter((slot) => slot.day === day)
                      .map(renderSlot)}
                  </div>
                ))}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('schedule.legend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { subject: 'Mathematics', color: 'bg-blue-500' },
              { subject: 'Physics', color: 'bg-purple-500' },
              { subject: 'Chemistry', color: 'bg-green-500' },
              { subject: 'French', color: 'bg-pink-500' },
              { subject: 'English', color: 'bg-orange-500' },
              { subject: 'Arabic', color: 'bg-teal-500' },
              { subject: 'History', color: 'bg-amber-500' },
              { subject: 'Philosophy', color: 'bg-indigo-500' },
            ].map((item) => (
              <div key={item.subject} className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded", item.color)} />
                <span className="text-sm">{item.subject}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
