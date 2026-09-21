import { test, expect } from '@playwright/test';

test.describe('TASK P11 — S6 Schedule, S4 Activity Detail, and S2 Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'user-meera',
            name: 'Meera Nair',
            title: 'Lead Planning Engineer',
            employeeId: 'PLN-0104',
            role: 'planner',
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

  test('S6 Schedule: List (WBS tree), Gantt-lite view, zoom, and navigation to S4', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/schedule?frame=off');

    // 1. Verify Header & Data Date
    await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible();
    await expect(page.getByText('20 Sep 2026')).toBeVisible();

    // 2. List View with WBS tree
    await expect(page.getByRole('button', { name: 'List (WBS)' })).toBeVisible();
    await expect(page.getByTestId('schedule-list-view')).toBeVisible();
    await expect(page.getByTestId('activity-row-PIP-24-017')).toBeVisible();
    await expect(page.getByTestId('activity-row-PIP-24-017')).toContainText('Weld Piping');

    // 3. Switch to Gantt view
    await page.getByRole('button', { name: 'Gantt-lite' }).click();
    await expect(page.getByTestId('schedule-gantt-view')).toBeVisible();
    await expect(page.getByTestId('gantt-data-date-line').first()).toBeVisible();

    // Test Zoom toggle
    await page.getByTestId('zoom-week-btn').click();
    await page.getByTestId('zoom-month-btn').click();

    // 4. Click activity to navigate to S4 Activity Detail
    await page.getByTestId('gantt-row-PIP-24-017').click();
    await expect(page).toHaveURL(/.*\/activity\/PIP-24-017/);
  });

  test('S4 Activity Detail: tabs, accumulator meter, logic nodes, and planner % adjustment', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/activity/PIP-24-017?frame=off');

    // 1. Verify Activity Title & Physical %
    await expect(page.getByRole('heading', { name: 'PIP-24-017' })).toBeVisible();
    await expect(page.getByText('Weld Piping System 24-XX')).toBeVisible();

    // 2. Overview Tab
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByText('Planned Dates')).toBeVisible();

    // 3. Progress Tab (Accumulator meter)
    await page.getByRole('tab', { name: /Progress/ }).click();
    await expect(page.getByTestId('activity-progress-tab')).toBeVisible();
    await expect(page.getByTestId('accumulator-meter')).toBeVisible();
    await expect(page.getByText('16 of 42 spools')).toBeVisible();

    // 4. Logic Tab
    await page.getByRole('tab', { name: 'Logic' }).click();
    await expect(page.getByTestId('activity-logic-tab')).toBeVisible();
    await expect(page.getByText('Predecessors')).toBeVisible();
    await expect(page.getByText('Successors')).toBeVisible();

    // 5. History Tab (Immutable Audit ledger)
    await page.getByRole('tab', { name: /History/ }).click();
    await expect(page.getByTestId('activity-history-tab')).toBeVisible();

    // 6. Planner % Adjustment sheet on Overview tab
    await page.getByRole('tab', { name: 'Overview' }).click();
    const adjustBtn = page.getByTestId('adjust-percent-btn');
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();
    await expect(page.getByTestId('adjust-percent-sheet')).toBeVisible();
    await page.getByTestId('adjust-reason-input').fill('Engineering survey recalibration');
    await page.getByTestId('save-adjustment-btn').click();

    // Verify confirmation toast
    await expect(page.getByTestId('toast-notification')).toBeVisible();
    await expect(page.getByTestId('toast-notification')).toContainText('Adjusted progress');
  });

  test('S2 Search: dictionary expansion "hydro" -> PIP-24-024 Hydrotest, recent searches, suggestions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/search?frame=off');

    // 1. Check suggestions
    await expect(page.getByTestId('search-suggestion-hydrotest')).toBeVisible();
    await expect(page.getByTestId('search-suggestion-spool-17')).toBeVisible();

    // 2. Type "hydro" into search input (dictionary expansion)
    const searchInput = page.getByTestId('search-main-input');
    await searchInput.fill('hydro');

    // 3. Verify PIP-24-024 Hydrotest is in the results
    await expect(page.getByTestId('search-result-activity-PIP-24-024')).toBeVisible();
    await expect(page.getByTestId('search-result-activity-PIP-24-024')).toContainText('Hydrotest');

    // 4. Click result to navigate
    await page.getByTestId('search-result-activity-PIP-24-024').click();
    await expect(page).toHaveURL(/.*\/activity\/PIP-24-024/);
  });
});
