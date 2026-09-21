import { test, expect } from '@playwright/test';

test.describe('TASK P12 — PL4 Ingest Sheet, PL5 Excel, PL6 DPR, PL7 XER, and PL8 P6 Export', () => {
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

  test('PL4 Ingest Sheet: center + button opens sheet with 4 ingest channels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home?role=planner&frame=off');

    // Click center + button on BottomNav
    const centerBtn = page.getByTestId('bottom-nav-center-action');
    await expect(centerBtn).toBeVisible();
    await centerBtn.click();

    // Verify Ingest Sheet opens with 4 channels
    await expect(page.getByTestId('ingest-sheet')).toBeVisible();
    await expect(page.getByTestId('ingest-option-dpr')).toBeVisible();
    await expect(page.getByTestId('ingest-option-excel')).toBeVisible();
    await expect(page.getByTestId('ingest-option-xer')).toBeVisible();
    await expect(page.getByTestId('ingest-option-type')).toBeVisible();

    // Tap Excel to navigate
    await page.getByTestId('ingest-option-excel').click();
    await expect(page).toHaveURL(/.*\/ingest\/excel/);
  });

  test('PL5 Excel Mapper: 3-step wizard, sample loader, column mapping, and ingest', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ingest/excel?frame=off');

    // Step 1: File step
    await expect(page.getByTestId('excel-stepper')).toBeVisible();
    await expect(page.getByTestId('excel-step-1')).toBeVisible();

    // Click sample loader button
    const loadSampleBtn = page.getByTestId('use-sample-excel-btn');
    await expect(loadSampleBtn).toBeVisible();
    await loadSampleBtn.click();

    // Should advance to Step 2: Map Columns
    await expect(page.getByTestId('excel-step-2')).toBeVisible();
    await expect(page.getByTestId('excel-preview-table')).toBeVisible();

    // Proceed to Step 3
    await page.getByTestId('continue-to-process-btn').click();
    await expect(page.getByTestId('excel-step-3')).toBeVisible();

    // Open Workbench
    await page.getByTestId('open-workbench-from-excel-btn').click();
    await expect(page).toHaveURL(/.*\/workbench/);
  });

  test('PL6 DPR Review: select statements and dispatch to matching queue', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ingest/dpr?frame=off');

    await expect(page.getByRole('heading', { name: 'DPR Review' })).toBeVisible();
    await expect(page.getByTestId('dpr-statement-1')).toBeVisible();

    // Toggle statement selection
    await page.getByTestId('dpr-statement-1').click();
    const sendBtn = page.getByTestId('send-to-matching-btn');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // Redirects to workbench queue
    await expect(page).toHaveURL(/.*\/workbench/);
  });

  test('PL7 XER Import: parser summary stats, WBS preview, and confirmation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/ingest/xer?frame=off');

    await expect(page.getByRole('heading', { name: 'P6 XER Import' })).toBeVisible();

    // Click load sample XER button
    await page.getByRole('button', { name: 'Use Sample' }).click();

    // Verify parsed stats
    await expect(page.getByText('Parsed P6 XER Archive')).toBeVisible();
    await expect(page.getByText('WBS Hierarchy Preview')).toBeVisible();

    // Open confirmation dialog
    await page.getByTestId('import-baseline-btn').click();
    await expect(page.getByTestId('confirm-xer-dialog')).toBeVisible();

    // Confirm import
    await page.getByRole('button', { name: 'Replace and Import' }).click();
    await expect(page).toHaveURL(/.*\/schedule/);
  });

  test('PL8 P6 Update Export: Physical % Complete ONLY, zero duration percent, and CSV download', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/export?frame=off');

    // 1. Verify Header & Physical % Complete column
    await expect(page.getByRole('heading', { name: 'P6 Update Export' })).toBeVisible();
    await expect(page.getByTestId('export-diff-table')).toBeVisible();

    // STRICT CHECK: Verify header explicitly says "Physical %" and never "Duration %"
    await expect(page.getByTestId('export-diff-table')).toContainText('Physical % only');
    await expect(page.locator('body')).not.toContainText('Duration %');

    // 2. Format selector (CSV / XER)
    await expect(page.getByTestId('format-csv-btn')).toBeVisible();
    await expect(page.getByTestId('format-xer-btn')).toBeVisible();

    // 3. Test Download CSV button
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-export-btn').click();
    const download = await downloadPromise;

    // Verify downloaded filename format
    expect(download.suggestedFilename()).toMatch(/SchedBridge_P6_Update.*\.csv/);
  });
});
