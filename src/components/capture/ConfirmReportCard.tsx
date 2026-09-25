'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  FileText,
  RotateCcw,
  Send,
  AlertTriangle,
  X,
  Plus,
  Edit2,
  Check,
  MapPin,
  Layers,
  Wrench,
  Activity,
  Hash,
  Sparkles,
  Volume2,
  HelpCircle,
  ArrowRight,
  SkipForward,
} from 'lucide-react';
import { ExtractedInfo } from '@/services/types';
import { ClarificationQuestion } from '@/mocks/extractor';

export const DELAY_CATEGORIES = [
  'Equipment / crane',
  'Weather',
  'RFI / engineering',
  'Material',
  'Permit / ROU',
  'Manpower',
  'Client hold',
  'Other',
] as const;

export interface ConfirmReportCardProps {
  initialInfo: ExtractedInfo;
  rawText: string;
  isSubmitting: boolean;
  onSubmit: (finalInfo: ExtractedInfo, photos: string[], note: string, delayCategory?: string) => void;
  onReRecord: () => void;
  audioUrl?: string | null;
  clarificationQuestion?: ClarificationQuestion | null;
  onAnswerClarification?: (field: string, answer: string) => void;
  onSkipClarification?: () => void;
}

export const ConfirmReportCard: React.FC<ConfirmReportCardProps> = ({
  initialInfo,
  rawText,
  isSubmitting,
  onSubmit,
  onReRecord,
  audioUrl,
  clarificationQuestion,
  onAnswerClarification,
  onSkipClarification,
}) => {
  const [info, setInfo] = useState<ExtractedInfo>({ ...initialInfo });
  const [delayCategory, setDelayCategory] = useState<string>(
    initialInfo.status === 'Delay' ? 'Equipment / crane' : ''
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [customClarifyAnswer, setCustomClarifyAnswer] = useState('');

  // Update internal info if initialInfo changes
  React.useEffect(() => {
    setInfo({ ...initialInfo });
  }, [initialInfo]);

  const isDelay = info.status === 'Delay';
  const isSubmitDisabled = isSubmitting || (isDelay && !delayCategory);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStartEdit = (field: keyof ExtractedInfo) => {
    setEditingField(field);
    setEditValue(String(info[field] || ''));
  };

  const handleSaveEdit = () => {
    if (editingField) {
      setInfo((prev) => ({ ...prev, [editingField]: editValue }));
      setEditingField(null);
    }
  };

  const handleInlineClarification = (field: string, val: string) => {
    setInfo((prev) => ({ ...prev, [field]: val }));
    if (onAnswerClarification) {
      onAnswerClarification(field, val);
    }
  };

  return (
    <div
      data-testid="confirm-report-card"
      className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e3 space-y-4 animate-in fade-in slide-in-from-bottom-2 text-sb-navy"
    >
      {/* 1. Header with AI Extraction Badge & Overall Status */}
      <div className="flex items-center justify-between pb-1 border-b border-sb-border/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sb-navy text-sb-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold">
                AI Entity Extraction
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sb-verified-tint text-sb-verified-ink font-semibold">
                94% Match
              </span>
            </div>
            <h3 className="text-callout font-bold text-sb-navy leading-tight">
              Confirm Field Update
            </h3>
          </div>
        </div>

        <span
          data-testid="confirm-status-pill"
          className={`px-3 py-1 rounded-full text-[12px] font-bold tracking-tight shadow-xs ${
            info.status === 'Completed'
              ? 'bg-sb-verified-tint text-sb-verified-ink border border-sb-verified/30'
              : info.status === 'Delay'
              ? 'bg-sb-critical-tint text-sb-critical-ink border border-sb-critical/30'
              : 'bg-sb-review-tint text-sb-review-ink border border-sb-review/30'
          }`}
        >
          {info.status || 'In Progress'}
        </span>
      </div>

      {/* 2. Spoken Audio Transcript Bubble (Origin Context) */}
      <div className="bg-sb-bg/80 p-3 rounded-xl border border-sb-border space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-sb-navy" />
            <span className="font-semibold text-sb-navy">Voice Transcript</span>
          </span>
          <span className="text-[10px] text-sb-ink-3">Multilingual ASR</span>
        </div>
        <p className="text-caption text-sb-ink font-medium italic leading-relaxed">
          &ldquo;{rawText}&rdquo;
        </p>
      </div>

      {/* 3. Extracted Entity Chips (Prominent High-Weight Grid) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold px-0.5">
          Structured Parameters
        </div>
        <div className="grid grid-cols-2 gap-2" data-testid="extracted-chips-container">
          {/* Action Chip */}
          <div
            data-testid="chip-action"
            onClick={() => handleStartEdit('action')}
            className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 cursor-pointer group shadow-xs relative sb-press-spring"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-blue-700" />
                Action
              </span>
              <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100 text-blue-900 transition-opacity" />
            </div>
            <div className="font-bold text-callout text-sb-navy mt-1 truncate" data-testid="chip-action-val">
              {info.action || 'Unspecified'}
            </div>
          </div>

          {/* Object Chip */}
          <div
            data-testid="chip-object"
            onClick={() => handleStartEdit('object')}
            className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/70 cursor-pointer group shadow-xs relative sb-press-spring"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-700" />
                Object
              </span>
              <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100 text-emerald-900 transition-opacity" />
            </div>
            <div className="font-bold text-callout text-sb-navy mt-1 truncate" data-testid="chip-object-val">
              {info.object || 'Unspecified'}
            </div>
          </div>

          {/* Location Chip */}
          <div
            data-testid="chip-location"
            onClick={() => handleStartEdit('location')}
            className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 cursor-pointer group shadow-xs relative sb-press-spring"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-700" />
                Location
              </span>
              <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100 text-amber-900 transition-opacity" />
            </div>
            <div className="font-bold text-callout text-sb-navy mt-1 truncate" data-testid="chip-location-val">
              {info.location || 'Unspecified'}
            </div>
          </div>

          {/* Quantity Chip */}
          <div
            data-testid="chip-quantity"
            onClick={() => handleStartEdit('quantity')}
            className="p-3 rounded-xl border border-sb-border bg-sb-bg/70 hover:bg-sb-navy-tint/40 cursor-pointer group shadow-xs relative sb-press-spring"
          >
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sb-ink-2 tracking-wider">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-sb-ink-2" />
                Quantity
              </span>
              <Edit2 className="w-3 h-3 opacity-40 group-hover:opacity-100 text-sb-navy transition-opacity" />
            </div>
            <div className="font-bold text-callout text-sb-navy mt-1 truncate" data-testid="chip-quantity-val">
              {info.quantity ? `${info.quantity} ${info.unit || ''}` : '1 Unit'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Inline Field Editor */}
      {editingField && (
        <div className="p-2.5 bg-sb-navy-tint rounded-xl border border-sb-navy/20 flex items-center gap-2 animate-in fade-in">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-sb-white rounded-lg border border-sb-border text-caption font-semibold text-sb-navy focus:outline-none focus:ring-2 focus:ring-sb-navy"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            className="px-3 py-1.5 bg-sb-navy text-sb-white rounded-lg text-caption font-bold shadow-xs hover:bg-sb-navy-pressed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditingField(null)}
            className="p-1 text-sb-ink-3 hover:text-sb-navy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Inline Clarification Sub-card if clarification is needed */}
      {clarificationQuestion && (
        <div
          data-testid="clarification-card"
          className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-300/80 space-y-2.5 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-amber-900">
            <div className="w-6 h-6 rounded-full bg-amber-200/80 flex items-center justify-center text-amber-900 shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Clarification Required
              </div>
              <h4 className="text-caption font-bold text-amber-950" data-testid="clarification-question-text">
                {clarificationQuestion.question}
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" data-testid="clarification-chips">
            {clarificationQuestion.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                data-testid={`clarify-chip-${chip.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleInlineClarification(clarificationQuestion.field, chip)}
                className="px-3 py-1 rounded-lg bg-sb-white border border-amber-300 hover:bg-amber-100/70 text-caption font-bold text-amber-950 transition-all active:scale-95 shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
            <input
              type="text"
              value={customClarifyAnswer}
              onChange={(e) => setCustomClarifyAnswer(e.target.value)}
              placeholder="Or type answer..."
              className="flex-1 h-8 px-2.5 bg-sb-white border border-amber-200 rounded-lg text-[12px] text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customClarifyAnswer.trim()) {
                  handleInlineClarification(clarificationQuestion.field, customClarifyAnswer.trim());
                  setCustomClarifyAnswer('');
                }
              }}
            />
            {customClarifyAnswer.trim() && (
              <button
                type="button"
                data-testid="submit-custom-answer-btn"
                onClick={() => {
                  handleInlineClarification(clarificationQuestion.field, customClarifyAnswer.trim());
                  setCustomClarifyAnswer('');
                }}
                className="h-8 px-2.5 rounded-lg bg-sb-navy text-sb-white text-[11px] font-bold flex items-center gap-1"
              >
                <span>Set</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {onSkipClarification && (
              <button
                type="button"
                data-testid="clarify-skip-btn"
                onClick={onSkipClarification}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold px-1 shrink-0"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Delay Category Selector (if status === 'Delay') */}
      {isDelay && (
        <div className="p-3.5 bg-sb-critical-tint/60 rounded-xl border border-sb-critical/30 space-y-2">
          <div className="flex items-center gap-1.5 text-sb-critical">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-caption font-bold">Delay Category (Required for P6 attribution)</span>
          </div>

          <div className="flex flex-wrap gap-1.5" data-testid="delay-category-chips">
            {DELAY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                data-testid={`delay-cat-${cat.toLowerCase().replace(/[\s/]+/g, '-')}`}
                onClick={() => setDelayCategory(cat)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  delayCategory === cat
                    ? 'bg-sb-critical text-sb-white font-semibold shadow-2xs'
                    : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Attachments & Field Notes */}
      <div className="space-y-2.5 pt-2 border-t border-sb-border/60">
        <div className="flex items-center justify-between text-caption">
          <span className="text-sb-ink-2 font-medium flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-sb-ink-3" />
            Site Evidence Photos
          </span>
          <label className="text-sb-navy hover:underline cursor-pointer flex items-center gap-1 font-bold text-[12px]">
            <Plus className="w-3.5 h-3.5" />
            <span>Add photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
              data-testid="add-photo-input"
            />
          </label>
        </div>

        {photos.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1" data-testid="photos-strip">
            {photos.map((src, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-sb-border shrink-0 shadow-2xs">
                <Image src={src} alt="Evidence photo" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-sb-navy/90 text-sb-white flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {showNoteInput ? (
          <div className="space-y-1">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add site conditions, crew notes, RFI references..."
              rows={2}
              className="w-full p-2.5 bg-sb-bg rounded-xl border border-sb-border text-caption text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
            />
          </div>
        ) : (
          <button
            type="button"
            data-testid="add-note-btn"
            onClick={() => setShowNoteInput(true)}
            className="text-caption text-sb-navy hover:underline font-semibold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Add supervisor note</span>
          </button>
        )}
      </div>

      {/* 8. Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          data-testid="submit-capture-btn"
          disabled={isSubmitDisabled}
          onClick={() => onSubmit(info, photos, note, delayCategory)}
          className={`w-full min-h-[52px] py-3.5 px-6 rounded-full font-bold text-callout flex items-center justify-center gap-2 shadow-e2 select-none ${
            isSubmitDisabled
              ? 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
              : 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed active:bg-sb-navy-pressed ring-2 ring-sb-navy/20 sb-press-spring cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Submitting to Schedule...</span>
          ) : (
            <>
              <Send className="w-4.5 h-4.5" />
              <span>Submit Field Update</span>
            </>
          )}
        </button>

        <button
          type="button"
          data-testid="rerecord-btn"
          disabled={isSubmitting}
          onClick={onReRecord}
          className="w-full py-2.5 text-caption font-semibold text-sb-ink-3 hover:text-sb-navy flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-record update</span>
        </button>
      </div>
    </div>
  );
};
