'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminGate } from '@/components/auth/permission-gate';
import type { Role, UserStatus } from '@/store/auth-store';

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  role?: Role;
}

// Mock data for demonstration
const mockPendingUsers: PendingUser[] = [
  {
    id: '1',
    email: 'ahmed.benali@ecole.dz',
    firstName: 'Ahmed',
    lastName: 'Benali',
    phone: '0555 12 34 56',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'fatima.hadj@ecole.dz',
    firstName: 'Fatima',
    lastName: 'Hadj',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    email: 'karim.mansour@ecole.dz',
    firstName: 'Karim',
    lastName: 'Mansour',
    phone: '0661 78 90 12',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const mockApprovedUsers: PendingUser[] = [
  {
    id: '4',
    email: 'sara.khelifi@ecole.dz',
    firstName: 'Sara',
    lastName: 'Khelifi',
    status: 'APPROVED',
    role: 'TEACHER',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const mockRejectedUsers: PendingUser[] = [
  {
    id: '5',
    email: 'test@invalid.com',
    firstName: 'Test',
    lastName: 'User',
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function UserValidationPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('TEACHER');
  const [rejectionReason, setRejectionReason] = useState('');

  // In a real app, this would fetch from your API
  const { data: pendingUsers = mockPendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: async () => mockPendingUsers,
  });

  const { data: approvedUsers = mockApprovedUsers } = useQuery({
    queryKey: ['users', 'approved'],
    queryFn: async () => mockApprovedUsers,
  });

  const { data: rejectedUsers = mockRejectedUsers } = useQuery({
    queryKey: ['users', 'rejected'],
    queryFn: async () => mockRejectedUsers,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      // In a real app, call your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success(t('validation.approveSuccess'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setApproveDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error(t('errors.somethingWentWrong'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      // In a real app, call your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success(t('validation.rejectSuccess'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');
    },
    onError: () => {
      toast.error(t('errors.somethingWentWrong'));
    },
  });

  const handleApprove = (user: PendingUser) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const handleReject = (user: PendingUser) => {
    setSelectedUser(user);
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedUser) {
      approveMutation.mutate({ userId: selectedUser.id, role: selectedRole });
    }
  };

  const confirmReject = () => {
    if (selectedUser) {
      rejectMutation.mutate({ userId: selectedUser.id, reason: rejectionReason });
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{t('userStatus.PENDING')}</Badge>;
      case 'APPROVED':
        return <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle className="h-3 w-3" />{t('userStatus.APPROVED')}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{t('userStatus.REJECTED')}</Badge>;
      case 'SUSPENDED':
        return <Badge variant="secondary" className="gap-1">{t('userStatus.SUSPENDED')}</Badge>;
      default:
        return null;
    }
  };

  const filterUsers = (users: PendingUser[]) => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  };

  const UserTable = ({ users, showActions = false }: { users: PendingUser[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('common.name')}</TableHead>
          <TableHead>{t('common.email')}</TableHead>
          <TableHead>{t('common.phone')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          <TableHead>{t('common.date')}</TableHead>
          {showActions && <TableHead className="text-right">{t('common.actions')}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">
              {t('validation.noPendingUsers')}
            </TableCell>
          </TableRow>
        ) : (
          users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    {user.role && (
                      <p className="text-xs text-muted-foreground">{t(`roles.${user.role}`)}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
              </TableCell>
              <TableCell>
                {user.phone ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.phone}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                </div>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleApprove(user)}>
                        <UserCheck className="mr-2 h-4 w-4 text-success" />
                        {t('validation.approve')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleReject(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        {t('validation.reject')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <AdminGate fallback={<div className="p-6 text-center text-muted-foreground">Access denied</div>}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('validation.title')}</h1>
            <p className="text-muted-foreground">
              Gerez les demandes d&apos;inscription et attribuez les roles
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('validation.pendingUsers')}</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('validation.approvedUsers')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('validation.rejectedUsers')}</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              {t('validation.pendingUsers')}
              {pendingUsers.length > 0 && (
                <Badge variant="secondary" className="ml-1">{pendingUsers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('validation.approvedUsers')}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              {t('validation.rejectedUsers')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <UserTable users={filterUsers(pendingUsers)} showActions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <UserTable users={filterUsers(approvedUsers)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <UserTable users={filterUsers(rejectedUsers)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('validation.approve')}</DialogTitle>
              <DialogDescription>
                {t('validation.approveConfirm')}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('validation.assignRole')}</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('validation.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">{t('roles.TEACHER')}</SelectItem>
                      <SelectItem value="STUDENT">{t('roles.STUDENT')}</SelectItem>
                      <SelectItem value="PARENT">{t('roles.PARENT')}</SelectItem>
                      <SelectItem value="DIRECTOR">{t('roles.DIRECTOR')}</SelectItem>
                      <SelectItem value="ADMIN">{t('roles.ADMIN')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={confirmApprove} 
                disabled={approveMutation.isPending}
                className="bg-success hover:bg-success/90"
              >
                {approveMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {t('validation.approve')}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('validation.reject')}</DialogTitle>
              <DialogDescription>
                {t('validation.rejectConfirm')}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('validation.rejectionReason')}</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Entrez le motif du rejet..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmReject} 
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    {t('validation.reject')}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGate>
  );
}
