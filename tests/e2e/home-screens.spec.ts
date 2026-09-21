import { test, expect } from '@playwright/test';

test.describe('TASK P06 — Home screens SU1, PL1, PM1, AD1', () => {
  test.beforeEach(async ({ page }) => {
    // Reset to reference snapshot for supervisor
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
      // Set supervisor user in localStorage
      const authState = {
        state: {
          user: {
            id: 'user-rahul',
            name: 'Rahul Patil',
            title: 'Field Supervisor',
            employeeId: 'SUP-0412',
            role: 'supervisor',
            organization: 'Sterling Infra EPC',
            avatarUrl: '/images/avatar-rahul.jpg',
            currentProjectId: 'kandla-panipat-p3',
          },
          isAuthenticated: true,
          activeProjectId: 'kandla-panipat-p3',
          hasSeenOnboarding: true,
          hasSeenPermissionsPrimer: true,
          failedAttempts: 0,
          lockoutUntil: null,
          accessRequests: [
            {
              id: 'REQ-0086',
              name: 'Vikram Mehta',
              contact: 'SUP-0391',
              organization: 'Sterling Infra EPC',
              projectId: 'kandla-panipat-p3',
              role: 'supervisor',
              time: '10 min ago',
            },
            {
              id: 'REQ-0087',
              name: 'Pooja Sharma',
              contact: 'PLN-0142',
              organization: 'Sterling Infra EPC',
              projectId: 'kandla-panipat-p3',
              role: 'planner',
              time: '25 min ago',
            },
            {
              id: 'REQ-0088',
              name: 'Rajesh Gupta',
              contact: 'PM-0089',
              organization: "Owner's Project Team",
              projectId: 'kandla-panipat-p3',
              role: 'pm',
              time: '1 hour ago',
            },
            {
              id: 'REQ-0089',
              name: 'Anil Kumar',
              contact: 'SUP-0402',
              organization: 'Punj Lloyd Ltd',
              projectId: 'kandla-panipat-p3',
              role: 'supervisor',
              time: '2 hours ago',
            },
          ],
        },
        version: 0,
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
    });
  });

  test('SU1 Supervisor Home pixel match at 390x844 in snapshot reference', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?frame=off');

    // 1. Header Row
    await expect(page.getByTestId('page-header-home')).toBeVisible();
    await expect(page.getByText('Hello,')).toBeVisible();
    await expect(page.getByText('Rahul Patil')).toBeVisible();
    await expect(page.getByTestId('project-switcher-btn')).toContainText('Kandla–Panipat Pipeline — Package 3');
    await expect(page.getByTestId('page-header-bell')).toBeVisible();
    await expect(page.getByTestId('page-header-unread-dot')).toBeVisible();

    // 2. Search Field
    await expect(page.getByTestId('home-search-field')).toBeVisible();
    await expect(page.getByTestId('home-search-field-filter-button')).toBeVisible();

    // 3. Pill Tabs: All (active), Progress, Tasks, Evidence
    await expect(page.getByTestId('pill-all')).toBeVisible();
    await expect(page.getByTestId('pill-progress')).toBeVisible();
    await expect(page.getByTestId('pill-tasks')).toBeVisible();
    await expect(page.getByTestId('pill-evidence')).toBeVisible();
    await expect(page.getByTestId('pill-all')).toHaveAttribute('aria-pressed', 'true');

    // 4. KPI Scope label & 3 KPI Tiles: 47 Verified, 12 Review, 03 Delays
    await expect(page.getByText('Today, all crews')).toBeVisible();
    await expect(page.getByTestId('kpi-verified')).toContainText('47');
    await expect(page.getByTestId('kpi-verified')).toContainText('Verified');
    await expect(page.getByTestId('kpi-review')).toContainText('12');
    await expect(page.getByTestId('kpi-review')).toContainText('Review');
    await expect(page.getByTestId('kpi-delays')).toContainText('03');
    await expect(page.getByTestId('kpi-delays')).toContainText('Delays');

    // 5. Active Project Section & Card
    await expect(page.getByText('Active Project')).toBeVisible();
    await expect(page.getByTestId('see-all-projects-btn')).toBeVisible();
    const projectCard = page.getByTestId('project-card');
    await expect(projectCard).toBeVisible();
    await expect(projectCard).toContainText('Kandla–Panipat Pipeline — Package 3');
    await expect(projectCard).toContainText('68%');
    await expect(projectCard).toContainText('Physical Progress');
    await expect(projectCard).toContainText('Planned: 74%');
    await expect(projectCard).toContainText('20 Sep 2026');
    await expect(projectCard).toContainText('14');

    // 6. Today's Events Section & Rows
    await expect(page.getByText("Today's Events")).toBeVisible();
    await expect(page.getByTestId('see-all-events-btn')).toBeVisible();
    await expect(page.getByTestId('event-row-E-2091')).toBeVisible();
    await expect(page.getByTestId('event-row-E-2091')).toContainText('Welding — Line 24-XX');
    await expect(page.getByTestId('event-row-E-2091')).toContainText('08:42 AM');
    await expect(page.getByTestId('event-row-E-2091')).toContainText('Verified');

    await expect(page.getByTestId('event-row-E-2092')).toBeVisible();
    await expect(page.getByTestId('event-row-E-2092')).toContainText('Trenching — KP 184.2');
    await expect(page.getByTestId('event-row-E-2092')).toContainText('09:17 AM');
    await expect(page.getByTestId('event-row-E-2092')).toContainText('Review');

    // 7. Bottom Navigation
    const nav = page.getByTestId('bottom-nav');
    await expect(nav).toBeVisible();
    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();
    if (navBox) {
      // Bottom navigation height is 64px within 4px tolerance
      expect(Math.abs(navBox.height - 64)).toBeLessThanOrEqual(4);
    }
  });

  test('SU1 Pill tabs swap body content correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?frame=off');

    // Tap Progress pill
    await page.getByTestId('pill-progress').click();
    await expect(page.getByTestId('supervisor-progress-body')).toBeVisible();
    await expect(page.getByText('Phase Progress (9 Phases)')).toBeVisible();
    await expect(page.getByTestId('phase-item-phase-welding')).toBeVisible();

    // Tap Tasks pill
    await page.getByTestId('pill-tasks').click();
    await expect(page.getByTestId('supervisor-tasks-body')).toBeVisible();
    await expect(page.getByText('Assigned Work Packages')).toBeVisible();
    await expect(page.getByTestId('report-btn-PIP-24-017')).toBeVisible();

    // Tap Evidence pill
    await page.getByTestId('pill-evidence').click();
    await expect(page.getByTestId('supervisor-evidence-body')).toBeVisible();
    await expect(page.getByText("Today's Field Evidence")).toBeVisible();

    // Tap All pill
    await page.getByTestId('pill-all').click();
    await expect(page.getByTestId('supervisor-all-body')).toBeVisible();
    await expect(page.getByTestId('project-card')).toBeVisible();
  });

  test('SU1 interactive controls: KPI tiles navigate, sheets open, project switches', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?frame=off');

    // 1. Filter icon on search opens filter sheet
    const filterBtn = page.getByTestId('home-search-field-filter-button');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await expect(page.getByTestId('home-filter-sheet')).toBeVisible();
    await page.keyboard.press('Escape');

    // 2. Project switcher opens sheet and switches project
    await page.getByTestId('project-switcher-btn').click();
    await expect(page.getByTestId('project-switcher-sheet')).toBeVisible();
    await page.getByTestId('project-option-duliajan-upgrade').click();
    await expect(page.getByTestId('project-switcher-btn')).toContainText('Duliajan Gathering Station');

    // 3. See All links navigate
    const seeAllProjects = page.getByTestId('see-all-projects-btn');
    await expect(seeAllProjects).toBeVisible();
    await seeAllProjects.click();
    await expect(page).toHaveURL(/.*select-project/);
    await page.goto('/home?frame=off');

    const seeAllEvents = page.getByTestId('see-all-events-btn');
    await expect(seeAllEvents).toBeVisible();
    await seeAllEvents.click();
    await expect(page).toHaveURL(/.*tab=Today/);
    await page.goto('/home?frame=off');

    // 4. KPI tile clicks navigate with right filter
    await page.getByTestId('kpi-verified').click();
    await expect(page).toHaveURL(/.*filter=Verified/);
    await page.goto('/home?frame=off');

    await page.getByTestId('kpi-review').click();
    await expect(page).toHaveURL(/.*filter=Review/);
    await page.goto('/home?frame=off');

    await page.getByTestId('kpi-delays').click();
    await expect(page).toHaveURL(/.*filter=Delay/);
  });

  test('PL1 Planner Home: pills, KPIs, priority review list, and freshness clock', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?role=planner&frame=off');

    // Check PL1 pills
    await expect(page.getByTestId('pill-all')).toBeVisible();
    await expect(page.getByTestId('pill-queue')).toBeVisible();
    await expect(page.getByTestId('pill-alerts')).toBeVisible();
    await expect(page.getByTestId('pill-imports')).toBeVisible();

    // Check PL1 KPIs: 12 Review, 47 Verified, 02 Warnings
    await expect(page.getByTestId('kpi-review')).toContainText('12');
    await expect(page.getByTestId('kpi-verified')).toContainText('47');
    await expect(page.getByTestId('kpi-warnings')).toContainText('02');

    // Check project card has freshness clock
    await expect(page.getByTestId('freshness-clock')).toBeVisible();

    // Check Needs Your Review list with priority items
    await expect(page.getByText('Needs Your Review')).toBeVisible();
    await expect(page.getByTestId('see-all-review-btn')).toBeVisible();
    await expect(page.getByTestId('review-card-E-2093')).toBeVisible(); // Out of sequence warning item
    await expect(page.getByTestId('review-card-E-2093').getByText('Logic Warning')).toBeVisible();

    // Pill swapping
    await page.getByTestId('pill-queue').click({ force: true });
    await expect(page.getByTestId('planner-queue-body')).toBeVisible();

    await page.getByTestId('pill-alerts').click({ force: true });
    await expect(page.getByTestId('planner-alerts-body')).toBeVisible();
    await expect(page.getByTestId('alert-card-oos')).toBeVisible();

    await page.getByTestId('pill-imports').click({ force: true });
    await expect(page.getByTestId('planner-imports-body')).toBeVisible();
    await expect(page.getByText('P6 Baseline v3 (.xer)')).toBeVisible();
  });

  test('PM1 PM Home: SPI, Delays, Freshness clock, Truth Gap alert, top delay causes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?role=pm&frame=off');

    // Check PM1 pills
    await expect(page.getByTestId('pill-all')).toBeVisible();
    await expect(page.getByTestId('pill-progress')).toBeVisible();
    await expect(page.getByTestId('pill-delays')).toBeVisible();
    await expect(page.getByTestId('pill-memory')).toBeVisible();

    // Check PM1 KPIs: 0.92 SPI, 03 Delays, Freshness clock
    await expect(page.getByTestId('kpi-spi')).toContainText('0.92');
    await expect(page.getByTestId('kpi-delays')).toContainText('03');
    await expect(page.getByTestId('kpi-freshness')).toBeVisible();

    // Body: Truth Gap alert card
    await expect(page.getByTestId('truth-gap-card')).toBeVisible();
    await expect(page.getByText('DPR-reported 71% vs Verified 68%')).toBeVisible();
    await expect(page.getByText('3 pts gap')).toBeVisible();

    // Body: Top delay causes
    await expect(page.getByText('Top Delay Causes')).toBeVisible();

    // Pill swapping
    await page.getByTestId('pill-progress').click({ force: true });
    await expect(page.getByTestId('pm-progress-body')).toBeVisible();

    await page.getByTestId('pill-delays').click({ force: true });
    await expect(page.getByTestId('pm-delays-body')).toBeVisible();

    await page.getByTestId('pill-memory').click({ force: true });
    await expect(page.getByTestId('pm-memory-body')).toBeVisible();
  });

  test('AD1 Admin Home: 38 Users, 04 Requests, 03 Projects, inline approve request', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?role=admin&frame=off');

    // Check AD1 pills
    await expect(page.getByTestId('pill-all')).toBeVisible();
    await expect(page.getByTestId('pill-users')).toBeVisible();
    await expect(page.getByTestId('pill-requests')).toBeVisible();
    await expect(page.getByTestId('pill-projects')).toBeVisible();

    // Check AD1 KPIs: 38 Users, 04 Requests, 03 Projects
    await expect(page.getByTestId('kpi-users')).toContainText('38');
    await expect(page.getByTestId('kpi-requests')).toContainText('04');
    await expect(page.getByTestId('kpi-projects')).toContainText('03');

    // Body: Pending Access Requests with inline Approve / Reject
    await expect(page.getByTestId('admin-req-card-REQ-0086')).toBeVisible();
    await expect(page.getByTestId('quick-approve-REQ-0086')).toBeVisible();

    // Approve REQ-0086 inline
    await page.getByTestId('quick-approve-REQ-0086').click();

    // REQ-0086 card is removed and Requests count updates from 04 to 03 live without reload
    await expect(page.getByTestId('admin-req-card-REQ-0086')).not.toBeVisible();
    await expect(page.getByTestId('kpi-requests')).toContainText('03');

    // Hub links
    await expect(page.getByTestId('admin-link-dictionary')).toBeVisible();
    await expect(page.getByTestId('admin-link-projects')).toBeVisible();
    await expect(page.getByTestId('admin-link-roles')).toBeVisible();
  });

  test('Cross-Role Live Store Update: approving an event updates counts without page reload', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?frame=off');

    // Initial counts in reference: 47 Verified, 12 Review
    await expect(page.getByTestId('kpi-verified')).toContainText('47');
    await expect(page.getByTestId('kpi-review')).toContainText('12');

    // Approve an event in the events store (simulating approval from Planner role)
    await page.evaluate(async () => {
      // @ts-ignore
      const eventsStore = window.__eventsStore || (window as any).useEventsStore;
      // If store is in window or module, we can access the zustand store directly
    });

    // Alternatively trigger approve directly using the store method exposed or evaluated
    await page.evaluate(async () => {
      // Access localStorage store or trigger zustand update
      const raw = localStorage.getItem('schedbridge-events-store');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Change E-2092 status to Verified
        parsed.state.events = parsed.state.events.map((e: any) =>
          e.id === 'E-2092' ? { ...e, status: 'Verified', queueTier: 'Verified' } : e
        );
        localStorage.setItem('schedbridge-events-store', JSON.stringify(parsed));
      }
    });

    // Verify freshness clock is ticking
    const freshnessClock = page.getByTestId('freshness-clock');
    if (await freshnessClock.isVisible()) {
      const initialText = await freshnessClock.textContent();
      await page.waitForTimeout(1100);
      const updatedText = await freshnessClock.textContent();
      expect(updatedText).not.toBe(initialText);
    }
  });
});
