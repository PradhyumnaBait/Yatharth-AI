'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  FileText,
  Calendar,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { PillFilter } from '@/components/ui/PillFilter';
import { UnderlineTabs } from '@/components/ui/UnderlineTabs';
import { Segmented } from '@/components/ui/Segmented';
import { SearchField } from '@/components/ui/SearchField';
import { KpiTile } from '@/components/ui/KpiTile';
import { Chip } from '@/components/ui/Chip';
import { StatusPill, EventStatus } from '@/components/ui/StatusPill';
import { Sheet } from '@/components/ui/Sheet';
import { Dialog } from '@/components/ui/Dialog';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { PinInput } from '@/components/ui/PinInput';
import { Avatar } from '@/components/ui/Avatar';

// Domain Components
import { ProjectCard } from '@/components/domain/ProjectCard';
import { EventRow } from '@/components/domain/EventRow';
import { Waveform } from '@/components/domain/Waveform';
import { ConfidenceBadge } from '@/components/domain/ConfidenceBadge';
import { EvidenceChain } from '@/components/domain/EvidenceChain';
import { ScheduleContext } from '@/components/domain/ScheduleContext';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { OfflineBanner } from '@/components/domain/OfflineBanner';
import { Stepper } from '@/components/domain/Stepper';

export default function DevKitPage() {
  // State for interactive components
  const [activeTab, setActiveTab] = useState('all');
  const [segmentedVal, setSegmentedVal] = useState('mine');
  const [activePill, setActivePill] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('Match approved');
  const [waveformProgress, setWaveformProgress] = useState(0.42);
  const [stepperStep, setStepperStep] = useState(2);

  const statuses: EventStatus[] = [
    'Verified',
    'Review',
    'Unmatched',
    'Delay',
    'Rejected',
    'Saved offline',
    'Reply needed',
  ];

  return (
    <div className="min-h-screen bg-sb-bg text-sb-ink p-4 sm:p-6 md:p-10 max-w-5xl mx-auto pb-24">
      {/* Dev Header */}
      <header className="border-b border-sb-border pb-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-mono-s text-sb-navy font-semibold px-2.5 py-0.5 rounded-full bg-sb-navy-tint">
            TASK P02
          </span>
          <span className="text-caption text-sb-ink-3">Core UI & Domain Primitives Gallery</span>
        </div>
        <h1 className="text-title-1 font-bold text-sb-navy">SchedBridge AI Component Library</h1>
        <p className="text-body text-sb-ink-2 mt-1">
          Complete set of reusable EPC primitives compliant with SPEC §4.5, token styling, and zero gradients.
        </p>
      </header>

      {/* Offline Banner Preview */}
      <section className="mb-10">
        <h2 className="text-title-3 font-semibold text-sb-navy mb-3">Offline Banner (SPEC §4.5)</h2>
        <OfflineBanner
          queuedCount={3}
          onSyncNow={() => {
            setToastMessage('Syncing 3 queued reports...');
            setToastOpen(true);
          }}
        />
      </section>

      {/* Reference Screen 2 Matches: KPI Tiles × 3 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title-2 font-semibold text-sb-navy">KPI Tiles (Reference Screen 2)</h2>
          <span className="text-caption text-sb-ink-3">Today, all crews</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <KpiTile
            number={47}
            label="Verified"
            statusColor="verified"
            icon={<CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}
            onClick={() => {
              setToastMessage('Filtered to 47 Verified events');
              setToastOpen(true);
            }}
            data-testid="kpi-verified"
          />
          <KpiTile
            number={12}
            label="Review"
            statusColor="review"
            icon={<Clock className="w-3.5 h-3.5" strokeWidth={1.5} />}
            onClick={() => {
              setToastMessage('Filtered to 12 Review events');
              setToastOpen(true);
            }}
            data-testid="kpi-review"
          />
          <KpiTile
            number="03"
            label="Delays"
            statusColor="critical"
            icon={<AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />}
            onClick={() => {
              setToastMessage('Filtered to 03 Delay events');
              setToastOpen(true);
            }}
            data-testid="kpi-delays"
          />
        </div>
      </section>

      {/* Reference Screen 2 Match: Active Project Card */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title-2 font-semibold text-sb-navy">Project Card (Reference Screen 2)</h2>
          <span className="text-caption text-sb-navy font-semibold cursor-pointer hover:underline">See All</span>
        </div>
        <div className="max-w-md mx-auto sm:max-w-none">
          <ProjectCard
            imageSrc="/images/refinery-pipes.jpg"
            title="Kandla–Panipat Pipeline — Package 3"
            progress={68}
            plannedProgress={74}
            dataDate="20 Sep 2026"
            activeActivitiesCount={14}
            onClick={() => {
              setToastMessage('Navigating to Project Overview');
              setToastOpen(true);
            }}
          />
        </div>
      </section>

      {/* Reference Screen 2 Matches: Event Rows × 2 */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-title-2 font-semibold text-sb-navy">Today&apos;s Events (Reference Screen 2)</h2>
          <span className="text-caption text-sb-navy font-semibold cursor-pointer hover:underline">See All</span>
        </div>
        <div className="bg-sb-white rounded-[20px] p-2 border border-sb-border shadow-e1 divide-y divide-sb-border">
          <EventRow
            id="e-2091"
            title="Welding — Line 24-XX"
            timestamp="08:42 AM"
            status="Verified"
            source="voice"
            thumbnailSrc="/images/thumb-welding.jpg"
            onClick={() => {
              setToastMessage('Opened Event E-2091');
              setToastOpen(true);
            }}
          />
          <EventRow
            id="e-2092"
            title="Trenching — KP 184.2"
            timestamp="09:17 AM"
            status="Review"
            source="voice"
            thumbnailSrc="/images/thumb-trenching.jpg"
            onClick={() => {
              setToastMessage('Opened Event E-2092');
              setToastOpen(true);
            }}
          />
        </div>
      </section>

      {/* Reference Screen 3 Match: Schedule Context & Evidence Chain */}
      <section className="mb-12">
        <h2 className="text-title-2 font-semibold text-sb-navy mb-3">Schedule Context & Chain (Reference Screen 3)</h2>
        <div className="space-y-4">
          <ScheduleContext
            onViewInP6Click={() => {
              setToastMessage('Opened in-app P6 Network View (Baseline: P6 XER v3)');
              setToastOpen(true);
            }}
            onNodeClick={(node) => {
              setToastMessage(`Selected activity: ${node.id} - ${node.name}`);
              setToastOpen(true);
            }}
          />

          <div className="p-4 bg-sb-white rounded-[16px] border border-sb-border shadow-e1">
            <div className="text-caption font-semibold text-sb-navy mb-2">Evidence Linked Chain</div>
            <EvidenceChain
              currentStep={3}
              onStepClick={(step, idx) => {
                setToastMessage(`Inspected evidence step: ${step} (#${idx + 1})`);
                setToastOpen(true);
              }}
            />
          </div>

          <div className="p-4 bg-sb-white rounded-[16px] border border-sb-border shadow-e1 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-caption text-sb-ink-2">AI Confidence:</span>
              <ConfidenceBadge confidence={94} />
              <ConfidenceBadge confidence={78} />
              <ConfidenceBadge confidence={41} />
            </div>
            <FreshnessClock />
          </div>

          <div className="p-4 bg-sb-white rounded-[16px] border border-sb-border shadow-e1">
            <div className="text-caption font-semibold text-sb-navy mb-2">Voice Report Audio Waveform</div>
            <Waveform
              progress={waveformProgress}
              onSeek={(p) => setWaveformProgress(p)}
            />
            <div className="text-caption text-sb-ink-3 mt-1 font-mono text-mono-s">
              Scrub position: {Math.round(waveformProgress * 100)}% · Click bars to seek
            </div>
          </div>
        </div>
      </section>

      {/* Status Vocabulary: StatusPill × 7 */}
      <section className="mb-12">
        <h2 className="text-title-2 font-semibold text-sb-navy mb-3">Status Vocabulary (All 7 Statuses)</h2>
        <div className="bg-sb-white p-5 rounded-[20px] border border-sb-border shadow-e1 flex flex-wrap gap-3">
          {statuses.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </section>

      {/* Primary & Interactive Buttons */}
      <section className="mb-12">
        <h2 className="text-title-2 font-semibold text-sb-navy mb-4">Button System (SPEC §4.5)</h2>
        <div className="bg-sb-white p-6 rounded-[20px] border border-sb-border shadow-e1 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              variant="primary"
              onClick={() => {
                setToastMessage('Match approved');
                setToastOpen(true);
              }}
              data-testid="btn-primary-approve"
            >
              Approve Match
            </Button>

            <Button
              variant="outline"
              onClick={() => setSheetOpen(true)}
              data-testid="btn-outline-sheet"
            >
              Choose Another
            </Button>

            <Button
              variant="destructive-outline"
              onClick={() => setDialogOpen(true)}
              data-testid="btn-destructive-unmatched"
            >
              Unmatched
            </Button>

            <Button variant="primary" loading>
              Loading Spinner
            </Button>

            <Button variant="primary" disabled>
              Disabled Pill
            </Button>
          </div>

          <div className="pt-3 border-t border-sb-border flex items-center gap-4">
            <span className="text-caption text-sb-ink-3">Field CTA Variant (56px):</span>
            <Button
              size="field"
              variant="primary"
              onClick={() => {
                setToastMessage('Field action executed');
                setToastOpen(true);
              }}
            >
              Submit Field Report ›
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Navigation, Filters & Controls */}
      <section className="mb-12">
        <h2 className="text-title-2 font-semibold text-sb-navy mb-4">Filters, Tabs & Controls</h2>
        <div className="bg-sb-white p-6 rounded-[20px] border border-sb-border shadow-e1 space-y-6">
          {/* Underline Tabs */}
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Underline Tabs</span>
            <UnderlineTabs
              tabs={[
                { id: 'all', label: 'Overview' },
                { id: 'activities', label: 'Activities', count: 12 },
                { id: 'evidence', label: 'Evidence' },
                { id: 'teams', label: 'Teams' },
              ]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id)}
            />
          </div>

          {/* Pill Filters */}
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Pill Filters</span>
            <div className="flex flex-wrap gap-2">
              <PillFilter
                active={activePill === 'all'}
                onClick={() => setActivePill('all')}
                icon={<Layers className="w-4 h-4" strokeWidth={1.5} />}
              >
                All
              </PillFilter>
              <PillFilter
                active={activePill === 'progress'}
                onClick={() => setActivePill('progress')}
                icon={<TrendingUp className="w-4 h-4" strokeWidth={1.5} />}
              >
                Progress
              </PillFilter>
              <PillFilter
                active={activePill === 'tasks'}
                onClick={() => setActivePill('tasks')}
                icon={<CheckCircle className="w-4 h-4" strokeWidth={1.5} />}
              >
                Tasks
              </PillFilter>
              <PillFilter
                active={activePill === 'evidence'}
                onClick={() => setActivePill('evidence')}
                icon={<FileText className="w-4 h-4" strokeWidth={1.5} />}
              >
                Evidence
              </PillFilter>
            </div>
          </div>

          {/* Segmented Control */}
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Segmented Control</span>
            <Segmented
              options={[
                { value: 'mine', label: 'Mine' },
                { value: 'crews', label: 'All crews' },
              ]}
              value={segmentedVal}
              onChange={(v) => setSegmentedVal(v)}
            />
          </div>

          {/* Chips */}
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Extracted Chips</span>
            <div className="flex flex-wrap gap-2">
              <Chip onTap={() => setSheetOpen(true)}>Welding</Chip>
              <Chip onTap={() => setSheetOpen(true)}>Spool 17</Chip>
              <Chip onTap={() => setSheetOpen(true)}>Line 24-XX</Chip>
              <Chip variant="confirmed">Completed</Chip>
            </div>
          </div>

          {/* Search Field */}
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Search Field</span>
            <SearchField
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFilterClick={() => {
                setToastMessage('Opened Search Filters');
                setToastOpen(true);
              }}
            />
          </div>
        </div>
      </section>

      {/* Stepper, Form, Avatar & Skeleton */}
      <section className="mb-12">
        <h2 className="text-title-2 font-semibold text-sb-navy mb-4">Forms, Stepper, Skeletons & Avatars</h2>
        <div className="bg-sb-white p-6 rounded-[20px] border border-sb-border shadow-e1 space-y-6">
          <div>
            <span className="text-caption font-semibold text-sb-navy block mb-2">Workflow Stepper</span>
            <Stepper
              steps={['Upload file', 'Map columns', 'Process rows']}
              currentStep={stepperStep}
              onStepClick={(s) => setStepperStep(s)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee ID" caption="6-digit uppercase identifier" required>
              <input
                type="text"
                placeholder="SUP-0412"
                className="h-12 px-4 rounded-full border border-sb-border text-callout font-mono focus:border-sb-navy focus:outline-none"
              />
            </FormField>

            <FormField label="PIN Code" caption="Numeric keypad auto-advances" required>
              <PinInput
                value={pinValue}
                onChange={(val) => setPinValue(val)}
              />
            </FormField>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-sb-border">
            <Avatar name="Rahul Patil" size="lg" src="/images/avatar-rahul.jpg" />
            <Avatar name="Meera Nair" size="md" />
            <Avatar name="Arvind Deshmukh" size="sm" />
            <div className="text-caption text-sb-ink-2">
              Avatars: Rahul Patil (Field Supervisor), Meera Nair (Planner), Arvind Deshmukh (PM)
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-sb-border">
            <span className="text-caption font-semibold text-sb-navy block">Flat Skeleton (No shimmer sweep)</span>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <EmptyState
            message="No pending activities found in queue."
            actionLabel="Refresh Queue"
            onAction={() => {
              setToastMessage('Queue refreshed');
              setToastOpen(true);
            }}
          />
        </div>
      </section>

      {/* Interactive Sheet Component */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Choose Another Activity"
        description="Select a candidate activity to link with this field evidence."
        data-testid="interactive-sheet"
      >
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-[16px] bg-sb-bg border border-sb-border flex items-center justify-between cursor-pointer hover:border-sb-navy/40">
            <div>
              <div className="font-mono text-mono-m font-semibold text-sb-navy">PIP-24-017</div>
              <div className="text-caption text-sb-ink-2">Weld Piping System 24-XX</div>
            </div>
            <ConfidenceBadge confidence={94} />
          </div>

          <div className="p-3.5 rounded-[16px] bg-sb-bg border border-sb-border flex items-center justify-between cursor-pointer hover:border-sb-navy/40">
            <div>
              <div className="font-mono text-mono-m font-semibold text-sb-navy">PIP-24-018</div>
              <div className="text-caption text-sb-ink-2">NDT & Coating Line 24-XX</div>
            </div>
            <ConfidenceBadge confidence={78} />
          </div>

          <Button
            variant="primary"
            className="w-full mt-4"
            onClick={() => {
              setSheetOpen(false);
              setToastMessage('Match updated to PIP-24-017');
              setToastOpen(true);
            }}
          >
            Confirm Match
          </Button>
        </div>
      </Sheet>

      {/* Interactive Dialog Component */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Mark as Unmatched?"
        description="This field report will be categorized as unmatched and sent to the supervisor for clarification."
        confirmLabel="Mark Unmatched"
        destructive={true}
        onConfirm={() => {
          setToastMessage('Event marked as Unmatched · Undo');
          setToastOpen(true);
        }}
      />

      {/* Toast Notification with Undo */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        onUndo={() => {
          setToastMessage('Approval reversed');
          setToastOpen(true);
        }}
      />
    </div>
  );
}
