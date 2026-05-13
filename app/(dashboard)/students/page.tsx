"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  UserCheck,
  UserX,
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
import { StudentFormModal } from "@/components/students/student-form-modal";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import type { Student } from "@/types";

const levelLabels: Record<string, string> = {
  CEM_1AM: "1AM",
  CEM_2AM: "2AM",
  CEM_3AM: "3AM",
  CEM_4AM: "4AM",
  LYCEE_1AS: "1AS",
  LYCEE_2AS: "2AS",
  LYCEE_3AS: "3AS",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  INACTIVE: "bg-gray-500/10 text-gray-500",
  GRADUATED: "bg-blue-500/10 text-blue-500",
  TRANSFERRED: "bg-orange-500/10 text-orange-500",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  GRADUATED: "Diplômé",
  TRANSFERRED: "Transféré",
};

// Mock data for demo
const mockStudents: Student[] = [
  {
    id: "1",
    firstName: "Ahmed",
    lastName: "Benali",
    email: "ahmed.benali@email.com",
    phone: "0555123456",
    dateOfBirth: "2010-03-15",
    gender: "MALE",
    address: "123 Rue de la Paix, Alger",
    level: "CEM_3AM",
    classId: "class-1",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    class: { id: "class-1", name: "3AM-A", level: "CEM_3AM" },
  },
  {
    id: "2",
    firstName: "Fatima",
    lastName: "Khelifi",
    email: "fatima.k@email.com",
    phone: "0661234567",
    dateOfBirth: "2009-07-22",
    gender: "FEMALE",
    address: "45 Boulevard Mohamed V, Oran",
    level: "CEM_4AM",
    classId: "class-2",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    class: { id: "class-2", name: "4AM-B", level: "CEM_4AM" },
  },
  {
    id: "3",
    firstName: "Mohamed",
    lastName: "Saidi",
    email: "m.saidi@email.com",
    phone: "0770123456",
    dateOfBirth: "2007-11-08",
    gender: "MALE",
    address: "78 Rue des Martyrs, Constantine",
    level: "LYCEE_2AS",
    classId: "class-3",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    class: { id: "class-3", name: "2AS-Math", level: "LYCEE_2AS" },
  },
  {
    id: "4",
    firstName: "Amina",
    lastName: "Boudiaf",
    email: "amina.b@email.com",
    phone: "0550987654",
    dateOfBirth: "2008-05-30",
    gender: "FEMALE",
    address: "12 Avenue de France, Annaba",
    level: "LYCEE_1AS",
    classId: "class-4",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    class: { id: "class-4", name: "1AS-Lettres", level: "LYCEE_1AS" },
  },
  {
    id: "5",
    firstName: "Youcef",
    lastName: "Mebarki",
    email: "youcef.m@email.com",
    phone: "0661987654",
    dateOfBirth: "2006-09-12",
    gender: "MALE",
    address: "56 Rue Didouche Mourad, Alger",
    level: "LYCEE_3AS",
    classId: "class-5",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    class: { id: "class-5", name: "3AS-Sciences", level: "LYCEE_3AS" },
  },
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Use mock data for demo (replace with API call when backend is connected)
  const students = mockStudents;
  const isLoading = false;

  const deleteStudent = useDeleteStudent();

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        search === "" ||
        student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase());

      const matchesLevel = levelFilter === "all" || student.level === levelFilter;
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [students, search, levelFilter, statusFilter]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent.mutateAsync(studentToDelete.id);
        setStudentToDelete(null);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  };

  const columns = [
    {
      key: "student",
      header: "Étudiant",
      sortable: true,
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.photo} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {student.firstName[0]}
              {student.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {student.lastName} {student.firstName}
            </p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Niveau",
      sortable: true,
      render: (student: Student) => (
        <Badge variant="outline">{levelLabels[student.level]}</Badge>
      ),
    },
    {
      key: "class",
      header: "Classe",
      render: (student: Student) => (
        <span className="text-muted-foreground">
          {student.class?.name || "Non assigné"}
        </span>
      ),
    },
    {
      key: "gender",
      header: "Genre",
      render: (student: Student) => (
        <span>{student.gender === "MALE" ? "Masculin" : "Féminin"}</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (student: Student) => (
        <Badge className={statusColors[student.status]}>
          {statusLabels[student.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (student: Student) => (
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
            <DropdownMenuItem onClick={() => handleEdit(student)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setStudentToDelete(student)}
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
    const total = students.length;
    const active = students.filter((s) => s.status === "ACTIVE").length;
    const inactive = students.filter((s) => s.status === "INACTIVE").length;
    const male = students.filter((s) => s.gender === "MALE").length;
    const female = students.filter((s) => s.gender === "FEMALE").length;

    return { total, active, inactive, male, female };
  }, [students]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Étudiants"
        description="Gérez les informations de tous les étudiants de l'établissement"
        icon={<Users className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un étudiant
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
              <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
              <UserCheck className="h-4 w-4 text-green-500" />
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
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
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
              <CardTitle className="text-sm font-medium">Répartition</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <span className="text-blue-500">{stats.male} Garçons</span>
                <span className="text-pink-500">{stats.female} Filles</span>
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
                placeholder="Rechercher un étudiant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="CEM_1AM">1AM</SelectItem>
                  <SelectItem value="CEM_2AM">2AM</SelectItem>
                  <SelectItem value="CEM_3AM">3AM</SelectItem>
                  <SelectItem value="CEM_4AM">4AM</SelectItem>
                  <SelectItem value="LYCEE_1AS">1AS</SelectItem>
                  <SelectItem value="LYCEE_2AS">2AS</SelectItem>
                  <SelectItem value="LYCEE_3AS">3AS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="GRADUATED">Diplômé</SelectItem>
                  <SelectItem value="TRANSFERRED">Transféré</SelectItem>
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
          data={filteredStudents}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: Math.ceil(filteredStudents.length / 10),
            onPageChange: setPage,
          }}
        />
      </motion.div>

      {/* Form Modal */}
      <StudentFormModal
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        student={selectedStudent}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!studentToDelete}
        onOpenChange={() => setStudentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l&apos;étudiant{" "}
              <strong>
                {studentToDelete?.lastName} {studentToDelete?.firstName}
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
