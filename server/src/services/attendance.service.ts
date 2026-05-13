import { PrismaClient, Prisma, AttendanceStatus } from '@prisma/client';
import { PaginationParams, FilterParams } from '../utils/pagination.js';

const prisma = new PrismaClient();

export interface CreateAttendanceInput {
  studentId: string;
  classId: string;
  schoolYearId: string;
  date: Date;
  status: AttendanceStatus;
  justification?: string;
  notes?: string;
}

export interface UpdateAttendanceInput {
  status?: AttendanceStatus;
  justification?: string;
  notes?: string;
}

const attendanceInclude = {
  student: {
    select: {
      id: true,
      matricule: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  class: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const attendanceService = {
  async findAll(pagination: PaginationParams, filters: FilterParams) {
    const where: Prisma.AttendanceWhereInput = {};

    if (filters.studentId) {
      where.studentId = filters.studentId as string;
    }

    if (filters.classId) {
      where.classId = filters.classId as string;
    }

    if (filters.status) {
      where.status = filters.status as AttendanceStatus;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters.schoolYearId) {
      where.schoolYearId = filters.schoolYearId as string;
    } else {
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: attendanceInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { attendances, total };
  },

  async findById(id: string) {
    return prisma.attendance.findUnique({
      where: { id },
      include: attendanceInclude,
    });
  },

  async create(data: CreateAttendanceInput) {
    // Check for existing record
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        classId: data.classId,
        date: data.date,
      },
    });

    if (existing) {
      throw new Error('Enregistrement de présence déjà existant pour cette date');
    }

    return prisma.attendance.create({
      data,
      include: attendanceInclude,
    });
  },

  async createBatch(attendances: CreateAttendanceInput[]) {
    return prisma.$transaction(
      attendances.map((data) =>
        prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: data.studentId,
              classId: data.classId,
              date: data.date,
            },
          },
          create: data,
          update: {
            status: data.status,
            justification: data.justification,
            notes: data.notes,
          },
        })
      )
    );
  },

  async update(id: string, data: UpdateAttendanceInput) {
    return prisma.attendance.update({
      where: { id },
      data,
      include: attendanceInclude,
    });
  },

  async delete(id: string) {
    return prisma.attendance.delete({ where: { id } });
  },

  async getClassAttendance(classId: string, date: Date) {
    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        attendances: {
          where: {
            classId,
            date,
          },
        },
      },
      orderBy: { user: { lastName: 'asc' } },
    });

    return students.map((student) => ({
      studentId: student.id,
      matricule: student.matricule,
      name: `${student.user.lastName} ${student.user.firstName}`,
      status: student.attendances[0]?.status || null,
      justification: student.attendances[0]?.justification || null,
      attendanceId: student.attendances[0]?.id || null,
    }));
  },

  async getStudentStats(studentId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.AttendanceWhereInput = { studentId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const attendances = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const stats = attendances.reduce(
      (acc, a) => {
        acc[a.status] = a._count;
        return acc;
      },
      {} as Record<AttendanceStatus, number>
    );

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const present = (stats.PRESENT || 0) + (stats.LATE || 0);

    return {
      total,
      present: stats.PRESENT || 0,
      absent: stats.ABSENT || 0,
      late: stats.LATE || 0,
      excused: stats.EXCUSED || 0,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },

  async getClassStats(classId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.AttendanceWhereInput = { classId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [total, byStatus] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    const stats = byStatus.reduce(
      (acc, a) => {
        acc[a.status] = a._count;
        return acc;
      },
      {} as Record<AttendanceStatus, number>
    );

    const present = (stats.PRESENT || 0) + (stats.LATE || 0);

    return {
      total,
      present: stats.PRESENT || 0,
      absent: stats.ABSENT || 0,
      late: stats.LATE || 0,
      excused: stats.EXCUSED || 0,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },

  async getGlobalStats() {
    const currentYear = await prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      return { total: 0, attendanceRate: 0, byStatus: {} };
    }

    const [total, byStatus] = await Promise.all([
      prisma.attendance.count({ where: { schoolYearId: currentYear.id } }),
      prisma.attendance.groupBy({
        by: ['status'],
        where: { schoolYearId: currentYear.id },
        _count: true,
      }),
    ]);

    const stats = byStatus.reduce(
      (acc, a) => {
        acc[a.status] = a._count;
        return acc;
      },
      {} as Record<AttendanceStatus, number>
    );

    const present = (stats.PRESENT || 0) + (stats.LATE || 0);

    return {
      total,
      byStatus: stats,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
};
