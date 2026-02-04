import { translations } from './translations';
import { defaultLocale } from './config';
import type { Locale } from './config';

export function getLocale(): Locale {
  try {
    const saved = localStorage.getItem('locale');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch (e) {
    // ignore (e.g., SSR)
  }
  return defaultLocale as Locale;
}

export function t(key: string, variables?: Record<string, string>): string {
  const locale = getLocale();
  const keys = key.split('.');
  let value: any = (translations as any)[locale];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  let result = typeof value === 'string' ? value : key;
  if (variables) {
    Object.entries(variables).forEach(([varKey, varValue]) => {
      result = result.replace(`{{${varKey}}}`, varValue);
    });
  }

  return result;
}
