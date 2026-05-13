// Enums
export type Role = 'ADMIN' | 'DIRECTOR' | 'TEACHER' | 'STUDENT' | 'PARENT';
export type Gender = 'MALE' | 'FEMALE';
export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'WITHDRAWN';
export type Level = 'AM1' | 'AM2' | 'AM3' | 'AM4' | 'AS1' | 'AS2' | 'AS3';
export type RoomType = 'CLASSROOM' | 'LAB' | 'LIBRARY' | 'GYM' | 'AUDITORIUM' | 'COMPUTER_LAB';
export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'SATURDAY';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type GradeType = 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PROJECT' | 'COMPOSITION';
export type PaymentType = 'REGISTRATION' | 'TUITION' | 'TRANSPORT' | 'CANTEEN' | 'UNIFORM' | 'BOOKS' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type NotificationType = 'ABSENCE' | 'GRADE' | 'PAYMENT' | 'SCHEDULE' | 'GENERAL';

// Base types
export interface User {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'avatar' | 'isActive' | 'createdAt'>;
  matricule: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  bloodType?: string;
  medicalNotes?: string;
  classId?: string;
  class?: Pick<Class, 'id' | 'name' | 'level'>;
  parentId?: string;
  parent?: {
    id: string;
    user: Pick<User, 'firstName' | 'lastName' | 'phone' | 'email'>;
  };
  enrollmentDate: string;
  status: StudentStatus;
}

export interface Teacher {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phone' | 'avatar' | 'isActive' | 'createdAt'>;
  employeeId: string;
  degree?: string;
  specialization?: string;
  salary?: number;
  hireDate: string;
  contractType?: string;
  subjects: Array<{
    id: string;
    subject: Pick<Subject, 'id' | 'name' | 'code'>;
  }>;
  classes: Pick<Class, 'id' | 'name' | 'level'>[];
}

export interface Parent {
  id: string;
  userId: string;
  user: User;
  occupation?: string;
  workplace?: string;
  children: Student[];
}

export interface Class {
  id: string;
  name: string;
  level: Level;
  section?: string;
  maxStudents: number;
  schoolYearId: string;
  schoolYear: Pick<SchoolYear, 'id' | 'name' | 'isCurrent'>;
  mainTeacherId?: string;
  mainTeacher?: {
    id: string;
    user: Pick<User, 'firstName' | 'lastName'>;
  };
  roomId?: string;
  room?: Pick<Room, 'id' | 'name' | 'capacity'>;
  createdAt: string;
  _count: {
    students: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  coefficient: number;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  building?: string;
  floor?: number;
  equipment?: string;
}

export interface Schedule {
  id: string;
  classId: string;
  class: Pick<Class, 'id' | 'name'>;
  subjectId: string;
  subject: Pick<Subject, 'id' | 'name' | 'code' | 'color'>;
  teacherId: string;
  teacher: {
    user: Pick<User, 'firstName' | 'lastName'>;
  };
  roomId: string;
  room: Pick<Room, 'id' | 'name'>;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  student: {
    id: string;
    matricule: string;
    user: Pick<User, 'firstName' | 'lastName'>;
  };
  classId: string;
  class: Pick<Class, 'id' | 'name'>;
  schoolYearId: string;
  date: string;
  status: AttendanceStatus;
  justification?: string;
  notes?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  student: {
    id: string;
    matricule: string;
    user: Pick<User, 'firstName' | 'lastName'>;
  };
  classId: string;
  class: Pick<Class, 'id' | 'name'>;
  subjectId: string;
  subject: Pick<Subject, 'id' | 'name' | 'code' | 'coefficient'>;
  schoolYearId: string;
  type: GradeType;
  value: number;
  maxValue: number;
  coefficient: number;
  term: number;
  description?: string;
  comment?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  student: {
    id: string;
    user: Pick<User, 'firstName' | 'lastName'>;
  };
  schoolYearId: string;
  type: PaymentType;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  method?: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  students: {
    total: number;
    active: number;
  };
  teachers: {
    total: number;
  };
  classes: {
    total: number;
  };
  payments: {
    totalRevenue: number;
    pendingCount: number;
  };
  attendance: {
    rate: number;
    total: number;
    present: number;
    absent: number;
  };
}

export interface Activity {
  id: string;
  type: 'student' | 'grade' | 'payment' | 'attendance';
  title: string;
  description: string;
  timestamp: string;
}

export interface MonthlyRevenue {
  month: number;
  revenue: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
}

export interface GradeDistribution {
  distribution: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
    failing: number;
  };
  total: number;
}

// Form types
export interface StudentFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  classId?: string;
  parentId?: string;
}

export interface TeacherFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  degree?: string;
  specialization?: string;
  salary?: number;
  contractType?: string;
  subjectIds?: string[];
}

export interface ClassFormData {
  name: string;
  level: Level;
  section?: string;
  maxStudents?: number;
  schoolYearId: string;
  mainTeacherId?: string;
  roomId?: string;
}

export interface GradeFormData {
  studentId: string;
  classId: string;
  subjectId: string;
  schoolYearId: string;
  type: GradeType;
  value: number;
  maxValue?: number;
  coefficient?: number;
  term: number;
  description?: string;
  comment?: string;
}

export interface AttendanceFormData {
  studentId: string;
  classId: string;
  schoolYearId: string;
  date: string;
  status: AttendanceStatus;
  justification?: string;
  notes?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface StudentFilters {
  search?: string;
  status?: StudentStatus;
  classId?: string;
  level?: Level;
}

export interface GradeFilters {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  term?: number;
  type?: GradeType;
  schoolYearId?: string;
}

export interface AttendanceFilters {
  studentId?: string;
  classId?: string;
  status?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
  schoolYearId?: string;
}
