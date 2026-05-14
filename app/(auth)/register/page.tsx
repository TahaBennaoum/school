'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    const result = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });
    
    if (result.success) {
      setRegistrationComplete(true);
      toast.success(t('auth.registerSuccess'));
    } else {
      toast.error(result.error || t('errors.somethingWentWrong'));
    }
    
    setIsLoading(false);
  };

  // Show success message after registration
  if (registrationComplete) {
    return (
      <div className="space-y-6">
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-5 w-5 text-success" />
          <AlertTitle className="text-success">{t('auth.registerSuccess')}</AlertTitle>
          <AlertDescription className="mt-2">
            {t('auth.registerPending')}
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{t('auth.pendingValidation')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('auth.pendingMessage')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{t('auth.register')}</h2>
        <p className="text-sm text-muted-foreground">
          Remplissez le formulaire pour creer votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('auth.firstName')}</Label>
            <Input
              id="firstName"
              placeholder="Ahmed"
              autoComplete="given-name"
              disabled={isLoading}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">{t('auth.lastName')}</Label>
            <Input
              id="lastName"
              placeholder="Benali"
              autoComplete="family-name"
              disabled={isLoading}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="nom@ecole.dz"
            autoComplete="email"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('common.phone')} ({t('common.optional') || 'Optionnel'})</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0555 12 34 56"
            autoComplete="tel"
            disabled={isLoading}
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 caracteres"
              autoComplete="new-password"
              disabled={isLoading}
              {...register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirmez votre mot de passe"
            autoComplete="new-password"
            disabled={isLoading}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Info about validation process */}
        <Alert className="border-info/50 bg-info/10">
          <Clock className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            Apres inscription, votre compte sera examine par un administrateur qui vous attribuera le role approprie.
          </AlertDescription>
        </Alert>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creation en cours...
            </>
          ) : (
            t('auth.createAccount')
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('auth.login')}
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        {t('auth.termsAccept')}{' '}
        <Link href="/terms" className="underline hover:text-foreground">
          {t('auth.termsOfService')}
        </Link>{' '}
        {t('auth.and')}{' '}
        <Link href="/privacy" className="underline hover:text-foreground">
          {t('auth.privacyPolicy')}
        </Link>
        .
      </p>
    </div>
  );
}
