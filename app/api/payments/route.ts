import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's students (if parent)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { parent: { include: { children: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let payments = [];

    if (user.role === 'PARENT' && user.parent) {
      // Get payments for all children
      const studentIds = user.parent.children.map((child) => child.id);
      payments = await prisma.payment.findMany({
        where: {
          studentId: { in: studentIds },
        },
        include: {
          student: {
            include: {
              user: true,
              class: true,
            },
          },
        },
        orderBy: { dueDate: 'desc' },
      });
    } else if (user.role === 'STUDENT' && user.student) {
      // Get payments for the student
      payments = await prisma.payment.findMany({
        where: {
          studentId: user.student.id,
        },
        include: {
          student: {
            include: {
              user: true,
              class: true,
            },
          },
        },
        orderBy: { dueDate: 'desc' },
      });
    } else if (user.role === 'ADMIN' || user.role === 'DIRECTOR') {
      // Get all payments
      payments = await prisma.payment.findMany({
        include: {
          student: {
            include: {
              user: true,
              class: true,
            },
          },
        },
        orderBy: { dueDate: 'desc' },
        take: 100,
      });
    }

    // Format payments response
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      type: payment.type,
      amount: Number(payment.amount),
      dueDate: payment.dueDate.toISOString(),
      paidDate: payment.paidDate?.toISOString() || null,
      paidAmount: payment.paidAmount ? Number(payment.paidAmount) : null,
      status: payment.status,
      reference: payment.reference,
      notes: payment.notes,
      studentName: payment.student?.user.firstName + ' ' + payment.student?.user.lastName,
      studentClass: payment.student?.class?.name || 'N/A',
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
