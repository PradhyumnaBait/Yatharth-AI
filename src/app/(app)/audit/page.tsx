'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { useAuditStore } from '@/store/audit';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function AuditPage() {
  const chain = useAuditStore((s) => s.chain);
  const isVerifying = useAuditStore((s) => s.isVerifying);
  const verifyResult = useAuditStore((s) => s.verifyResult);
  const verifyChain = useAuditStore((s) => s.verifyChain);
  const tamperEntry = useAuditStore((s) => s.tamperEntry);

  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const entryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (chain.length === 0) {
      import('@/mocks/seed').then(({ generateSeededAuditChain }) => {
        generateSeededAuditChain(1280).then((seeded) => {
          useAuditStore.getState().resetAudit(seeded);
        });
      });
    }
  }, [chain.length]);

  // Unique actors & actions for filters
  const actors = useMemo(() => {
    const set = new Set<string>();
    chain.forEach((e) => set.add(e.actor));
    return Array.from(set);
  }, [chain]);

  const actions = useMemo(() => {
    const set = new Set<string>();
    chain.forEach((e) => set.add(e.action));
    return Array.from(set);
  }, [chain]);

  const filteredEntries = useMemo(() => {
    return chain.map((entry, originalIndex) => ({ entry, originalIndex })).filter(({ entry }) => {
      if (actorFilter !== 'all' && entry.actor !== actorFilter) return false;
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      return true;
    });
  }, [chain, actorFilter, actionFilter]);

  const handleVerify = async () => {
    const res = await verifyChain();
    if (!res.valid && res.brokenAtIndex !== undefined) {
      setHighlightedIndex(res.brokenAtIndex);
      const el = entryRefs.current[res.brokenAtIndex];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedIndex(null);
    }
  };

  const handleTamper = () => {
    // Pick entry #5 or first available
    const targetIdx = Math.min(5, Math.max(0, chain.length - 1));
    tamperEntry(targetIdx);
    setHighlightedIndex(null);
  };

  const handleJumpToBroken = (index: number) => {
    setHighlightedIndex(index);
    const el = entryRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Activity ID', 'Old Value', 'New Value', 'Source Event', 'Hash Prefix', 'Full Hash'];
    const rows = chain.map((e) => [
      e.id,
      e.ts,
      e.actor,
      e.action,
      e.activityId || '',
      String(e.oldValue ?? ''),
      String(e.newValue ?? ''),
      e.sourceEventId || '',
      e.hash.slice(0, 8),
      e.hash,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Trail_SHA256_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Forensic Audit Trail" />

      <div className="px-4 py-3 space-y-4">
        {/* Verification Status Card */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-body font-semibold text-sb-ink">Tamper-Evident SHA-256 Ledger</h3>
              <p className="text-caption text-sb-text-muted">
                Immutable cryptographic hash chain ({chain.length} entries)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="verify-chain-button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-3.5 py-1.5 bg-sb-navy text-white text-caption font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifying ? 'Verifying...' : 'Verify chain'}
              </button>

              <button
                type="button"
                data-testid="export-audit-csv"
                onClick={handleExportCSV}
                className="p-1.5 border border-sb-border rounded-lg bg-sb-bg-subtle hover:bg-slate-100 text-sb-ink transition-colors"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dev-only Tamper button */}
          <div className="pt-2 border-t border-sb-border-subtle flex items-center justify-between text-caption">
            <span className="text-sb-text-subtle text-[11px]">Developer Verification Tool:</span>
            <button
              type="button"
              data-testid="tamper-entry-button"
              onClick={handleTamper}
              className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              Tamper an entry
            </button>
          </div>

          {/* Verification Result Banner */}
          {verifyResult && (
            <div
              data-testid={verifyResult.valid ? 'verify-result-success' : 'verify-result-break'}
              className={`p-3.5 rounded-card border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
                verifyResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {verifyResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-caption font-bold">
                    {verifyResult.valid
                      ? `Chain intact · ${chain.length} entries verified`
                      : `Break at entry #${verifyResult.brokenAtIndex! + 1}`}
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {verifyResult.valid
                      ? 'Every block mathematically reconciles with its preceding SHA-256 state.'
                      : 'Cryptographic hash mismatch detected! The ledger was modified post-signing.'}
                  </p>
                </div>
              </div>

              {!verifyResult.valid && verifyResult.brokenAtIndex !== undefined && (
                <button
                  type="button"
                  data-testid="jump-to-break-button"
                  onClick={() => handleJumpToBroken(verifyResult.brokenAtIndex!)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-700 text-white rounded hover:bg-red-800 transition-colors flex-shrink-0"
                >
                  Jump to entry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-caption">
          {/* Actor Select */}
          <select
            data-testid="audit-filter-actor"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-sb-border rounded-lg text-sb-ink text-caption font-medium focus:outline-none focus:border-sb-navy"
          >
            <option value="all">All Actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Action Select */}
          <select
            data-testid="audit-filter-action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-sb-border rounded-lg text-sb-ink text-caption font-medium focus:outline-none focus:border-sb-navy"
          >
            <option value="all">All Actions</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <span className="text-mono-s text-sb-text-subtle ml-auto">
            {filteredEntries.length} results
          </span>
        </div>

        {/* Audit Entries List */}
        <div className="space-y-2.5">
          {filteredEntries.map(({ entry, originalIndex }) => {
            const isBroken = verifyResult && !verifyResult.valid && verifyResult.brokenAtIndex === originalIndex;
            const isHighlighted = highlightedIndex === originalIndex;

            return (
              <div
                key={entry.id}
                ref={(el) => {
                  entryRefs.current[originalIndex] = el;
                }}
                data-testid={`audit-entry-${entry.id}`}
                className={`p-3 rounded-card border transition-all ${
                  isBroken || isHighlighted
                    ? 'border-red-500 bg-red-50/50 shadow-md ring-2 ring-red-400'
                    : 'border-sb-border bg-white hover:border-sb-navy shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-caption mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-mono-s font-semibold text-sb-navy">
                      #{originalIndex + 1} {entry.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sb-bg-subtle px-1.5 py-0.5 rounded text-sb-ink">
                      {entry.action}
                    </span>
                  </div>

                  <span className="font-mono text-mono-s text-sb-text-subtle">
                    {entry.ts ? new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:24'}
                  </span>
                </div>

                <div className="text-caption text-sb-ink mt-1">
                  <span className="font-semibold text-sb-ink">{entry.actor}</span>
                  {entry.activityId && (
                    <span className="ml-1 text-sb-text-subtle">
                      on <span className="font-mono text-sb-navy font-semibold">{entry.activityId}</span>
                    </span>
                  )}
                </div>

                {/* Old -> New Values */}
                {(entry.oldValue !== undefined || entry.newValue !== undefined) && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-caption bg-sb-bg-subtle p-1.5 rounded font-mono text-[11px]">
                    <span className="text-sb-text-subtle">{String(entry.oldValue ?? '—')}</span>
                    <ArrowRight className="w-3 h-3 text-sb-text-subtle" />
                    <span className="text-sb-navy font-bold">{String(entry.newValue ?? '—')}</span>
                  </div>
                )}

                {/* Source and Hash Prefix */}
                <div className="mt-2 pt-1.5 border-t border-sb-border-subtle flex items-center justify-between text-[11px] text-sb-text-muted">
                  <span>
                    {entry.sourceEventId ? `Source: ${entry.sourceEventId}` : 'Direct System Entry'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span>Hash:</span>
                    <span className="font-mono font-bold text-sb-ink bg-slate-100 px-1 py-0.2 rounded">
                      {entry.hash.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
