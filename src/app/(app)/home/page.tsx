'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutGrid,
  TrendingUp,
  CheckSquare,
  Camera,
  Layers,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Brain,
  Users,
  Inbox,
  CheckCircle2,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shell/PageHeader';
import { PageContainer } from '@/components/shell/PageContainer';
import { SearchField } from '@/components/ui/SearchField';
import { PillFilter } from '@/components/ui/PillFilter';
import { KpiTile } from '@/components/ui/KpiTile';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { SupervisorHome, SupervisorPill } from '@/features/home/SupervisorHome';
import { PlannerHome, PlannerPill } from '@/features/home/PlannerHome';
import { PmHome, PmPill } from '@/features/home/PmHome';
import { AdminHome, AdminPill } from '@/features/home/AdminHome';
import {
  useEventsStore,
  useVerifiedEventsCount,
  useReviewEventsCount,
  useDelayEventsCount,
  useWarningEventsCount,
} from '@/store/events';
import { useProjectStore, useActiveProject, useSPI } from '@/store/project';
import { useAuthStore, UserRole } from '@/store/auth';
import { useTranslation } from '@/i18n/useTranslation';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const { user } = useAuthStore();
  const roleParam = searchParams.get('role') as UserRole | null;
  const role: UserRole = roleParam || user?.role || 'supervisor';

  const project = useActiveProject();
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore();
  const accessRequests = useAuthStore((state) => state.accessRequests);
  const { spi } = useSPI();

  // Reactive store selectors for KPI metrics
  const verifiedCount = useVerifiedEventsCount();
  const reviewCount = useReviewEventsCount();
  const delayCount = useDelayEventsCount();
  const warningCount = useWarningEventsCount();

  // Active pill state
  const [activePill, setActivePill] = useState<string>('all');
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Reset active pill when role changes
  useEffect(() => {
    setActivePill('all');
  }, [role]);

  // Sheets state
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected filter criteria
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Number formatting for KPIs (e.g. 3 -> "03", 47 -> "47")
  const formatKpi = (n: number) => String(n).padStart(2, '0');

  // Search placeholder by role
  const searchPlaceholder = {
    supervisor: 'Search activities, events...',
    planner: 'Find an activity in schedule...',
    pm: 'Search metrics, phases, delays...',
    admin: 'Search users, requests, settings...',
  }[role];

  // Pill definitions by role
  const pillsByRole: Record<
    UserRole,
    { id: string; label: string; icon: React.ReactNode }[]
  > = {
    supervisor: [
      { id: 'all', label: t('home.all'), icon: <LayoutGrid className="w-4 h-4" /> },
      { id: 'progress', label: t('home.progress'), icon: <TrendingUp className="w-4 h-4" /> },
      { id: 'tasks', label: t('home.tasks'), icon: <CheckSquare className="w-4 h-4" /> },
      { id: 'evidence', label: t('home.evidence'), icon: <Camera className="w-4 h-4" /> },
    ],
    planner: [
      { id: 'all', label: t('home.all'), icon: <LayoutGrid className="w-4 h-4" /> },
      { id: 'queue', label: t('home.queue'), icon: <Clock className="w-4 h-4" /> },
      { id: 'alerts', label: t('home.alerts'), icon: <AlertTriangle className="w-4 h-4" /> },
      { id: 'imports', label: t('home.imports'), icon: <FileSpreadsheet className="w-4 h-4" /> },
    ],
    pm: [
      { id: 'all', label: t('home.all'), icon: <LayoutGrid className="w-4 h-4" /> },
      { id: 'progress', label: t('home.progress'), icon: <TrendingUp className="w-4 h-4" /> },
      { id: 'delays', label: t('home.delays'), icon: <AlertTriangle className="w-4 h-4" /> },
      { id: 'memory', label: t('home.memory'), icon: <Brain className="w-4 h-4" /> },
    ],
    admin: [
      { id: 'all', label: t('home.all'), icon: <LayoutGrid className="w-4 h-4" /> },
      { id: 'users', label: t('home.users'), icon: <Users className="w-4 h-4" /> },
      { id: 'requests', label: t('home.requests'), icon: <Inbox className="w-4 h-4" /> },
      { id: 'projects', label: t('home.projects'), icon: <Layers className="w-4 h-4" /> },
    ],
  };

  const currentPills = pillsByRole[role];

  // Role Key Insights (Summary → Key insight → Optional details → Drill-down)
  const keyInsights: Record<UserRole, { title: string; body: string; cta: string; route: string }> = {
    supervisor: {
      title: 'Field Execution Velocity',
      body: '47 activities verified today across 4 crews. Welding Crew B completed Spool 17 at Rack 4.',
      cta: 'View Reports',
      route: '/reports',
    },
    planner: {
      title: 'Triage Queue Status',
      body: `${reviewCount} events require match review before P6 baseline commit. Earliest from 08:42 AM.`,
      cta: 'Open Workbench',
      route: '/workbench',
    },
    pm: {
      title: 'Schedule Health & Variance',
      body: 'Current progress 68% vs 74% planned (SPI 0.92). 6-day slip on Spool Rack 4 welding critical path.',
      cta: 'View Analytics',
      route: '/analytics',
    },
    admin: {
      title: 'System & Governance State',
      body: '38 authenticated users active across 3 execution packages. 4 access requests pending review.',
      cta: 'Manage Users',
      route: '/admin/users',
    },
  };

  const currentInsight = keyInsights[role];

  return (
    <div className="flex flex-col min-h-full pb-8 bg-sb-bg" data-testid={`home-screen-${role}`}>
      {/* 1. Page Header with Project Switcher */}
      <PageHeader
        variant="home"
        projectName={project?.name || 'Kandla–Panipat Pipeline — Package 3'}
        hasUnreadNotifications={true}
        onProjectClick={() => setProjectSheetOpen(true)}
      />

      {/* 2. Structured Layout Container */}
      <PageContainer maxWidth="container" withGutter={false} withVerticalRhythm={false} className="space-y-sb-2">
        {/* Search Field */}
        <div className="px-4 lg:px-6 pb-1">
          <SearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            onFocus={() => router.push('/search')}
            onFilterClick={() => setFilterSheetOpen(true)}
            data-testid="home-search-field"
          />
        </div>

        {/* Pill Filter Tabs */}
        <div
          data-testid="pill-filter-row"
          className="px-4 lg:px-6 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar"
        >
          {currentPills.map((pill) => (
            <PillFilter
              key={pill.id}
              active={activePill === pill.id}
              icon={pill.icon}
              data-testid={`pill-${pill.id}`}
              onClick={() => setActivePill(pill.id)}
              className="flex-shrink-0"
            >
              {pill.label}
            </PillFilter>
          ))}
        </div>

        {/* 1. SUMMARY: Capped 3 KPI Tiles */}
        <section className="px-4 lg:px-6 pb-1">
          <div className="text-[11px] font-medium text-sb-ink-3 mb-1.5 px-0.5">
            {role === 'supervisor' && t('home.todayScope')}
            {role === 'planner' && 'Live triage queue'}
            {role === 'pm' && 'Current baseline package'}
            {role === 'admin' && 'Organization & system scope'}
          </div>

          <div className="grid grid-cols-3 gap-2" data-testid="kpi-tiles-grid">
            {role === 'supervisor' && (
              <>
                <KpiTile
                  number={formatKpi(verifiedCount)}
                  label={t('common.verified')}
                  statusColor="verified"
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-sb-verified" />}
                  onClick={() => router.push('/reports?filter=Verified')}
                  data-testid="kpi-verified"
                />
                <KpiTile
                  number={formatKpi(reviewCount)}
                  label={t('common.review')}
                  statusColor="review"
                  icon={<Clock className="w-3.5 h-3.5 text-sb-review" />}
                  onClick={() => router.push('/reports?filter=Review')}
                  data-testid="kpi-review"
                />
                <KpiTile
                  number={formatKpi(delayCount)}
                  label={t('common.delays')}
                  statusColor="critical"
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-sb-critical" />}
                  onClick={() => router.push('/reports?filter=Delay')}
                  data-testid="kpi-delays"
                />
              </>
            )}

            {role === 'planner' && (
              <>
                <KpiTile
                  number={formatKpi(reviewCount)}
                  label="Review"
                  statusColor="review"
                  icon={<Clock className="w-3.5 h-3.5 text-sb-review" />}
                  onClick={() => router.push('/workbench?segment=review')}
                  data-testid="kpi-review"
                />
                <KpiTile
                  number={formatKpi(verifiedCount)}
                  label="Verified"
                  statusColor="verified"
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-sb-verified" />}
                  onClick={() => router.push('/workbench?segment=done')}
                  data-testid="kpi-verified"
                />
                <KpiTile
                  number={formatKpi(warningCount)}
                  label="Warnings"
                  statusColor="critical"
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-sb-critical" />}
                  onClick={() => router.push('/workbench?segment=warnings')}
                  data-testid="kpi-warnings"
                />
              </>
            )}

            {role === 'pm' && (
              <>
                <KpiTile
                  number={spi.toFixed(2)}
                  label="SPI"
                  statusColor={spi >= 0.95 ? 'verified' : 'review'}
                  icon={<TrendingUp className="w-3.5 h-3.5 text-sb-review" />}
                  onClick={() => router.push('/analytics?tab=progress')}
                  data-testid="kpi-spi"
                />
                <KpiTile
                  number={formatKpi(delayCount)}
                  label="Delays"
                  statusColor="critical"
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-sb-critical" />}
                  onClick={() => router.push('/analytics?tab=delays')}
                  data-testid="kpi-delays"
                />
                <div
                  data-testid="kpi-freshness"
                  onClick={() => router.push('/analytics')}
                  className="w-full p-4 rounded-[16px] bg-sb-white border border-sb-border shadow-e1 text-left flex flex-col justify-between cursor-pointer sb-press-spring"
                >
                  <div className="flex items-start justify-between w-full">
                    <FreshnessClock showIcon={false} prefix="" className="text-num-l font-semibold text-sb-navy" />
                    <Clock className="w-3.5 h-3.5 text-sb-verified flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-sb-verified" />
                    <span className="text-caption font-medium text-sb-ink-2 truncate">Freshness</span>
                  </div>
                </div>
              </>
            )}

            {role === 'admin' && (
              <>
                <KpiTile
                  number="38"
                  label="Users"
                  statusColor="navy"
                  icon={<Users className="w-3.5 h-3.5 text-sb-navy" />}
                  onClick={() => router.push('/admin/users')}
                  data-testid="kpi-users"
                />
                <KpiTile
                  number={formatKpi(accessRequests.length)}
                  label="Requests"
                  statusColor="review"
                  icon={<Inbox className="w-3.5 h-3.5 text-sb-review" />}
                  onClick={() => router.push('/admin/requests')}
                  data-testid="kpi-requests"
                />
                <KpiTile
                  number={formatKpi(projects.length)}
                  label="Projects"
                  statusColor="verified"
                  icon={<Layers className="w-3.5 h-3.5 text-sb-verified" />}
                  onClick={() => router.push('/admin/projects')}
                  data-testid="kpi-projects"
                />
              </>
            )}
          </div>
        </section>

        {/* 2. KEY INSIGHT CARD */}
        <section className="px-4 lg:px-6">
          <div
            data-testid="home-key-insight-card"
            className="p-3.5 rounded-2xl bg-sb-navy-tint/60 border border-sb-navy/20 flex items-start justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-sb-navy text-sb-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sb-navy">
                  Key Insight · {currentInsight.title}
                </div>
                <p className="text-caption text-sb-ink font-medium leading-relaxed">
                  {currentInsight.body}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(currentInsight.route)}
              className="text-[11px] font-bold text-sb-navy hover:underline shrink-0 flex items-center gap-1 mt-1 font-mono"
            >
              <span>{currentInsight.cta}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        {/* 3. OPTIONAL DETAILS: Expandable Details & Drill-down Toggle */}
        <section className="px-4 lg:px-6">
          <button
            type="button"
            data-testid="home-details-toggle-btn"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full py-2 px-3 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy/30 text-caption font-semibold text-sb-navy flex items-center justify-between transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sb-ink-3" />
              <span>{detailsExpanded ? 'Hide Secondary Details' : 'View Discipline & Crew Details'}</span>
            </span>
            {detailsExpanded ? <ChevronUp className="w-4 h-4 text-sb-ink-3" /> : <ChevronDown className="w-4 h-4 text-sb-ink-3" />}
          </button>

          {detailsExpanded && (
            <div className="mt-2 p-3.5 bg-sb-white rounded-xl border border-sb-border space-y-3 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
                <div className="p-2 bg-sb-bg rounded-lg">
                  <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Piping</div>
                  <div className="font-bold text-sb-navy font-mono">72% Verified</div>
                </div>
                <div className="p-2 bg-sb-bg rounded-lg">
                  <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Civil</div>
                  <div className="font-bold text-sb-navy font-mono">64% Verified</div>
                </div>
                <div className="p-2 bg-sb-bg rounded-lg">
                  <div className="text-[10px] text-sb-ink-3 uppercase font-semibold">Electrical</div>
                  <div className="font-bold text-sb-navy font-mono">58% Verified</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3 pt-1 border-t border-sb-border/60">
                <span>Active Crews: 4 on site</span>
                <button
                  type="button"
                  onClick={() => router.push('/schedule')}
                  className="text-sb-navy font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>Full Schedule Breakdown ›</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 4. DRILL-DOWN: Role-Specific Body View */}
        <div className="px-0">
          {role === 'supervisor' && <SupervisorHome activePill={activePill as SupervisorPill} />}
          {role === 'planner' && <PlannerHome activePill={activePill as PlannerPill} />}
          {role === 'pm' && <PmHome activePill={activePill as PmPill} />}
          {role === 'admin' && <AdminHome activePill={activePill as AdminPill} />}
        </div>
      </PageContainer>

      {/* Filter Sheet */}
      <Sheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Filter Activities & Events"
        description="Select criteria to narrow results across field reports."
        data-testid="home-filter-sheet"
      >
        <div className="space-y-4 pt-2">
          {/* Discipline */}
          <div>
            <label className="text-caption font-semibold text-sb-navy block mb-2">
              Discipline
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Piping', 'Civil', 'Electrical', 'Mechanical'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDiscipline(d)}
                  className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
                    selectedDiscipline === d
                      ? 'bg-sb-navy text-sb-white border-sb-navy'
                      : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-navy-tint'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-caption font-semibold text-sb-navy block mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Verified', 'Review', 'Delay'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
                    selectedStatus === s
                      ? 'bg-sb-navy text-sb-white border-sb-navy'
                      : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-navy-tint'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4">
            <Button
              variant="primary"
              size="default"
              className="w-full"
              onClick={() => {
                setFilterSheetOpen(false);
                router.push(`/search?discipline=${selectedDiscipline}&status=${selectedStatus}`);
              }}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Project Switcher Sheet */}
      <Sheet
        open={projectSheetOpen}
        onOpenChange={setProjectSheetOpen}
        title="Select Project"
        description="Switch between active capital pipeline execution packages."
        data-testid="project-switcher-sheet"
      >
        <div className="space-y-2.5 pt-2">
          {projects.map((p) => {
            const isSelected = p.id === activeProjectId;
            return (
              <button
                key={p.id}
                type="button"
                data-testid={`project-option-${p.id}`}
                onClick={() => {
                  setActiveProjectId(p.id);
                  setProjectSheetOpen(false);
                }}
                className={`w-full p-4 rounded-[16px] border text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-sb-navy-tint border-sb-navy/50'
                    : 'bg-sb-white border-sb-border hover:bg-sb-navy-tint/40'
                }`}
              >
                <div>
                  <div className="text-callout font-bold text-sb-navy">{p.name}</div>
                  <div className="text-caption text-sb-ink-3 mt-0.5">
                    Data Date: {p.dataDate} • {p.physicalProgress}% Verified
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-sb-navy text-sb-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

function HomeSkeleton() {
  return (
    <div className="flex flex-col min-h-full pb-8 bg-sb-bg space-y-sb-2" data-testid="home-skeleton">
      <div className="h-14 bg-sb-white border-b border-sb-border px-4 flex items-center justify-between">
        <Skeleton variant="text" width={180} height={20} />
        <Skeleton variant="avatar" width={32} height={32} />
      </div>
      <div className="px-4 lg:px-6 space-y-3 pt-2">
        <Skeleton variant="rect" height={44} className="rounded-xl w-full" />
        <div className="flex gap-2">
          <Skeleton variant="pill" width={70} height={32} />
          <Skeleton variant="pill" width={80} height={32} />
          <Skeleton variant="pill" width={70} height={32} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton variant="card" height={88} className="rounded-2xl" />
          <Skeleton variant="card" height={88} className="rounded-2xl" />
          <Skeleton variant="card" height={88} className="rounded-2xl" />
        </div>
        <Skeleton variant="rect" height={80} className="rounded-2xl w-full" />
        <div className="space-y-2 pt-2">
          <Skeleton variant="row" height={72} className="rounded-xl" />
          <Skeleton variant="row" height={72} className="rounded-xl" />
          <Skeleton variant="row" height={72} className="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <React.Suspense fallback={<HomeSkeleton />}>
      <HomePageContent />
    </React.Suspense>
  );
}
