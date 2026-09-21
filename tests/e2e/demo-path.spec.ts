import { test, expect } from '@playwright/test';

test.describe('SPEC §11.2: Three-minute demo path (single browser context)', () => {
  test('Complete 9-step demo click-path with data persistence across role switches', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // -------------------------------------------------------------
    // STEP 1: /dev/reset?snapshot=demo-start -> Welcome -> Log In -> Demo accounts -> Rahul Patil
    // -------------------------------------------------------------
    await page.goto('/dev/reset?snapshot=demo-start');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Reset Demo State')).toBeVisible();
    await page.click('[data-testid="reset-snapshot-demo-start"]');

    // Welcome -> Log In
    await page.goto('/welcome?preview=1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('welcome-screen-a1')).toBeVisible();
    await page.getByTestId('login-link').click();
    await expect(page).toHaveURL(/.*\/login/);

    // Demo accounts -> Rahul Patil (Supervisor)
    await page.getByTestId('demo-accounts-trigger').click();
    await expect(page.getByTestId('demo-accounts-sheet')).toBeVisible();
    await page.getByTestId('demo-user-supervisor').click();
    await expect(page).toHaveURL(/.*\/home/);

    // -------------------------------------------------------------
    // STEP 2: Home (47 / 12 / 03) -> tap mic -> Spool 17 welding done -> Submit
    // -------------------------------------------------------------
    await expect(page.getByTestId('kpi-verified')).toContainText('47');
    await expect(page.getByTestId('kpi-review')).toContainText('12');
    await expect(page.getByTestId('kpi-delays')).toContainText('03');

    // Tap mic / capture
    await page.goto('/capture');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="capture-modal-su2"]')).toBeVisible();

    // Tap example chip 0: "Spool 17 welding done"
    const exampleChip = page.locator('[data-testid="example-chip-0"]');
    await exampleChip.waitFor({ state: 'visible' });
    await exampleChip.click();

    // Confirm structured chips
    await expect(page.locator('[data-testid="confirm-report-card"]')).toBeVisible();
    const submitCaptureBtn = page.locator('[data-testid="submit-capture-btn"]');
    await submitCaptureBtn.waitFor({ state: 'visible' });
    await submitCaptureBtn.click();

    // Verify submitted success state
    await expect(page.locator('[data-testid="submitted-success-card"]')).toBeVisible();

    // -------------------------------------------------------------
    // STEP 3: Profile -> Switch demo user -> Meera Nair (Planner)
    // -------------------------------------------------------------
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('profile-switch-demo-user-btn').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await page.getByTestId('switch-user-role-planner').click();
    await page.waitForTimeout(300);

    // -------------------------------------------------------------
    // STEP 4: Home shows Review 13 -> Workbench -> Match Review (E-2091)
    // -------------------------------------------------------------
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('kpi-review')).toContainText('13');

    // Navigate to Workbench
    await page.goto('/workbench');
    await page.waitForLoadState('domcontentloaded');
    
    // Open the new event that was captured in Step 2
    const newEventItem = page.locator('div[data-testid^="event-item-"]:has-text("Line 24-XX ki spool 17 welding complete")');
    await newEventItem.waitFor({ state: 'visible' });
    await newEventItem.click();

    // Match Review: field evidence card visible
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('field-evidence-card')).toBeVisible();

    // Play recording
    await page.getByTestId('play-pause-btn').click();

    // Tap 94% confidence breakdown
    await page.getByTestId('confidence-xl-btn').click();
    await expect(page.getByTestId('why-confidence-sheet')).toBeVisible();
    await page.keyboard.press('Escape');

    // Tap Logic Check
    await page.getByTestId('logic-check-pill').click();
    await expect(page.getByTestId('logic-check-sheet')).toBeVisible();
    await page.keyboard.press('Escape');

    // -------------------------------------------------------------
    // STEP 5: Approve Match -> diff sheet -> Confirm approval -> Undo Toast
    // -------------------------------------------------------------
    await page.getByTestId('approve-match-btn').click();
    const diffSheet = page.getByTestId('diff-preview-sheet');
    await expect(diffSheet).toBeVisible();
    await expect(diffSheet.getByText('PIP-24-017')).toBeVisible();

    // Confirm approval
    await page.getByTestId('confirm-approval-btn').click();
    await expect(diffSheet).not.toBeVisible();

    // Toast with Undo appears
    await expect(page.getByTestId('toast-notification')).toBeVisible();
    await expect(page.getByTestId('toast-notification')).toContainText('Approved match');

    // -------------------------------------------------------------
    // STEP 6: Open E-2093 (out-of-sequence) -> Retained Logic banner -> Hold & ask supervisor
    // -------------------------------------------------------------
    await page.goto('/workbench/E-2093');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('out-of-sequence-banner')).toBeVisible();
    await expect(page.getByTestId('out-of-sequence-banner')).toContainText('Retained Logic');

    // Hold & ask supervisor
    const holdBtn = page.getByTestId('hold-ask-supervisor-btn');
    await holdBtn.waitFor({ state: 'visible' });
    await holdBtn.click();
    await expect(page.getByTestId('toast-notification')).toBeVisible();

    // -------------------------------------------------------------
    // STEP 7: Export -> preview diff -> Generate file -> CSV downloads
    // -------------------------------------------------------------
    await page.goto('/export');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('export-diff-table')).toBeVisible();
    await expect(page.getByTestId('export-diff-table')).toContainText('Physical % only');

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-export-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/SchedBridge_P6_Update.*\.csv/);

    // -------------------------------------------------------------
    // STEP 8: Audit -> Verify chain -> intact
    // -------------------------------------------------------------
    await page.goto('/audit');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('1280 entries')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('verify-chain-button').click();
    await expect(page.getByTestId('verify-result-success')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chain intact')).toBeVisible();

    // -------------------------------------------------------------
    // STEP 9: Switch demo user -> Arvind Deshmukh (PM) -> Analytics (S-curve, Truth Gap, Delays, Memory)
    // -------------------------------------------------------------
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('profile-switch-demo-user-btn').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await page.getByTestId('switch-user-role-pm').click();
    await page.waitForTimeout(300);

    // Analytics tabs
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');

    // 1. S-curve (Progress tab)
    await expect(page.getByTestId('numeral-physical')).toContainText('68%');
    await expect(page.getByTestId('numeral-planned')).toContainText('74%');
    await expect(page.getByTestId('numeral-spi')).toContainText('0.92');
    await expect(page.getByRole('img', { name: 'Progress S-curve chart' })).toBeVisible();

    // 2. Truth Gap tab
    await page.getByRole('tab', { name: /Truth Gap/i }).click();
    await expect(page.locator('body')).toContainText(/Truth Gap/i);

    // 3. Delays tab
    await page.getByRole('tab', { name: /Delays/i }).click();
    await expect(page.locator('body')).toContainText(/Critical Path/i);

    // 4. Memory tab
    await page.getByRole('tab', { name: /Memory/i }).click();
    await expect(page.locator('body')).toContainText(/Historical Insights|Memory/i);
  });
});
