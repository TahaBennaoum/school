import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dashboardService = {
  async getStats() {
    const currentYear = await prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });

    const [
      totalStudents,
      activeStudents,
      totalTeachers,
      totalClasses,
      totalPayments,
      pendingPayments,
      recentAttendance,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.teacher.count(),
      currentYear
        ? prisma.class.count({ where: { schoolYearId: currentYear.id } })
        : 0,
      currentYear
        ? prisma.payment.aggregate({
            where: { schoolYearId: currentYear.id, status: 'PAID' },
            _sum: { paidAmount: true },
          })
        : { _sum: { paidAmount: null } },
      currentYear
        ? prisma.payment.count({
            where: { schoolYearId: currentYear.id, status: { in: ['PENDING', 'OVERDUE'] } },
          })
        : 0,
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
        _count: true,
      }),
    ]);

    const attendanceStats = recentAttendance.reduce(
      (acc, a) => {
        acc[a.status] = a._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAttendance = Object.values(attendanceStats).reduce((a, b) => a + b, 0);
    const presentCount = (attendanceStats.PRESENT || 0) + (attendanceStats.LATE || 0);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
      },
      teachers: {
        total: totalTeachers,
      },
      classes: {
        total: totalClasses,
      },
      payments: {
        totalRevenue: Number(totalPayments._sum.paidAmount || 0),
        pendingCount: pendingPayments,
      },
      attendance: {
        rate: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0,
        total: totalAttendance,
        present: presentCount,
        absent: attendanceStats.ABSENT || 0,
      },
    };
  },

  async getRecentActivity(limit: number = 10) {
    const [recentStudents, recentGrades, recentPayments, recentAttendance] = await Promise.all([
      prisma.student.findMany({
        take: 3,
        orderBy: { enrollmentDate: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.grade.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          subject: { select: { name: true } },
        },
      }),
      prisma.payment.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        where: { status: 'PAID' },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      prisma.attendance.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        where: { status: { in: ['ABSENT', 'LATE'] } },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
    ]);

    const activities: Array<{
      id: string;
      type: 'student' | 'grade' | 'payment' | 'attendance';
      title: string;
      description: string;
      timestamp: Date;
    }> = [];

    recentStudents.forEach((s) => {
      activities.push({
        id: s.id,
        type: 'student',
        title: 'Nouvel étudiant inscrit',
        description: `${s.user.firstName} ${s.user.lastName}`,
        timestamp: s.enrollmentDate,
      });
    });

    recentGrades.forEach((g) => {
      activities.push({
        id: g.id,
        type: 'grade',
        title: 'Nouvelle note ajoutée',
        description: `${g.student.user.lastName} - ${g.subject.name}: ${g.value}/${g.maxValue}`,
        timestamp: g.createdAt,
      });
    });

    recentPayments.forEach((p) => {
      activities.push({
        id: p.id,
        type: 'payment',
        title: 'Paiement reçu',
        description: `${p.student.user.lastName} - ${Number(p.paidAmount).toLocaleString()} DA`,
        timestamp: p.paidDate || p.createdAt,
      });
    });

    recentAttendance.forEach((a) => {
      activities.push({
        id: a.id,
        type: 'attendance',
        title: a.status === 'ABSENT' ? 'Absence signalée' : 'Retard signalé',
        description: `${a.student.user.lastName} ${a.student.user.firstName}`,
        timestamp: a.createdAt,
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },

  async getMonthlyRevenue(year?: number) {
    const targetYear = year || new Date().getFullYear();
    
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        paidDate: {
          gte: new Date(`${targetYear}-01-01`),
          lt: new Date(`${targetYear + 1}-01-01`),
        },
      },
      select: {
        paidDate: true,
        paidAmount: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));

    payments.forEach((p) => {
      if (p.paidDate && p.paidAmount) {
        const month = p.paidDate.getMonth();
        monthlyData[month].revenue += Number(p.paidAmount);
      }
    });

    return monthlyData;
  },

  async getAttendanceTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate },
      },
      select: {
        date: true,
        status: true,
      },
    });

    const dailyData: Record<string, { present: number; absent: number; total: number }> = {};

    attendances.forEach((a) => {
      const dateKey = a.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { present: 0, absent: 0, total: 0 };
      }
      dailyData[dateKey].total++;
      if (a.status === 'PRESENT' || a.status === 'LATE') {
        dailyData[dateKey].present++;
      } else if (a.status === 'ABSENT') {
        dailyData[dateKey].absent++;
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        ...data,
        rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getGradeDistribution(classId?: string, subjectId?: string) {
    const where: any = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;

    const currentYear = await prisma.schoolYear.findFirst({
      where: { isCurrent: true },
    });
    if (currentYear) {
      where.schoolYearId = currentYear.id;
    }

    const grades = await prisma.grade.findMany({
      where,
      select: { value: true, maxValue: true },
    });

    const distribution = {
      excellent: 0, // 16-20
      good: 0, // 14-15.99
      average: 0, // 10-13.99
      belowAverage: 0, // 5-9.99
      failing: 0, // 0-4.99
    };

    grades.forEach((g) => {
      const normalized = (Number(g.value) / Number(g.maxValue)) * 20;
      if (normalized >= 16) distribution.excellent++;
      else if (normalized >= 14) distribution.good++;
      else if (normalized >= 10) distribution.average++;
      else if (normalized >= 5) distribution.belowAverage++;
      else distribution.failing++;
    });

    return {
      distribution,
      total: grades.length,
    };
  },
};
