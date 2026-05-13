import { PrismaClient, Prisma } from '@prisma/client';
import { PaginationParams, FilterParams } from '../utils/pagination.js';

const prisma = new PrismaClient();

export interface CreateTeacherInput {
  email: string;
  firstName: string;
  lastName: string;
  supabaseId: string;
  phone?: string;
  degree?: string;
  specialization?: string;
  salary?: number;
  contractType?: string;
  subjectIds?: string[];
}

export interface UpdateTeacherInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  degree?: string;
  specialization?: string;
  salary?: number;
  contractType?: string;
  subjectIds?: string[];
}

const teacherInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      isActive: true,
      createdAt: true,
    },
  },
  subjects: {
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
  classes: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
};

export const teacherService = {
  async findAll(pagination: PaginationParams, filters: FilterParams) {
    const where: Prisma.TeacherWhereInput = {};

    if (filters.search) {
      where.OR = [
        { employeeId: { contains: filters.search, mode: 'insensitive' } },
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.subjectId) {
      where.subjects = {
        some: { subjectId: filters.subjectId as string },
      };
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: teacherInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          user: { firstName: pagination.sortOrder },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { teachers, total };
  },

  async findById(id: string) {
    return prisma.teacher.findUnique({
      where: { id },
      include: {
        ...teacherInclude,
        schedules: {
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true } },
            room: { select: { name: true } },
          },
        },
      },
    });
  },

  async create(data: CreateTeacherInput) {
    // Generate employee ID
    const year = new Date().getFullYear();
    const count = await prisma.teacher.count();
    const employeeId = `TCH${year}${String(count + 1).padStart(4, '0')}`;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          supabaseId: data.supabaseId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'TEACHER',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          degree: data.degree,
          specialization: data.specialization,
          salary: data.salary,
          contractType: data.contractType,
          ...(data.subjectIds?.length && {
            subjects: {
              create: data.subjectIds.map((subjectId) => ({
                subjectId,
              })),
            },
          }),
        },
        include: teacherInclude,
      });

      return teacher;
    });
  },

  async update(id: string, data: UpdateTeacherInput) {
    return prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!teacher) {
        throw new Error('Enseignant non trouvé');
      }

      // Update user data
      if (data.email || data.firstName || data.lastName || data.phone) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: {
            ...(data.email && { email: data.email }),
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone && { phone: data.phone }),
          },
        });
      }

      // Update subjects if provided
      if (data.subjectIds) {
        await tx.teacherSubject.deleteMany({ where: { teacherId: id } });
        if (data.subjectIds.length > 0) {
          await tx.teacherSubject.createMany({
            data: data.subjectIds.map((subjectId) => ({
              teacherId: id,
              subjectId,
            })),
          });
        }
      }

      return tx.teacher.update({
        where: { id },
        data: {
          ...(data.degree !== undefined && { degree: data.degree }),
          ...(data.specialization !== undefined && { specialization: data.specialization }),
          ...(data.salary !== undefined && { salary: data.salary }),
          ...(data.contractType !== undefined && { contractType: data.contractType }),
        },
        include: teacherInclude,
      });
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!teacher) {
        throw new Error('Enseignant non trouvé');
      }

      await tx.teacher.delete({ where: { id } });
      await tx.user.delete({ where: { id: teacher.userId } });
    });
  },

  async getStats() {
    const [total, bySubject] = await Promise.all([
      prisma.teacher.count(),
      prisma.teacherSubject.groupBy({
        by: ['subjectId'],
        _count: true,
      }),
    ]);

    return {
      total,
      bySubject,
    };
  },
};
