"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  School,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ClassFormModal } from "@/components/classes/class-form-modal";
import { useDeleteClass } from "@/hooks/use-classes";
import type { Class } from "@/types";

const levelLabels: Record<string, string> = {
  CEM_1AM: "1AM",
  CEM_2AM: "2AM",
  CEM_3AM: "3AM",
  CEM_4AM: "4AM",
  LYCEE_1AS: "1AS",
  LYCEE_2AS: "2AS",
  LYCEE_3AS: "3AS",
};

const levelColors: Record<string, string> = {
  CEM_1AM: "bg-blue-500/10 text-blue-500",
  CEM_2AM: "bg-green-500/10 text-green-500",
  CEM_3AM: "bg-yellow-500/10 text-yellow-500",
  CEM_4AM: "bg-orange-500/10 text-orange-500",
  LYCEE_1AS: "bg-purple-500/10 text-purple-500",
  LYCEE_2AS: "bg-pink-500/10 text-pink-500",
  LYCEE_3AS: "bg-red-500/10 text-red-500",
};

// Mock data for demo
const mockClasses: Class[] = [
  {
    id: "1",
    name: "1AM-A",
    level: "CEM_1AM",
    section: "A",
    maxStudents: 35,
    currentStudents: 32,
    mainTeacherId: "1",
    roomId: "room-1",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "1", firstName: "Karim", lastName: "Hadj" },
  },
  {
    id: "2",
    name: "2AM-B",
    level: "CEM_2AM",
    section: "B",
    maxStudents: 35,
    currentStudents: 28,
    mainTeacherId: "2",
    roomId: "room-2",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "2", firstName: "Samira", lastName: "Belkacemi" },
  },
  {
    id: "3",
    name: "3AM-A",
    level: "CEM_3AM",
    section: "A",
    maxStudents: 35,
    currentStudents: 35,
    mainTeacherId: "3",
    roomId: "room-3",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "3", firstName: "Omar", lastName: "Mansouri" },
  },
  {
    id: "4",
    name: "4AM-A",
    level: "CEM_4AM",
    section: "A",
    maxStudents: 30,
    currentStudents: 25,
    mainTeacherId: "4",
    roomId: "room-4",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "4", firstName: "Nadia", lastName: "Cherif" },
  },
  {
    id: "5",
    name: "1AS-Sciences",
    level: "LYCEE_1AS",
    section: "Sciences",
    maxStudents: 30,
    currentStudents: 27,
    mainTeacherId: "5",
    roomId: "room-5",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "5", firstName: "Yassine", lastName: "Ferhat" },
  },
  {
    id: "6",
    name: "2AS-Maths",
    level: "LYCEE_2AS",
    section: "Maths",
    maxStudents: 30,
    currentStudents: 22,
    mainTeacherId: "1",
    roomId: "room-6",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "1", firstName: "Karim", lastName: "Hadj" },
  },
  {
    id: "7",
    name: "3AS-Sciences",
    level: "LYCEE_3AS",
    section: "Sciences",
    maxStudents: 25,
    currentStudents: 24,
    mainTeacherId: "2",
    roomId: "room-7",
    createdAt: new Date().toISOString(),
    mainTeacher: { id: "2", firstName: "Samira", lastName: "Belkacemi" },
  },
];

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const classes = mockClasses;
  const isLoading = false;

  const deleteClass = useDeleteClass();

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        search === "" ||
        cls.name.toLowerCase().includes(search.toLowerCase());

      const matchesLevel = levelFilter === "all" || cls.level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [classes, search, levelFilter]);

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass.mutateAsync(classToDelete.id);
        setClassToDelete(null);
      } catch (error) {
        console.error("Error deleting class:", error);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClass(null);
  };

  const columns = [
    {
      key: "name",
      header: "Classe",
      sortable: true,
      render: (cls: Class) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{cls.name}</p>
            <p className="text-sm text-muted-foreground">
              {cls.mainTeacher
                ? `Prof: ${cls.mainTeacher.lastName} ${cls.mainTeacher.firstName}`
                : "Pas de prof principal"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Niveau",
      sortable: true,
      render: (cls: Class) => (
        <Badge className={levelColors[cls.level]}>
          {levelLabels[cls.level]}
        </Badge>
      ),
    },
    {
      key: "students",
      header: "Effectif",
      render: (cls: Class) => {
        const percentage = ((cls.currentStudents || 0) / (cls.maxStudents || 1)) * 100;
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-sm">
              <span>{cls.currentStudents || 0}</span>
              <span className="text-muted-foreground">/ {cls.maxStudents}</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      },
    },
    {
      key: "section",
      header: "Section",
      render: (cls: Class) => (
        <span className="text-muted-foreground">{cls.section || "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (cls: Class) => (
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
              Voir étudiants
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(cls)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setClassToDelete(cls)}
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
    const total = classes.length;
    const cemClasses = classes.filter((c) => c.level.startsWith("CEM")).length;
    const lyceeClasses = classes.filter((c) => c.level.startsWith("LYCEE")).length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0);
    const totalCapacity = classes.reduce((sum, c) => sum + (c.maxStudents || 0), 0);

    return { total, cemClasses, lyceeClasses, totalStudents, totalCapacity };
  }, [classes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Classes"
        description="Gérez les classes de votre établissement"
        icon={<School className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une classe
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
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Classes CEM</CardTitle>
              <School className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.cemClasses}</div>
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
              <CardTitle className="text-sm font-medium">Classes Lycée</CardTitle>
              <School className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.lyceeClasses}</div>
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
              <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalStudents}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {stats.totalCapacity}
                </span>
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
                placeholder="Rechercher une classe..."
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
          data={filteredClasses}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: Math.ceil(filteredClasses.length / 10),
            onPageChange: setPage,
          }}
        />
      </motion.div>

      {/* Form Modal */}
      <ClassFormModal
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        classData={selectedClass}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!classToDelete}
        onOpenChange={() => setClassToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la classe{" "}
              <strong>{classToDelete?.name}</strong>? Cette action est
              irréversible et tous les étudiants seront désassignés.
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
