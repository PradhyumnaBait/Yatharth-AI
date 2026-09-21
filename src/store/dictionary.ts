'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SynonymEntry,
  DisciplineEntry,
  UnitEntry,
  FIXTURE_SYNONYMS,
  FIXTURE_DISCIPLINES,
  FIXTURE_UNITS,
} from '@/mocks/fixtures/dictionary';

export interface PhraseTokenMatch {
  raw: string;
  matchedAs: 'synonym' | 'discipline' | 'unit';
  canonical: string;
}

interface DictionaryState {
  synonyms: SynonymEntry[];
  disciplines: DisciplineEntry[];
  units: UnitEntry[];

  addSynonym: (term: string, canonical: string) => void;
  updateSynonym: (index: number, term: string, canonical: string) => void;
  deleteSynonym: (index: number) => void;

  addDiscipline: (keyword: string, discipline: string) => void;
  deleteDiscipline: (index: number) => void;

  addUnit: (canonical: string, aliases: string[]) => void;
  deleteUnit: (index: number) => void;

  testPhrase: (phrase: string) => PhraseTokenMatch[];
  resetDictionary: () => void;
}

export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set, get) => ({
      synonyms: FIXTURE_SYNONYMS,
      disciplines: FIXTURE_DISCIPLINES,
      units: FIXTURE_UNITS,

      addSynonym: (term, canonical) =>
        set((state) => ({
          synonyms: [{ term, canonical }, ...state.synonyms],
        })),

      updateSynonym: (index, term, canonical) =>
        set((state) => {
          const updated = [...state.synonyms];
          if (updated[index]) {
            updated[index] = { term, canonical };
          }
          return { synonyms: updated };
        }),

      deleteSynonym: (index) =>
        set((state) => ({
          synonyms: state.synonyms.filter((_, i) => i !== index),
        })),

      addDiscipline: (keyword, discipline) =>
        set((state) => ({
          disciplines: [{ keyword, discipline }, ...state.disciplines],
        })),

      deleteDiscipline: (index) =>
        set((state) => ({
          disciplines: state.disciplines.filter((_, i) => i !== index),
        })),

      addUnit: (canonical, aliases) =>
        set((state) => ({
          units: [{ canonical, aliases }, ...state.units],
        })),

      deleteUnit: (index) =>
        set((state) => ({
          units: state.units.filter((_, i) => i !== index),
        })),

      testPhrase: (phrase: string) => {
        if (!phrase.trim()) return [];
        const state = get();
        const matches: PhraseTokenMatch[] = [];
        const lowerPhrase = phrase.toLowerCase();

        // 1. Check Synonyms
        state.synonyms.forEach((syn) => {
          if (lowerPhrase.includes(syn.term.toLowerCase())) {
            matches.push({
              raw: syn.term,
              matchedAs: 'synonym',
              canonical: syn.canonical,
            });
          }
        });

        // 2. Check Disciplines
        state.disciplines.forEach((disc) => {
          if (lowerPhrase.includes(disc.keyword.toLowerCase())) {
            matches.push({
              raw: disc.keyword,
              matchedAs: 'discipline',
              canonical: disc.discipline,
            });
          }
        });

        // 3. Check Units
        state.units.forEach((unit) => {
          unit.aliases.forEach((alias) => {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(lowerPhrase)) {
              matches.push({
                raw: alias,
                matchedAs: 'unit',
                canonical: unit.canonical,
              });
            }
          });
        });

        return matches;
      },

      resetDictionary: () =>
        set({
          synonyms: FIXTURE_SYNONYMS,
          disciplines: FIXTURE_DISCIPLINES,
          units: FIXTURE_UNITS,
        }),
    }),
    {
      name: 'schedbridge-dictionary-store',
    }
  )
);
