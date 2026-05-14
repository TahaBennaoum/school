'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Download, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF } from '@/lib/pdf/invoice-generator';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paidAmount: number | null;
  status: string;
  reference: string | null;
}

export default function AdminPaymentsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'TUITION',
    amount: '',
    dueDate: '',
    paidAmount: '',
    status: 'PENDING',
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async (data: Partial<Payment>) => {
      const response = await fetch(`/api/payments/${editingPayment?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success(t('common.save'));
      setIsDialogOpen(false);
      setEditingPayment(null);
      setFormData({
        studentId: '',
        type: 'TUITION',
        amount: '',
        dueDate: '',
        paidAmount: '',
        status: 'PENDING',
      });
    },
    onError: () => {
      toast.error(t('common.somethingWentWrong'));
    },
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      studentId: payment.studentId,
      type: payment.type,
      amount: payment.amount.toString(),
      dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
      paidAmount: (payment.paidAmount || '').toString(),
      status: payment.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.amount || !formData.dueDate) {
      toast.error(t('errors.required'));
      return;
    }

    updatePaymentMutation.mutate({
      type: formData.type as any,
      amount: parseFloat(formData.amount),
      dueDate: new Date(formData.dueDate).toISOString(),
      paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : null,
      status: formData.status as any,
    });
  };

  const calculateTotals = () => {
    if (!payments) return { total: 0, paid: 0, pending: 0 };
    
    return {
      total: payments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
      paid: payments.reduce((sum: number, p: Payment) => sum + (p.paidAmount || 0), 0),
      pending: payments.reduce((sum: number, p: Payment) => 
        (p.amount - (p.paidAmount || 0)), 0
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('payments.title')}</h1>
          <p className="text-muted-foreground">{t('payments.paymentHistory')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPayment(null)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('payments.addPayment')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? t('payments.editPayment') : t('payments.addPayment')}
              </DialogTitle>
              <DialogDescription>
                {editingPayment
                  ? `${t('payments.editPayment')} - ${editingPayment.studentName}`
                  : t('payments.addPayment')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('payments.type')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGISTRATION">{t('payments.registration')}</SelectItem>
                    <SelectItem value="TUITION">{t('payments.tuition')}</SelectItem>
                    <SelectItem value="TRANSPORT">{t('payments.transport')}</SelectItem>
                    <SelectItem value="CANTEEN">{t('payments.canteen')}</SelectItem>
                    <SelectItem value="UNIFORM">{t('payments.uniform')}</SelectItem>
                    <SelectItem value="BOOKS">{t('payments.books')}</SelectItem>
                    <SelectItem value="OTHER">{t('payments.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('payments.amount')}</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('payments.dueDate')}</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('payments.amountPaid')}</Label>
                <Input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('payments.status')}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">{t('payments.pending')}</SelectItem>
                    <SelectItem value="PARTIAL">{t('payments.partial')}</SelectItem>
                    <SelectItem value="PAID">{t('payments.paid')}</SelectItem>
                    <SelectItem value="OVERDUE">{t('payments.overdue')}</SelectItem>
                    <SelectItem value="CANCELLED">{t('payments.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={updatePaymentMutation.isPending} className="w-full">
                {updatePaymentMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('payments.totalAmount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{payments?.length || 0} {t('payments.payments')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('payments.amountPaid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.paid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.paid')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('payments.amountDue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totals.pending.toFixed(2)}</div>
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
                    <TableHead>{t('dashboard.class')}</TableHead>
                    <TableHead>{t('payments.type')}</TableHead>
                    <TableHead>{t('payments.amount')}</TableHead>
                    <TableHead>{t('payments.dueDate')}</TableHead>
                    <TableHead>{t('payments.amountPaid')}</TableHead>
                    <TableHead>{t('payments.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell>{t(`payments.${payment.type.toLowerCase()}`)}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString(i18n.language)}
                      </TableCell>
                      <TableCell>${(payment.paidAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {t(`payments.${payment.status.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(payment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
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
