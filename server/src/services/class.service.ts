import { PrismaClient, Prisma, Level } from '@prisma/client';
import { PaginationParams, FilterParams } from '../utils/pagination.js';

const prisma = new PrismaClient();

export interface CreateClassInput {
  name: string;
  level: Level;
  section?: string;
  maxStudents?: number;
  schoolYearId: string;
  mainTeacherId?: string;
  roomId?: string;
}

export interface UpdateClassInput {
  name?: string;
  level?: Level;
  section?: string;
  maxStudents?: number;
  mainTeacherId?: string | null;
  roomId?: string | null;
}

const classInclude = {
  mainTeacher: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  room: {
    select: {
      id: true,
      name: true,
      capacity: true,
    },
  },
  schoolYear: {
    select: {
      id: true,
      name: true,
      isCurrent: true,
    },
  },
  _count: {
    select: {
      students: true,
    },
  },
};

export const classService = {
  async findAll(pagination: PaginationParams, filters: FilterParams) {
    const where: Prisma.ClassWhereInput = {};

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.level) {
      where.level = filters.level as Level;
    }

    if (filters.schoolYearId) {
      where.schoolYearId = filters.schoolYearId as string;
    } else {
      // Default to current school year
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: classInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: pagination.sortOrder },
      }),
      prisma.class.count({ where }),
    ]);

    return { classes, total };
  },

  async findById(id: string) {
    return prisma.class.findUnique({
      where: { id },
      include: {
        ...classInclude,
        students: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            user: { lastName: 'asc' },
          },
        },
        schedules: {
          include: {
            subject: { select: { name: true, code: true, color: true } },
            teacher: {
              select: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            room: { select: { name: true } },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });
  },

  async create(data: CreateClassInput) {
    return prisma.class.create({
      data: {
        name: data.name,
        level: data.level,
        section: data.section,
        maxStudents: data.maxStudents ?? 30,
        schoolYearId: data.schoolYearId,
        mainTeacherId: data.mainTeacherId,
        roomId: data.roomId,
      },
      include: classInclude,
    });
  },

  async update(id: string, data: UpdateClassInput) {
    return prisma.class.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.level && { level: data.level }),
        ...(data.section !== undefined && { section: data.section }),
        ...(data.maxStudents !== undefined && { maxStudents: data.maxStudents }),
        ...(data.mainTeacherId !== undefined && { mainTeacherId: data.mainTeacherId }),
        ...(data.roomId !== undefined && { roomId: data.roomId }),
      },
      include: classInclude,
    });
  },

  async delete(id: string) {
    // Check for students in class
    const studentsCount = await prisma.student.count({ where: { classId: id } });
    if (studentsCount > 0) {
      throw new Error('Impossible de supprimer une classe contenant des étudiants');
    }

    return prisma.class.delete({ where: { id } });
  },

  async addStudent(classId: string, studentId: string) {
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { students: true } } },
    });

    if (!classData) {
      throw new Error('Classe non trouvée');
    }

    if (classData._count.students >= classData.maxStudents) {
      throw new Error('Classe complète');
    }

    return prisma.student.update({
      where: { id: studentId },
      data: { classId },
    });
  },

  async removeStudent(classId: string, studentId: string) {
    return prisma.student.update({
      where: { id: studentId, classId },
      data: { classId: null },
    });
  },

  async getStats() {
    const currentYear = await prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      return { total: 0, byLevel: {}, averageStudents: 0 };
    }

    const classes = await prisma.class.findMany({
      where: { schoolYearId: currentYear.id },
      include: { _count: { select: { students: true } } },
    });

    const byLevel = classes.reduce((acc, c) => {
      acc[c.level] = (acc[c.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalStudents = classes.reduce((sum, c) => sum + c._count.students, 0);

    return {
      total: classes.length,
      byLevel,
      averageStudents: classes.length > 0 ? Math.round(totalStudents / classes.length) : 0,
    };
  },
};
