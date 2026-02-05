"use client"

import { useSafeLocale } from '@/hooks/use-safe-translations';
import { useRouter } from '@/routing';
import { locales, defaultLocale, type Locale } from '@/i18n';
import { setLocale } from '@/app/actions/locale';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export function LanguageSwitcher() {
  const locale = useSafeLocale() as Locale;
  const router = useRouter();

  const switchLocale = async (newLocale: Locale) => {
    // Set locale cookie via server action
    await setLocale(newLocale);
    
    // Reload the page to apply the new locale (full reload ensures middleware reads cookie)
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-300 hover:border-[#5a9c3a]"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{localeNames[locale]}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? 'bg-[#5a9c3a]/10 text-[#5a9c3a] font-medium' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
