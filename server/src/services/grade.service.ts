import { PrismaClient, Prisma, GradeType } from '@prisma/client';
import { PaginationParams, FilterParams } from '../utils/pagination.js';

const prisma = new PrismaClient();

export interface CreateGradeInput {
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

export interface UpdateGradeInput {
  type?: GradeType;
  value?: number;
  maxValue?: number;
  coefficient?: number;
  description?: string;
  comment?: string;
}

const gradeInclude = {
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
  subject: {
    select: {
      id: true,
      name: true,
      code: true,
      coefficient: true,
    },
  },
  class: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const gradeService = {
  async findAll(pagination: PaginationParams, filters: FilterParams) {
    const where: Prisma.GradeWhereInput = {};

    if (filters.studentId) {
      where.studentId = filters.studentId as string;
    }

    if (filters.classId) {
      where.classId = filters.classId as string;
    }

    if (filters.subjectId) {
      where.subjectId = filters.subjectId as string;
    }

    if (filters.term) {
      where.term = parseInt(filters.term as string);
    }

    if (filters.type) {
      where.type = filters.type as GradeType;
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

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        include: gradeInclude,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.grade.count({ where }),
    ]);

    return { grades, total };
  },

  async findById(id: string) {
    return prisma.grade.findUnique({
      where: { id },
      include: gradeInclude,
    });
  },

  async create(data: CreateGradeInput) {
    return prisma.grade.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        subjectId: data.subjectId,
        schoolYearId: data.schoolYearId,
        type: data.type,
        value: data.value,
        maxValue: data.maxValue ?? 20,
        coefficient: data.coefficient ?? 1,
        term: data.term,
        description: data.description,
        comment: data.comment,
      },
      include: gradeInclude,
    });
  },

  async createBatch(grades: CreateGradeInput[]) {
    return prisma.$transaction(
      grades.map((data) =>
        prisma.grade.create({
          data: {
            studentId: data.studentId,
            classId: data.classId,
            subjectId: data.subjectId,
            schoolYearId: data.schoolYearId,
            type: data.type,
            value: data.value,
            maxValue: data.maxValue ?? 20,
            coefficient: data.coefficient ?? 1,
            term: data.term,
            description: data.description,
            comment: data.comment,
          },
        })
      )
    );
  },

  async update(id: string, data: UpdateGradeInput) {
    return prisma.grade.update({
      where: { id },
      data,
      include: gradeInclude,
    });
  },

  async delete(id: string) {
    return prisma.grade.delete({ where: { id } });
  },

  async getStudentAverage(studentId: string, term?: number, schoolYearId?: string) {
    const where: Prisma.GradeWhereInput = { studentId };

    if (term) {
      where.term = term;
    }

    if (schoolYearId) {
      where.schoolYearId = schoolYearId;
    } else {
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        subject: { select: { coefficient: true } },
      },
    });

    if (grades.length === 0) {
      return null;
    }

    let totalWeighted = 0;
    let totalCoefficients = 0;

    grades.forEach((grade) => {
      const normalizedValue = (Number(grade.value) / Number(grade.maxValue)) * 20;
      const coefficient = Number(grade.coefficient) * grade.subject.coefficient;
      totalWeighted += normalizedValue * coefficient;
      totalCoefficients += coefficient;
    });

    return totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0;
  },

  async getClassRanking(classId: string, term: number, schoolYearId?: string) {
    const where: Prisma.GradeWhereInput = { classId, term };

    if (schoolYearId) {
      where.schoolYearId = schoolYearId;
    } else {
      const currentYear = await prisma.schoolYear.findFirst({
        where: { isCurrent: true },
      });
      if (currentYear) {
        where.schoolYearId = currentYear.id;
      }
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        grades: {
          where,
          include: { subject: { select: { coefficient: true } } },
        },
      },
    });

    const ranking = students
      .map((student) => {
        let totalWeighted = 0;
        let totalCoefficients = 0;

        student.grades.forEach((grade) => {
          const normalizedValue = (Number(grade.value) / Number(grade.maxValue)) * 20;
          const coefficient = Number(grade.coefficient) * grade.subject.coefficient;
          totalWeighted += normalizedValue * coefficient;
          totalCoefficients += coefficient;
        });

        const average = totalCoefficients > 0 ? totalWeighted / totalCoefficients : 0;

        return {
          studentId: student.id,
          name: `${student.user.lastName} ${student.user.firstName}`,
          average: Math.round(average * 100) / 100,
          gradesCount: student.grades.length,
        };
      })
      .sort((a, b) => b.average - a.average)
      .map((s, index) => ({ ...s, rank: index + 1 }));

    return ranking;
  },

  async getStats(classId?: string, term?: number) {
    const where: Prisma.GradeWhereInput = {};
    
    if (classId) where.classId = classId;
    if (term) where.term = term;

    const currentYear = await prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });
    if (currentYear) {
      where.schoolYearId = currentYear.id;
    }

    const grades = await prisma.grade.findMany({ where });

    if (grades.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0 };
    }

    const values = grades.map((g) => (Number(g.value) / Number(g.maxValue)) * 20);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      total: grades.length,
      average: Math.round(average * 100) / 100,
      highest: Math.max(...values),
      lowest: Math.min(...values),
    };
  },
};
