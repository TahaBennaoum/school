'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { generateInvoicePDF, generateReceiptPDF } from '@/lib/pdf/invoice-generator';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

interface Payment {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paidAmount: number | null;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  reference: string | null;
  notes: string | null;
  studentName: string;
  studentClass: string;
}

export default function PaymentsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/payments?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      setIsGeneratingPDF(true);
      const balance = (payment.amount - (payment.paidAmount || 0));
      
      const pdf = await generateInvoicePDF({
        invoiceNumber: payment.reference || `INV-${payment.id}`,
        date: new Date().toLocaleDateString(i18n.language),
        dueDate: new Date(payment.dueDate).toLocaleDateString(i18n.language),
        studentName: payment.studentName,
        studentClass: payment.studentClass,
        parentName: user?.firstName + ' ' + user?.lastName,
        schoolName: 'School Management System',
        items: [
          {
            description: t(`payments.${payment.type.toLowerCase()}`),
            amount: payment.amount,
          },
        ],
        totalAmount: payment.amount,
        amountPaid: payment.paidAmount,
        balance: balance > 0 ? balance : 0,
        status: t(`payments.${payment.status.toLowerCase()}`),
        notes: payment.notes || '',
      });

      const url = URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${payment.reference || payment.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t('payments.downloadingPdf'));
    } catch (err) {
      console.error('Error generating invoice:', err);
      toast.error(t('common.somethingWentWrong'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      setIsGeneratingPDF(true);
      
      const pdf = await generateReceiptPDF({
        invoiceNumber: payment.reference || `RCP-${payment.id}`,
        date: payment.paidDate ? new Date(payment.paidDate).toLocaleDateString(i18n.language) : new Date().toLocaleDateString(i18n.language),
        dueDate: new Date(payment.dueDate).toLocaleDateString(i18n.language),
        studentName: payment.studentName,
        studentClass: payment.studentClass,
        parentName: user?.firstName + ' ' + user?.lastName,
        schoolName: 'School Management System',
        items: [
          {
            description: t(`payments.${payment.type.toLowerCase()}`),
            amount: payment.paidAmount || payment.amount,
          },
        ],
        totalAmount: payment.paidAmount || payment.amount,
        status: t(`payments.${payment.status.toLowerCase()}`),
      });

      const url = URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.reference || payment.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t('payments.downloadingPdf'));
    } catch (err) {
      console.error('Error generating receipt:', err);
      toast.error(t('common.somethingWentWrong'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const calculateTotals = () => {
    if (!payments) return { total: 0, paid: 0, pending: 0 };
    
    return {
      total: payments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
      paid: payments.reduce((sum: number, p: Payment) => sum + (p.paidAmount || 0), 0),
      pending: payments.reduce((sum: number, p: Payment) => 
        p.status === 'PENDING' || p.status === 'OVERDUE' ? sum + (p.amount - (p.paidAmount || 0)) : sum, 0
      ),
    };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div>
        <h1 className="text-3xl font-bold">{t('payments.title')}</h1>
        <p className="text-muted-foreground">{t('payments.paymentDashboard')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('payments.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('payments.allPayments')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('payments.amountPaid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.paid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.paid')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('payments.amountDue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totals.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('payments.pendingPayments')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentHistory')}</CardTitle>
          <CardDescription>{t('payments.allPayments')}</CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('payments.type')}</TableHead>
                    <TableHead>{t('dashboard.class')}</TableHead>
                    <TableHead>{t('payments.amount')}</TableHead>
                    <TableHead>{t('payments.dueDate')}</TableHead>
                    <TableHead>{t('payments.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {t(`payments.${payment.type.toLowerCase()}`)}
                      </TableCell>
                      <TableCell>{payment.studentClass}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString(i18n.language)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {t(`payments.${payment.status.toLowerCase()}`)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(payment)}
                            disabled={isGeneratingPDF}
                            title={t('payments.downloadInvoice')}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {payment.status === 'PAID' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadReceipt(payment)}
                              disabled={isGeneratingPDF}
                              title={t('payments.downloadReceipt')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('payments.noPayments')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
