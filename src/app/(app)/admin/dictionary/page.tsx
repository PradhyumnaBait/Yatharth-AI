'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { useDictionaryStore } from '@/store/dictionary';
import { useUiStore } from '@/store/ui';
import { Sheet } from '@/components/ui/Sheet';
import {
  BookOpen,
  Plus,
  ArrowRight,
  Bot,
  Trash2,
  Check,
  Search,
} from 'lucide-react';

type DictionaryTab = 'synonyms' | 'disciplines' | 'units';

export default function AdminDictionaryPage() {
  const [activeTab, setActiveTab] = useState<DictionaryTab>('synonyms');
  const {
    synonyms,
    disciplines,
    units,
    addSynonym,
    deleteSynonym,
    addDiscipline,
    deleteDiscipline,
    addUnit,
    deleteUnit,
    testPhrase,
  } = useDictionaryStore();
  const { showToast } = useUiStore();

  // Test phrase state
  const [testInput, setTestInput] = useState('Line 24-XX ki spool 17 hydro test complete ho gayi');
  const phraseMatches = testPhrase(testInput);

  // Add sheets state
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [termInput, setTermInput] = useState('');
  const [canonicalInput, setCanonicalInput] = useState('');
  const [unitAliasesInput, setUnitAliasesInput] = useState('');

  const tabs: TabItem[] = [
    { id: 'synonyms', label: 'Synonyms', count: synonyms.length },
    { id: 'disciplines', label: 'Disciplines', count: disciplines.length },
    { id: 'units', label: 'Units', count: units.length },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'synonyms') {
      if (!termInput.trim() || !canonicalInput.trim()) return;
      addSynonym(termInput.trim(), canonicalInput.trim());
      showToast(`Synonym "${termInput}" added.`);
    } else if (activeTab === 'disciplines') {
      if (!termInput.trim() || !canonicalInput.trim()) return;
      addDiscipline(termInput.trim(), canonicalInput.trim());
      showToast(`Discipline mapping "${termInput}" added.`);
    } else if (activeTab === 'units') {
      if (!canonicalInput.trim() || !unitAliasesInput.trim()) return;
      const aliases = unitAliasesInput.split(',').map((a) => a.trim()).filter(Boolean);
      addUnit(canonicalInput.trim(), aliases);
      showToast(`Unit "${canonicalInput}" added.`);
    }

    setAddSheetOpen(false);
    setTermInput('');
    setCanonicalInput('');
    setUnitAliasesInput('');
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="EPC Dictionary" />

      <div className="px-4 py-3 space-y-4">
        {/* Live "Test a phrase" Box */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sb-bg-subtle text-sb-navy rounded-lg">
                <Bot className="w-4 h-4" />
              </span>
              <h3 className="text-body font-semibold text-sb-ink">Test a Phrase</h3>
            </div>
            <span className="text-[11px] text-sb-text-subtle">Live Matcher Preview</span>
          </div>

          <p className="text-caption text-sb-text-subtle">
            Type any field sentence to verify real-time dictionary term and entity recognition.
          </p>

          <input
            type="text"
            data-testid="test-phrase-input"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a field update (e.g. Hydro on spool 17)..."
            className="w-full px-3 py-2.5 bg-sb-bg border border-sb-border rounded-xl text-caption text-sb-ink focus:outline-none focus:border-sb-navy font-mono"
          />

          {/* Recognized Tokens Strip */}
          <div className="pt-2 border-t border-sb-border-subtle">
            <span className="text-[10px] uppercase font-bold text-sb-text-subtle tracking-wider block mb-1.5">
              Recognized Entities ({phraseMatches.length})
            </span>

            {phraseMatches.length === 0 ? (
              <span className="text-caption text-sb-text-muted italic">
                No matching terms recognized in phrase.
              </span>
            ) : (
              <div data-testid="phrase-matches-container" className="flex flex-wrap gap-1.5">
                {phraseMatches.map((m, i) => (
                  <div
                    key={i}
                    data-testid={`match-chip-${i}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-sb-border text-caption"
                  >
                    <span className="font-semibold text-sb-ink">&ldquo;{m.raw}&rdquo;</span>
                    <ArrowRight className="w-3 h-3 text-sb-text-subtle" />
                    <span className="font-bold text-sb-navy">{m.canonical}</span>
                    <span className="text-[9px] uppercase px-1 py-0.2 bg-white rounded text-sb-text-subtle border">
                      {m.matchedAs}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dictionary Management Tabs */}
        <div className="flex items-center justify-between">
          <UnderlineTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as DictionaryTab)}
          />

          <button
            type="button"
            data-testid="add-entry-button"
            onClick={() => setAddSheetOpen(true)}
            className="px-3 py-1.5 bg-sb-navy text-white text-caption font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm flex-shrink-0 ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* TAB 1: SYNONYMS */}
        {activeTab === 'synonyms' && (
          <div className="space-y-2">
            {synonyms.map((syn, idx) => (
              <div
                key={idx}
                data-testid={`synonym-row-${idx}`}
                className="p-3 bg-white border border-sb-border rounded-lg shadow-sm flex items-center justify-between group hover:border-sb-navy transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-caption font-bold text-sb-ink bg-sb-bg-subtle px-2 py-0.5 rounded border border-sb-border">
                    {syn.term}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sb-text-subtle" />
                  <span className="text-caption font-semibold text-sb-navy">
                    {syn.canonical}
                  </span>
                </div>

                <button
                  type="button"
                  data-testid={`delete-synonym-${idx}`}
                  onClick={() => {
                    deleteSynonym(idx);
                    showToast(`Deleted synonym "${syn.term}".`);
                  }}
                  className="text-sb-text-subtle hover:text-red-600 p-1 opacity-60 hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: DISCIPLINES */}
        {activeTab === 'disciplines' && (
          <div className="space-y-2">
            {disciplines.map((disc, idx) => (
              <div
                key={idx}
                data-testid={`discipline-row-${idx}`}
                className="p-3 bg-white border border-sb-border rounded-lg shadow-sm flex items-center justify-between group hover:border-sb-navy transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-caption font-bold text-sb-ink bg-sb-bg-subtle px-2 py-0.5 rounded border border-sb-border">
                    {disc.keyword}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sb-text-subtle" />
                  <span className="text-caption font-semibold text-sb-navy">
                    {disc.discipline}
                  </span>
                </div>

                <button
                  type="button"
                  data-testid={`delete-discipline-${idx}`}
                  onClick={() => {
                    deleteDiscipline(idx);
                    showToast(`Deleted discipline mapping "${disc.keyword}".`);
                  }}
                  className="text-sb-text-subtle hover:text-red-600 p-1 opacity-60 hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: UNITS */}
        {activeTab === 'units' && (
          <div className="space-y-2">
            {units.map((u, idx) => (
              <div
                key={idx}
                data-testid={`unit-row-${idx}`}
                className="p-3 bg-white border border-sb-border rounded-lg shadow-sm flex items-center justify-between group hover:border-sb-navy transition-colors"
              >
                <div>
                  <span className="text-caption font-bold text-sb-navy">{u.canonical}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {u.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="font-mono text-[11px] text-sb-text-subtle bg-sb-bg px-1.5 py-0.2 rounded border border-sb-border-subtle"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`delete-unit-${idx}`}
                  onClick={() => {
                    deleteUnit(idx);
                    showToast(`Deleted unit "${u.canonical}".`);
                  }}
                  className="text-sb-text-subtle hover:text-red-600 p-1 opacity-60 hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Sheet */}
      <Sheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        title={`Add ${activeTab === 'synonyms' ? 'Synonym' : activeTab === 'disciplines' ? 'Discipline Mapping' : 'Unit'}`}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {activeTab !== 'units' ? (
            <>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-sb-ink">
                  {activeTab === 'synonyms' ? 'Field Term / Acronym' : 'Keyword'}
                </label>
                <input
                  type="text"
                  data-testid="input-term"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  placeholder={activeTab === 'synonyms' ? 'e.g. Tie-in' : 'e.g. Pipeline'}
                  required
                  className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-sb-ink">
                  Canonical System Target
                </label>
                <input
                  type="text"
                  data-testid="input-canonical"
                  value={canonicalInput}
                  onChange={(e) => setCanonicalInput(e.target.value)}
                  placeholder={activeTab === 'synonyms' ? 'e.g. Golden Joint' : 'e.g. Piping'}
                  required
                  className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-caption font-semibold text-sb-ink">Canonical Unit</label>
                <input
                  type="text"
                  data-testid="input-unit-canonical"
                  value={canonicalInput}
                  onChange={(e) => setCanonicalInput(e.target.value)}
                  placeholder="e.g. metric ton"
                  required
                  className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-semibold text-sb-ink">Aliases (comma separated)</label>
                <input
                  type="text"
                  data-testid="input-unit-aliases"
                  value={unitAliasesInput}
                  onChange={(e) => setUnitAliasesInput(e.target.value)}
                  placeholder="e.g. mt, ton, tonnes, t"
                  required
                  className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink font-mono"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            data-testid="submit-add-entry"
            className="w-full py-2.5 bg-sb-navy text-white text-caption font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Save Entry
          </button>
        </form>
      </Sheet>
    </div>
  );
}
