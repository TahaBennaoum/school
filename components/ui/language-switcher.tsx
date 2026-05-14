'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/components/providers/i18n-provider';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className,
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, languages, languageInfo } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2',
            size === 'icon' && 'h-9 w-9',
            className
          )}
        >
          <Globe className="h-4 w-4" />
          {showLabel && languageInfo && (
            <span className="hidden sm:inline">{languageInfo.name}</span>
          )}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              'cursor-pointer',
              currentLanguage === language.code && 'bg-accent'
            )}
          >
            <span className={cn(language.dir === 'rtl' && 'font-arabic')}>
              {language.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
