"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { TeacherFormModal } from "@/components/teachers/teacher-form-modal";
import { useDeleteTeacher } from "@/hooks/use-teachers";
import type { Teacher } from "@/types";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  INACTIVE: "bg-gray-500/10 text-gray-500",
  ON_LEAVE: "bg-yellow-500/10 text-yellow-500",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  ON_LEAVE: "En congé",
};

// Mock data for demo
const mockTeachers: Teacher[] = [
  {
    id: "1",
    firstName: "Karim",
    lastName: "Hadj",
    email: "karim.hadj@ecole.dz",
    phone: "0555111222",
    gender: "MALE",
    dateOfBirth: "1980-05-15",
    qualification: "Doctorat en Mathématiques",
    specialization: "Algèbre",
    hireDate: "2010-09-01",
    salary: 85000,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    subjects: [{ id: "1", name: "Mathématiques" }],
  },
  {
    id: "2",
    firstName: "Samira",
    lastName: "Belkacemi",
    email: "samira.b@ecole.dz",
    phone: "0661222333",
    gender: "FEMALE",
    dateOfBirth: "1985-08-22",
    qualification: "Master en Physique",
    specialization: "Mécanique",
    hireDate: "2015-09-01",
    salary: 72000,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    subjects: [{ id: "2", name: "Physique" }],
  },
  {
    id: "3",
    firstName: "Omar",
    lastName: "Mansouri",
    email: "omar.m@ecole.dz",
    phone: "0770333444",
    gender: "MALE",
    dateOfBirth: "1975-03-10",
    qualification: "Licence en Langue Française",
    specialization: "Littérature",
    hireDate: "2005-09-01",
    salary: 90000,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    subjects: [{ id: "3", name: "Français" }],
  },
  {
    id: "4",
    firstName: "Nadia",
    lastName: "Cherif",
    email: "nadia.c@ecole.dz",
    phone: "0550444555",
    gender: "FEMALE",
    dateOfBirth: "1988-11-30",
    qualification: "Master en Anglais",
    specialization: "TEFL",
    hireDate: "2018-09-01",
    salary: 68000,
    status: "ON_LEAVE",
    createdAt: new Date().toISOString(),
    subjects: [{ id: "4", name: "Anglais" }],
  },
  {
    id: "5",
    firstName: "Yassine",
    lastName: "Ferhat",
    email: "yassine.f@ecole.dz",
    phone: "0661555666",
    gender: "MALE",
    dateOfBirth: "1982-07-18",
    qualification: "Doctorat en Sciences Naturelles",
    specialization: "Biologie",
    hireDate: "2012-09-01",
    salary: 82000,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    subjects: [{ id: "5", name: "Sciences Naturelles" }],
  },
];

export default function TeachersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const teachers = mockTeachers;
  const isLoading = false;

  const deleteTeacher = useDeleteTeacher();

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        search === "" ||
        teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (teacherToDelete) {
      try {
        await deleteTeacher.mutateAsync(teacherToDelete.id);
        setTeacherToDelete(null);
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
  };

  const columns = [
    {
      key: "teacher",
      header: "Enseignant",
      sortable: true,
      render: (teacher: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={teacher.photo} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {teacher.firstName[0]}
              {teacher.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {teacher.lastName} {teacher.firstName}
            </p>
            <p className="text-sm text-muted-foreground">{teacher.qualification}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (teacher: Teacher) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {teacher.email}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            {teacher.phone}
          </div>
        </div>
      ),
    },
    {
      key: "subjects",
      header: "Matières",
      render: (teacher: Teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.subjects?.map((subject) => (
            <Badge key={subject.id} variant="outline">
              {subject.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "salary",
      header: "Salaire",
      sortable: true,
      render: (teacher: Teacher) => (
        <span className="font-medium">
          {teacher.salary?.toLocaleString("fr-DZ")} DA
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (teacher: Teacher) => (
        <Badge className={statusColors[teacher.status]}>
          {statusLabels[teacher.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (teacher: Teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setTeacherToDelete(teacher)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const stats = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter((t) => t.status === "ACTIVE").length;
    const onLeave = teachers.filter((t) => t.status === "ON_LEAVE").length;
    const totalSalary = teachers.reduce((sum, t) => sum + (t.salary || 0), 0);

    return { total, active, onLeave, totalSalary };
  }, [teachers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Enseignants"
        description="Gérez le corps enseignant de votre établissement"
        icon={<GraduationCap className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un enseignant
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Enseignants</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Congé</CardTitle>
              <GraduationCap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.onLeave}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSalary.toLocaleString("fr-DZ")} DA
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un enseignant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="ON_LEAVE">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <DataTable
          data={filteredTeachers}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: Math.ceil(filteredTeachers.length / 10),
            onPageChange: setPage,
          }}
        />
      </motion.div>

      {/* Form Modal */}
      <TeacherFormModal
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        teacher={selectedTeacher}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!teacherToDelete}
        onOpenChange={() => setTeacherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l&apos;enseignant{" "}
              <strong>
                {teacherToDelete?.lastName} {teacherToDelete?.firstName}
              </strong>
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
