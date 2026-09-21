'use client';

import React from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { useUiStore } from '@/store/ui';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Check, Globe } from 'lucide-react';

export interface LanguageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const LanguageSheet: React.FC<LanguageSheetProps> = ({ open, onOpenChange }) => {
  const { language, setLanguage, showToast } = useUiStore();
  const t = TRANSLATIONS[language]?.languageSheet || TRANSLATIONS.en.languageSheet;

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onOpenChange(false);
    if (code === 'mr') {
      showToast('मराठी अनुवाद लवकरच पूर्ण होईल · Fallback to English');
    } else if (code === 'gu') {
      showToast('ગુજરાતી અનુવાદ ટૂંક સમયમાં ઉપલબ્ધ થશે · Fallback to English');
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.title}
      description={t.subtitle}
      data-testid="language-sheet"
    >
      <div className="space-y-2 pt-2 pb-4">
        {LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              data-testid={`language-option-${lang.code}`}
              className={`w-full min-h-[52px] px-4 py-3 rounded-[16px] flex items-center justify-between border transition-all ${
                isSelected
                  ? 'bg-sb-navy-tint border-sb-navy text-sb-navy font-semibold'
                  : 'bg-sb-white border-sb-border text-sb-ink hover:bg-sb-bg'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-sb-navy text-sb-white' : 'bg-sb-bg text-sb-ink-3'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-callout font-medium">{lang.nativeName}</div>
                  <div className="text-caption text-sb-ink-3">{lang.name}</div>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-sb-navy flex items-center justify-center text-sb-white">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
};
