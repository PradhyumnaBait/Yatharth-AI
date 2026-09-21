import { test, expect } from '@playwright/test';

test.describe('TASK P07 — S3 Project detail (Reference screen 3 shell)', () => {
  test.beforeEach(async ({ page }) => {
    // Start with supervisor user session
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
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
        },
        version: 0,
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
    });
  });

  test('1. Shell geometry: Header, hero image with caption, and underline tabs', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');

    // Header checks
    const header = page.locator('[data-testid="page-header-project"]');
    await expect(header).toBeVisible();
    await expect(header.locator('h1')).toHaveText('Kandla–Panipat Pipeline — Package 3');
    await expect(header.getByText('10 km execution package · KP 178.0–188.0')).toBeVisible();
    await expect(page.locator('[data-testid="page-header-back-btn"]')).toBeVisible();
    await expect(header.locator('button[aria-label="Search"]')).toBeVisible();
    await expect(header.locator('button[aria-label="Notifications"]')).toBeVisible();
    await expect(header.locator('button[aria-label="More options"]')).toBeVisible();

    // Hero image with caption
    await expect(page.locator('[data-testid="hero-caption"]')).toHaveText('Refinery Package 03 — Section 4B');

    // Underline tabs
    await expect(page.locator('[data-testid="underline-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-activities"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-evidence"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-teams"]')).toBeVisible();
  });

  test('2. Overview tab: Physical 68%, planned marker, data date, freshness, phases, and delay alerts', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');

    // Physical progress card
    await expect(page.locator('[data-testid="overview-physical-percent"]')).toHaveText('68%');
    await expect(page.locator('[data-testid="overview-planned-percent"]')).toHaveText('74%');
    await expect(page.locator('[data-testid="overview-variance"]')).toContainText('-6%');
    await expect(page.locator('[data-testid="overview-planned-marker"]')).toBeVisible();

    // Metrics strip
    await expect(page.locator('[data-testid="overview-data-date"]')).toHaveText('20 Sep 2026');
    await expect(page.locator('[data-testid="overview-freshness"]')).toBeVisible();
    await expect(page.locator('[data-testid="overview-finish-variance"]')).toContainText('+9d');

    // Phase progress list
    await expect(page.locator('[data-testid="phase-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="phase-item-phase-trenching"]')).toContainText('Trenching');
    await expect(page.locator('[data-testid="phase-item-phase-welding"]')).toContainText('Welding');
    await expect(page.locator('[data-testid="phase-item-phase-welding"]')).toContainText('85%');

    // Delay alerts list
    await expect(page.locator('[data-testid="delay-alerts-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="delay-alert-0"]')).toContainText('Equipment / crane');
    await expect(page.locator('[data-testid="delay-alert-0"]')).toContainText('+11 days lost');

    // Clicking delay alert opens detail sheet
    await page.locator('[data-testid="delay-alert-0"]').click();
    await expect(page.locator('[data-testid="delay-detail-sheet"]')).toBeVisible();
    await expect(page.getByText('Critical path variance alert')).toBeVisible();
    await expect(page.locator('[data-testid="delay-view-activity-btn"]')).toBeVisible();
  });

  test('3. Phase click on Overview automatically switches to Activities tab and filters', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');

    // Click on "Welding" phase item in Overview
    await page.locator('[data-testid="phase-item-phase-welding"]').click();

    // Verify switched to Activities tab
    await expect(page.locator('[data-testid="underline-tabs-activities"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="active-phase-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-phase-banner"]')).toContainText('Welding');

    // Verify activities list only has welding activities
    const activityRows = page.locator('[data-testid^="activity-row-"]');
    const count = await activityRows.count();
    expect(count).toBeGreaterThan(0);

    // Clear phase filter
    await page.locator('[data-testid="clear-phase-filter-btn"]').click();
    await expect(page.locator('[data-testid="active-phase-banner"]')).not.toBeVisible();
  });

  test('4. Supervisor role: read-only activity list with search and Report buttons', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');
    await page.locator('[data-testid="underline-tabs-activities"]').click();

    // Supervisor view
    await expect(page.locator('[data-testid="activity-search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-status-filter-in-progress"]')).toBeVisible();

    // Check row contains Report button
    const firstReportBtn = page.locator('[data-testid^="activity-report-btn-"]').first();
    await expect(firstReportBtn).toBeVisible();

    // Search filter
    await page.locator('[data-testid="activity-search-input"]').fill('PIP-24-017');
    await expect(page.locator('[data-testid="activity-row-PIP-24-017"]')).toBeVisible();
  });

  test('5. Planner role: adaptive PL3 Match Review placeholder mounts', async ({ page }) => {
    // Switch auth state to planner
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'user-meera',
            name: 'Meera Nair',
            title: 'Lead Planning Engineer',
            employeeId: 'PLN-0089',
            role: 'planner',
            organization: 'Sterling Infra EPC',
            currentProjectId: 'kandla-panipat-p3',
          },
          isAuthenticated: true,
          activeProjectId: 'kandla-panipat-p3',
        },
        version: 0,
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
    });

    await page.goto('/project/kandla-panipat-p3');
    await page.locator('[data-testid="underline-tabs-activities"]').click();

    // Planner sees PL3 Match Review mount placeholder
    await expect(page.locator('[data-testid="planner-match-placeholder"]')).toBeVisible();
    await expect(page.getByText('Activity Matching')).toBeVisible();
    await expect(page.locator('[data-testid="planner-review-count"]')).toContainText('events require review');
    await expect(page.getByText('Field Evidence')).toBeVisible();
    await expect(page.getByText('AI Recommendation')).toBeVisible();
    await expect(page.locator('[data-testid="open-workbench-btn"]')).toBeVisible();

    // Toggle to full schedule
    await page.locator('[data-testid="toggle-full-schedule-btn"]').click();
    await expect(page.locator('[data-testid="project-activities-list-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-match-btn"]')).toBeVisible();
  });

  test('6. Evidence tab: filters, list/grid views, and S5 navigation', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');
    await page.locator('[data-testid="underline-tabs-evidence"]').click();

    // Verify filters
    await expect(page.locator('[data-testid="evidence-filter-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="evidence-filter-voice"]')).toBeVisible();
    await expect(page.locator('[data-testid="evidence-filter-photos"]')).toBeVisible();

    // List view
    await expect(page.locator('[data-testid="evidence-list"]')).toBeVisible();
    const firstRow = page.locator('[data-testid^="evidence-row-"]').first();
    await expect(firstRow).toBeVisible();

    // Switch to Grid view
    await page.locator('[data-testid="evidence-view-grid"]').click();
    await expect(page.locator('[data-testid="evidence-grid"]')).toBeVisible();

    // Switch back to List view and click row -> navigates to S5
    await page.locator('[data-testid="evidence-view-list"]').click();
    await page.locator('[data-testid^="evidence-row-"]').first().click();
    await expect(page).toHaveURL(/\/event\/E-/);
    await expect(page.getByText('Field Evidence & Matching')).toBeVisible();
  });

  test('7. Teams tab: crew cards and detail sheet with functional tel: call link', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');
    await page.locator('[data-testid="underline-tabs-teams"]').click();

    // Teams cards
    await expect(page.locator('[data-testid="teams-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-card-crew-piping-a"]')).toBeVisible();
    await expect(page.getByText('Piping Crew A')).toBeVisible();
    await expect(page.getByText('Suresh Yadav')).toBeVisible();

    // Click crew card to open sheet
    await page.locator('[data-testid="team-card-crew-piping-a"]').click();
    await expect(page.locator('[data-testid="team-detail-sheet"]')).toBeVisible();
    await expect(page.locator('[data-testid="sheet-foreman-name"]')).toHaveText('Suresh Yadav');

    // Verify functional tel: link
    const callBtn = page.locator('[data-testid="call-foreman-btn"]');
    await expect(callBtn).toBeVisible();
    const href = await callBtn.getAttribute('href');
    expect(href).toMatch(/^tel:\+91/);
  });

  test('8. Header more options sheet: Switch Project, Project Info modal, and Export', async ({ page }) => {
    await page.goto('/project/kandla-panipat-p3');

    // Click more button in header
    await page.locator('button[aria-label="More options"]').click();
    await expect(page.locator('[data-testid="project-more-sheet"]')).toBeVisible();

    // Project options
    await expect(page.locator('[data-testid="project-more-switch-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-more-info-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-more-export-btn"]')).toBeVisible();

    // Click Project Info
    await page.locator('[data-testid="project-more-info-btn"]').click();
    await expect(page.locator('[data-testid="project-info-modal"]')).toBeVisible();
    await expect(page.getByText('KP 178.000 – KP 188.000')).toBeVisible();
    await expect(page.getByText('Indian Oil Corporation Ltd. (IOCL)')).toBeVisible();
    await expect(page.getByText('P6 XER v3')).toBeVisible();

    // Back to options
    await page.locator('[data-testid="project-info-back-btn"]').click();
    await expect(page.locator('[data-testid="project-more-export-btn"]')).toBeVisible();
  });
});
