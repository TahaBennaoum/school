import { PrismaClient, Prisma, StudentStatus, Gender } from '@prisma/client';
import { PaginationParams, FilterParams } from '../utils/pagination.js';

const prisma = new PrismaClient();

export interface CreateStudentInput {
  email: string;
  firstName: string;
  lastName: string;
  supabaseId: string;
  phone?: string;
  dateOfBirth: Date;
  gender: Gender;
  address?: string;
  classId?: string;
  parentId?: string;
}

export interface UpdateStudentInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  classId?: string | null;
  parentId?: string | null;
  status?: StudentStatus;
}

const studentInclude = {
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
  class: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
  parent: {
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
    },
  },
};

export const studentService = {
  async findAll(pagination: PaginationParams, filters: FilterParams) {
    const where: Prisma.StudentWhereInput = {};

    if (filters.search) {
      where.OR = [
        { matricule: { contains: filters.search, mode: 'insensitive' } },
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.status) {
      where.status = filters.status as StudentStatus;
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.level) {
      where.class = { level: filters.level as any };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: studentInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          [pagination.sortBy === 'name' ? 'user' : pagination.sortBy]: 
            pagination.sortBy === 'name' 
              ? { firstName: pagination.sortOrder }
              : pagination.sortOrder,
        },
      }),
      prisma.student.count({ where }),
    ]);

    return { students, total };
  },

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        ...studentInclude,
        attendances: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        grades: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            subject: { select: { name: true, code: true } },
          },
        },
        payments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async create(data: CreateStudentInput) {
    // Generate matricule
    const year = new Date().getFullYear();
    const count = await prisma.student.count();
    const matricule = `STU${year}${String(count + 1).padStart(4, '0')}`;

    // Create user and student in transaction
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          supabaseId: data.supabaseId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          matricule,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          classId: data.classId,
          parentId: data.parentId,
        },
        include: studentInclude,
      });

      return student;
    });
  },

  async update(id: string, data: UpdateStudentInput) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!student) {
        throw new Error('Étudiant non trouvé');
      }

      // Update user data if provided
      if (data.email || data.firstName || data.lastName || data.phone) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            ...(data.email && { email: data.email }),
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone && { phone: data.phone }),
          },
        });
      }

      // Update student data
      return tx.student.update({
        where: { id },
        data: {
          ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
          ...(data.gender && { gender: data.gender }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.classId !== undefined && { classId: data.classId }),
          ...(data.parentId !== undefined && { parentId: data.parentId }),
          ...(data.status && { status: data.status }),
        },
        include: studentInclude,
      });
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!student) {
        throw new Error('Étudiant non trouvé');
      }

      // Delete student (cascades to related records)
      await tx.student.delete({ where: { id } });
      
      // Delete user
      await tx.user.delete({ where: { id: student.userId } });
    });
  },

  async getStats() {
    const [total, active, byGender, byLevel] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.student.groupBy({
        by: ['gender'],
        _count: true,
      }),
      prisma.student.findMany({
        where: { class: { isNot: null } },
        select: { class: { select: { level: true } } },
      }),
    ]);

    const levelCount = byLevel.reduce((acc, s) => {
      if (s.class?.level) {
        acc[s.class.level] = (acc[s.class.level] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive: total - active,
      byGender: byGender.reduce((acc, g) => {
        acc[g.gender] = g._count;
        return acc;
      }, {} as Record<string, number>),
      byLevel: levelCount,
    };
  },
};
