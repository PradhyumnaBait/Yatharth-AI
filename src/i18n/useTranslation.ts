'use client';

import { useUiStore } from '@/store/ui';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import gu from './gu.json';

type Dictionaries = {
  en: typeof en;
  hi: typeof hi;
  mr: typeof mr;
  gu: typeof gu;
};

const dictionaries: Dictionaries = {
  en,
  hi,
  mr,
  gu,
};

// Recursive key path helper
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

export function useTranslation() {
  const language = useUiStore((s) => s.language) || 'en';
  const setLanguage = useUiStore((s) => s.setLanguage);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const activeDict = (dictionaries[language as keyof Dictionaries] || dictionaries.en) as Record<string, unknown>;
    const fallbackDict = dictionaries.en as Record<string, unknown>;

    const getNested = (obj: Record<string, unknown>, keyPath: string): string | undefined => {
      const parts = keyPath.split('.');
      let current: unknown = obj;
      for (const part of parts) {
        if (!current || typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[part];
      }
      return typeof current === 'string' ? current : undefined;
    };

    let text = getNested(activeDict, path) || getNested(fallbackDict, path) || path;

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return { t, language, setLanguage };
}
