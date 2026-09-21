import { test, expect } from '@playwright/test';

test.describe('TASK P13 — PM Analytics, Ask, and Delay Detail (PM2, PM3, PM4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
      const authState = {
        state: {
          user: {
            id: 'user-arvind',
            name: 'Arvind Deshmukh',
            title: 'Project Manager',
            employeeId: 'PM-0031',
            role: 'pm',
            organization: "Owner's Project Team",
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

  test('PM2 Analytics: 3 numerals agree (68 / 74 / 0.92), S-curve scrubber, and phase table', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/analytics?frame=off');

    // 1. Check three numerals
    await expect(page.getByTestId('numeral-physical')).toContainText('68%');
    await expect(page.getByTestId('numeral-planned')).toContainText('74%');
    await expect(page.getByTestId('numeral-spi')).toContainText('0.92');

    // 2. S-curve chart & range toggle
    await expect(page.getByRole('img', { name: 'Progress S-curve chart' })).toBeVisible();
    await page.getByTestId('range-monthly').click();
    await page.getByTestId('range-weekly').click();

    // 3. Phase table rows
    await expect(page.getByTestId('phase-row-phase-trenching')).toBeVisible();
    await expect(page.getByTestId('phase-row-phase-welding')).toBeVisible();

    // 4. CSV download button
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-phase-csv').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('SchedBridge_Phase_Progress');
  });

  test('PM2 Truth Gap: sentence banner, paired bars, and drill-down sheet to unverified events', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/analytics?frame=off');

    // Switch to Truth Gap tab
    await page.getByTestId('underline-tabs-truth-gap').click();

    // Check sentence banner
    await expect(page.getByText('Reported progress runs 3 points ahead of verified progress.')).toBeVisible();

    // Check paired bar row and click to open drill-down sheet
    await page.getByTestId('truth-gap-row-phase-welding').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await expect(page.getByText('Pending Verification')).toBeVisible();
  });

  test('PM2 Delays & Memory: ranked bars, period toggle, season filter, and CSV benchmark export', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/analytics?frame=off');

    // 1. Delays tab
    await page.getByTestId('underline-tabs-delays').click();
    await expect(page.getByText('Ranked Delay Drivers')).toBeVisible();
    await page.getByTestId('delay-period-7d').click();
    await page.getByTestId('delay-period-all').click();
    await page.getByTestId('delay-period-30d').click();

    // Click equipment delay row -> navigates to PM4
    await page.getByTestId('delay-row-Equipment---crane').click();
    await expect(page).toHaveURL(/.*\/delays\/.*/);

    // Go back to Analytics
    await page.goto('/analytics?frame=off');

    // 2. Memory tab
    await page.getByTestId('underline-tabs-memory').click();
    await expect(page.getByText('Project Memory Insights')).toBeVisible();

    // Season filter
    await page.getByTestId('season-filter-monsoon').click();
    await expect(page.getByTestId('memory-card-mem-1')).toBeVisible();
    await page.getByTestId('season-filter-all').click();

    // Click card opens detail sheet
    await page.getByTestId('memory-card-mem-1').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await expect(page.getByTestId('bottom-sheet').getByText('Sample Size')).toBeVisible();

    // Close sheet by clicking outside or pressing Escape
    await page.keyboard.press('Escape');

    // Export Memory benchmark CSV
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-memory-csv').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('SchedBridge_Memory_Benchmark');
  });

  test('PM3 Ask: answers all 6 suggested questions from store and handles unsupported query', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ask?frame=off');

    // 1. Query 1: Piping delays
    await page.getByTestId('suggested-chip-which-piping-tasks-are-delayed-').click();
    await expect(page.getByTestId('ask-answer-card')).toBeVisible();
    await expect(page.getByText('PIP-24-021 (Lower Pipe KP 181.0–183.0) is delayed')).toBeVisible();
    await expect(page.getByTestId('ask-action-button')).toContainText('Open in Schedule');

    // 2. Query 2: Driving delay
    await page.getByTestId('suggested-chip-what-is-driving-the-delay-').click();
    await expect(page.getByText('Equipment/crane unavailability is the primary delay driver')).toBeVisible();
    await expect(page.getByTestId('ask-action-button')).toContainText('Open Analytics');

    // 3. Query 3: Trenching achievement
    await page.getByTestId('suggested-chip-what-did-trenching-achieve-this-week-').click();
    await expect(page.getByText('Trenching achieved +200 m progress at KP 184.2 today')).toBeVisible();

    // 4. Query 4: Out-of-sequence work
    await page.getByTestId('suggested-chip-show-out-of-sequence-work').click();
    await expect(page.getByText('1 out-of-sequence execution detected: E-2093')).toBeVisible();
    await expect(page.getByTestId('ask-action-button')).toContainText('Open in Workbench');

    // 5. Query 5: Pending review
    await page.getByTestId('suggested-chip-what-is-pending-review-').click();
    await expect(page.getByText('12 events are pending review in the Planner Workbench')).toBeVisible();

    // 6. Query 6: Critical path
    await page.getByTestId('suggested-chip-is-welding-on-the-critical-path-').click();
    await expect(page.getByText('Yes, Welding (PIP-24-017) is on the active critical path')).toBeVisible();

    // 7. Unsupported query
    await page.getByTestId('ask-input').fill('What is the weather tomorrow in Paris?');
    await page.getByTestId('ask-submit').click();
    await expect(page.getByText('I can answer questions about delays, progress by phase')).toBeVisible();
  });

  test('PM4 Delay Detail: displays 3 sections and downloads delay log CSV', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/delays/Equipment%20%2F%20crane?frame=off');

    // Header checks
    await expect(page.getByText('Equipment / crane')).toBeVisible();
    await expect(page.getByText('Critical path')).toBeVisible();
    await expect(page.getByText('11 days')).toBeVisible();

    // Section 1: Affected Activities
    await expect(page.getByText('1. Affected Activities')).toBeVisible();
    await expect(page.getByTestId('affected-activity-PIP-24-021')).toBeVisible();

    // Section 2: Supervisor Field Quotes
    await expect(page.getByText('2. Supervisor Field Quotes')).toBeVisible();

    // Section 3: Occurrence Timeline
    await expect(page.getByText('3. Occurrence Timeline')).toBeVisible();

    // Download CSV
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-delay-log-csv').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Delay_Log');
  });
});
