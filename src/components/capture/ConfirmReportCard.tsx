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
  Check,
  Edit2,
} from 'lucide-react';
import { ExtractedInfo } from '@/services/types';

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
}

export const ConfirmReportCard: React.FC<ConfirmReportCardProps> = ({
  initialInfo,
  rawText,
  isSubmitting,
  onSubmit,
  onReRecord,
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

  return (
    <div
      data-testid="confirm-report-card"
      className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e2 space-y-4 animate-in fade-in"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3">
            Structured Extraction
          </span>
          <h3 className="text-callout font-bold text-sb-navy">
            Confirm Field Update
          </h3>
        </div>
        <span
          data-testid="confirm-status-pill"
          className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${
            info.status === 'Completed'
              ? 'bg-sb-verified-tint text-sb-verified-ink'
              : info.status === 'Delay'
              ? 'bg-sb-critical-tint text-sb-critical-ink'
              : 'bg-sb-review-tint text-sb-review-ink'
          }`}
        >
          {info.status || 'In progress'}
        </span>
      </div>

      {/* Raw Transcript Quote */}
      <div className="bg-sb-bg p-3 rounded-xl border border-sb-border text-caption text-sb-ink italic">
        &ldquo;{rawText}&rdquo;
      </div>

      {/* Extracted Chips Grid */}
      <div className="grid grid-cols-2 gap-2" data-testid="extracted-chips-container">
        {/* Action */}
        <div
          data-testid="chip-action"
          onClick={() => handleStartEdit('action')}
          className="p-2.5 rounded-xl border border-sb-border bg-sb-bg/50 hover:bg-sb-navy-tint/30 transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Action</div>
          <div className="font-semibold text-caption text-sb-navy flex items-center justify-between mt-0.5">
            <span data-testid="chip-action-val">{info.action || 'Unspecified'}</span>
            <Edit2 className="w-3 h-3 text-sb-ink-3 opacity-60" />
          </div>
        </div>

        {/* Object */}
        <div
          data-testid="chip-object"
          onClick={() => handleStartEdit('object')}
          className="p-2.5 rounded-xl border border-sb-border bg-sb-bg/50 hover:bg-sb-navy-tint/30 transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Object</div>
          <div className="font-semibold text-caption text-sb-navy flex items-center justify-between mt-0.5">
            <span data-testid="chip-object-val">{info.object || 'Unspecified'}</span>
            <Edit2 className="w-3 h-3 text-sb-ink-3 opacity-60" />
          </div>
        </div>

        {/* Location */}
        <div
          data-testid="chip-location"
          onClick={() => handleStartEdit('location')}
          className="p-2.5 rounded-xl border border-sb-border bg-sb-bg/50 hover:bg-sb-navy-tint/30 transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Location</div>
          <div className="font-semibold text-caption text-sb-navy flex items-center justify-between mt-0.5">
            <span data-testid="chip-location-val">{info.location || 'Unspecified'}</span>
            <Edit2 className="w-3 h-3 text-sb-ink-3 opacity-60" />
          </div>
        </div>

        {/* Quantity */}
        <div
          data-testid="chip-quantity"
          onClick={() => handleStartEdit('quantity')}
          className="p-2.5 rounded-xl border border-sb-border bg-sb-bg/50 hover:bg-sb-navy-tint/30 transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Quantity</div>
          <div className="font-semibold text-caption text-sb-navy flex items-center justify-between mt-0.5">
            <span data-testid="chip-quantity-val">
              {info.quantity ? `${info.quantity} ${info.unit || ''}` : 'None'}
            </span>
            <Edit2 className="w-3 h-3 text-sb-ink-3 opacity-60" />
          </div>
        </div>
      </div>

      {/* Inline Field Editor Modal/Input */}
      {editingField && (
        <div className="flex items-center gap-2 p-2 bg-sb-navy-tint rounded-xl">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-sb-white rounded-lg border border-sb-border text-caption font-semibold"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            className="px-3 py-1.5 bg-sb-navy text-sb-white rounded-lg text-caption font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditingField(null)}
            className="p-1.5 text-sb-ink-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delay Branch with Category Chips */}
      {isDelay && (
        <div className="p-3.5 bg-sb-critical-tint/50 rounded-xl border border-sb-critical/30 space-y-2.5">
          <div className="flex items-center gap-1.5 text-sb-critical">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-caption font-bold">Delay Category (Required)</span>
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
                    ? 'bg-sb-critical text-sb-white font-semibold'
                    : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachments & Notes */}
      <div className="space-y-3 pt-1 border-t border-sb-border/60">
        {/* Photos Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-caption">
            <span className="text-sb-ink-2 font-medium">Site Photos</span>
            <label className="text-sb-navy hover:underline cursor-pointer flex items-center gap-1 font-semibold text-[12px]">
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
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-sb-border shrink-0">
                  <Image src={src} alt="Evidence photo" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-sb-navy/80 text-sb-white flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note input */}
        {showNoteInput ? (
          <div className="space-y-1">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add field notes, site conditions, RFI numbers..."
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
            <span>Add field note</span>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          data-testid="submit-capture-btn"
          disabled={isSubmitDisabled}
          onClick={() => onSubmit(info, photos, note, delayCategory)}
          className={`w-full min-h-[56px] py-3.5 px-6 rounded-full font-bold text-callout flex items-center justify-center gap-2 shadow-e2 transition-all active:scale-[0.99] select-none ${
            isSubmitDisabled
              ? 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
              : 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed active:bg-sb-navy-pressed'
          }`}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Submitting to Schedule...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
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
