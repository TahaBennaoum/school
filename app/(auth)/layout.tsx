'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (false && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold">SchoolHub</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Gerez votre etablissement scolaire en toute simplicite
          </h1>
          <p className="text-lg text-primary-foreground/80 text-pretty">
            Plateforme complete de gestion pour les CEM et Lycees. 
            Etudiants, enseignants, notes, absences, paiements - tout en un seul endroit.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-2xl font-bold">5000+</div>
              <div className="text-sm text-primary-foreground/70">Etudiants geres</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-primary-foreground/70">Etablissements</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-primary-foreground/70">Satisfaction</div>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 p-4">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-primary-foreground/70">Support</div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} SchoolHub. Tous droits reserves.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">SchoolHub</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
