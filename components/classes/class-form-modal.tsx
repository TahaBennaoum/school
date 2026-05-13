"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateClass, useUpdateClass } from "@/hooks/use-classes";
import type { Class } from "@/types";
import { Loader2 } from "lucide-react";

const classSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  level: z.enum(["CEM_1AM", "CEM_2AM", "CEM_3AM", "CEM_4AM", "LYCEE_1AS", "LYCEE_2AS", "LYCEE_3AS"]),
  section: z.string().optional(),
  maxStudents: z.number().min(1, "Minimum 1 étudiant").max(50, "Maximum 50 étudiants"),
  mainTeacherId: z.string().optional(),
  roomId: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: Class | null;
}

const levelLabels: Record<string, string> = {
  CEM_1AM: "1ère Année Moyenne",
  CEM_2AM: "2ème Année Moyenne",
  CEM_3AM: "3ème Année Moyenne",
  CEM_4AM: "4ème Année Moyenne",
  LYCEE_1AS: "1ère Année Secondaire",
  LYCEE_2AS: "2ème Année Secondaire",
  LYCEE_3AS: "3ème Année Secondaire",
};

const sections = ["A", "B", "C", "D", "Maths", "Sciences", "Lettres", "Langues", "Gestion"];

export function ClassFormModal({ open, onOpenChange, classData }: ClassFormModalProps) {
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      level: "CEM_1AM",
      maxStudents: 30,
    },
  });

  const selectedLevel = watch("level");
  const selectedSection = watch("section");

  useEffect(() => {
    if (classData) {
      reset({
        name: classData.name,
        level: classData.level as ClassFormData["level"],
        section: classData.section || "",
        maxStudents: classData.maxStudents || 30,
        mainTeacherId: classData.mainTeacherId || "",
        roomId: classData.roomId || "",
      });
    } else {
      reset({
        name: "",
        level: "CEM_1AM",
        section: "",
        maxStudents: 30,
        mainTeacherId: "",
        roomId: "",
      });
    }
  }, [classData, reset]);

  // Auto-generate class name based on level and section
  useEffect(() => {
    if (!classData && selectedLevel && selectedSection) {
      const levelShort = selectedLevel.replace("CEM_", "").replace("LYCEE_", "");
      setValue("name", `${levelShort}-${selectedSection}`);
    }
  }, [selectedLevel, selectedSection, setValue, classData]);

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (classData) {
        await updateClass.mutateAsync({ id: classData.id, data });
      } else {
        await createClass.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {classData ? "Modifier la classe" : "Ajouter une classe"}
          </DialogTitle>
          <DialogDescription>
            {classData
              ? "Modifiez les informations de la classe ci-dessous."
              : "Remplissez les informations pour ajouter une nouvelle classe."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <Select
                value={watch("level")}
                onValueChange={(value) => setValue("level", value as ClassFormData["level"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={watch("section") || ""}
                onValueChange={(value) => setValue("section", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la classe *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: 3AM-A, 2AS-Maths"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">Nombre maximum d&apos;étudiants *</Label>
            <Input
              id="maxStudents"
              type="number"
              {...register("maxStudents", { valueAsNumber: true })}
              placeholder="30"
              min={1}
              max={50}
            />
            {errors.maxStudents && (
              <p className="text-sm text-destructive">{errors.maxStudents.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {classData ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
