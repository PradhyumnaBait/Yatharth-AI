'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Segmented } from '@/components/ui/Segmented';
import { mockAuthService } from '@/mocks/services';
import { UserRole } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';

const ORGANIZATIONS = [
  'Sterling Infra EPC',
  'L&T Hydrocarbon Engineering',
  'IOCL Project Management',
  'Petrofac International',
  'Engineers India Limited (EIL)',
];

const PROJECTS = [
  { id: 'kandla-panipat-p3', name: 'Kandla–Panipat Pipeline — P3' },
  { id: 'duliajan-upgrade', name: 'Duliajan Gathering Station Upgrade' },
  { id: 'numaligarh-tank-farm', name: 'Numaligarh Tank Farm Expansion' },
];

export default function RequestAccessPage() {
  const router = useRouter();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.requestAccess || TRANSLATIONS.en.requestAccess;

  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [organization, setOrganization] = useState(ORGANIZATIONS[0]);
  const [projectId, setProjectId] = useState(PROJECTS[0].id);
  const [role, setRole] = useState<UserRole>('supervisor');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contact.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await mockAuthService.requestAccess({
        name: fullName.trim(),
        contact: contact.trim().toUpperCase(),
        organization,
        projectId,
        role,
      });
      setSubmittedRef(res.requestId);
    } catch {
      setSubmittedRef('REQ-0087');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="request-access-screen-a6"
      className="relative w-full min-h-screen max-w-[390px] mx-auto bg-sb-bg flex flex-col justify-between p-6 select-none"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 pt-2 mb-6">
          <button
            type="button"
            onClick={() => router.push('/login')}
            data-testid="back-to-login-btn"
            className="w-10 h-10 rounded-full bg-sb-white border border-sb-border text-sb-navy flex items-center justify-center shadow-e1 active:scale-95 transition-transform"
            aria-label="Back to sign in"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-callout font-semibold text-sb-navy">
            {t.title}
          </span>
        </div>

        {!submittedRef ? (
          <div>
            <div className="mb-6">
              <h1 className="text-title-1 font-bold text-sb-navy tracking-tight mb-1">
                {t.title}
              </h1>
              <p className="text-body text-sb-ink-2">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label={t.fullName} required>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  required
                  data-testid="request-name-input"
                  className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border text-callout text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors"
                />
              </FormField>

              <FormField label={t.contact} required>
                <input
                  type="text"
                  value={contact}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact(e.target.value)}
                  placeholder="e.g. SUP-0391 or +91 98200 12345"
                  required
                  data-testid="request-contact-input"
                  className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border text-callout text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors"
                />
              </FormField>

              {/* Contractor / Organization Select */}
              <div className="space-y-1.5">
                <label className="text-caption font-medium text-sb-ink-2">
                  {t.contractor}
                </label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  data-testid="request-contractor-select"
                  className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border text-callout text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors"
                >
                  {ORGANIZATIONS.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Code Select */}
              <div className="space-y-1.5">
                <label className="text-caption font-medium text-sb-ink-2">
                  {t.project}
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  data-testid="request-project-select"
                  className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border text-callout text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors"
                >
                  {PROJECTS.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requested Role Segmented */}
              <div className="space-y-1.5 pt-1">
                <label className="text-caption font-medium text-sb-ink-2">
                  {t.role}
                </label>
                <Segmented
                  options={[
                    { value: 'supervisor', label: 'Supervisor' },
                    { value: 'planner', label: 'Planner' },
                    { value: 'pm', label: 'PM' },
                  ]}
                  value={role}
                  onChange={(v) => setRole(v as UserRole)}
                  className="w-full justify-between"
                  data-testid="request-role-segmented"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!fullName.trim() || !contact.trim() || isSubmitting}
                  loading={isSubmitting}
                  className="w-full h-14 text-callout font-semibold shadow-e2"
                  data-testid="submit-request-btn"
                >
                  {isSubmitting ? t.submitting : t.submit}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Card State */
          <div
            data-testid="request-success-card"
            className="p-6 bg-sb-white rounded-[24px] border border-sb-border shadow-e2 text-center space-y-4 my-auto mt-8"
          >
            <div className="w-16 h-16 rounded-full bg-sb-verified-tint text-sb-verified flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-title-1 font-bold text-sb-navy">
              {t.successTitle}
            </h2>

            <div className="py-2 px-4 bg-sb-navy-tint rounded-[14px] border border-sb-navy/20 inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-sb-navy" />
              <span className="font-mono text-title-3 font-bold text-sb-navy">
                {submittedRef}
              </span>
            </div>

            <p className="text-body text-sb-ink-2 max-w-xs mx-auto">
              {t.successDesc}
            </p>

            <div className="p-3 bg-sb-bg rounded-[12px] text-caption text-sb-ink-3 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sb-navy" />
              <span>Visible in Admin → Access Requests queue</span>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => router.push('/login')}
              className="w-full h-12 mt-4"
              data-testid="back-to-login-after-submit"
            >
              {t.backToLogin}
            </Button>
          </div>
        )}
      </div>

      <div className="pt-6 pb-2 text-center">
        <span className="text-caption text-sb-ink-3">
          SchedBridge AI · Project Controls Management
        </span>
      </div>
    </div>
  );
}
