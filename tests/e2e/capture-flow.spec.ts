import { test, expect } from '@playwright/test';

test.describe('TASK P08 — SU2 Capture (The Time Agent)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as supervisor Rahul Patil
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

  test('1. Hero phrase: "Line 24-XX ki spool 18 welding complete ho gayi hai" extracts chips and matches PIP-24-017 at 93%', async ({ page }) => {
    await page.goto('/capture');
    await expect(page.locator('[data-testid="capture-modal-su2"]')).toBeVisible();

    // Tap Example chip for spool 18
    const spool18Chip = page.locator('[data-testid="example-chip-3"]');
    await expect(spool18Chip).toBeVisible();
    await spool18Chip.click();

    // Advances to Confirm state with structured chips
    await expect(page.locator('[data-testid="confirm-report-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="chip-action-val"]')).toHaveText('Welding');
    await expect(page.locator('[data-testid="chip-object-val"]')).toHaveText('Spool 18');
    await expect(page.locator('[data-testid="chip-location-val"]')).toHaveText('Line 24-XX');
    await expect(page.locator('[data-testid="confirm-status-pill"]')).toHaveText('Completed');

    // Submit update
    const submitBtn = page.locator('[data-testid="submit-capture-btn"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verifies submitted success state
    await expect(page.locator('[data-testid="submitted-success-card"]')).toBeVisible();
    await expect(page.getByText('Field Update Sent')).toBeVisible();

    // Verify it appears in the events store and matches PIP-24-017 at 93%
    const latestEvent = await page.evaluate(() => {
      const raw = localStorage.getItem('schedbridge-events-store');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.state.events[0];
    });

    expect(latestEvent).not.toBeNull();
    expect(latestEvent.suggestedActivityId).toBe('PIP-24-017');
    expect(latestEvent.confidence).toBe(93);
    expect(latestEvent.extractedInfo.action).toBe('Welding');
    expect(latestEvent.extractedInfo.object).toBe('Spool 18');
    expect(latestEvent.extractedInfo.location).toBe('Line 24-XX');
  });

  test('2. Clarification trigger: "Spool erection finished." triggers missing Location question', async ({ page }) => {
    await page.goto('/capture');

    // Tap Example chip for "Spool erection finished (Needs clarify)"
    const clarifyChip = page.locator('[data-testid="example-chip-4"]');
    await expect(clarifyChip).toBeVisible();
    await clarifyChip.click();

    // Enters Clarify state
    await expect(page.locator('[data-testid="clarification-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="clarification-question-text"]')).toHaveText(
      'Which line or area was this for?'
    );

    // Tap quick-reply chip "Line 24-XX"
    const lineChip = page.locator('[data-testid="clarify-chip-line-24-xx"]');
    await expect(lineChip).toBeVisible();
    await lineChip.click();

    // Now advances to Confirm with Location filled!
    await expect(page.locator('[data-testid="confirm-report-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="chip-action-val"]')).toHaveText('Erection');
    await expect(page.locator('[data-testid="chip-object-val"]')).toHaveText('Spool');
    await expect(page.locator('[data-testid="chip-location-val"]')).toHaveText('Line 24-XX');
  });

  test('3. Delay reporting branch requires selecting delay category before submit', async ({ page }) => {
    await page.goto('/capture');

    // Click "Crane not available, lowering stopped"
    const delayChip = page.locator('[data-testid="example-chip-2"]');
    await delayChip.click();

    // Confirm state has delay category chips
    await expect(page.locator('[data-testid="confirm-report-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-status-pill"]')).toHaveText('Delay');
    await expect(page.locator('[data-testid="delay-category-chips"]')).toBeVisible();

    // Select category "Equipment / crane"
    await page.locator('[data-testid^="delay-cat-equipment"]').click();

    // Submit enabled
    const submitBtn = page.locator('[data-testid="submit-capture-btn"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.locator('[data-testid="submitted-success-card"]')).toBeVisible();
  });

  test('4. Offline submission stores report in queue and shows queued state', async ({ page }) => {
    await page.goto('/capture');

    // Simulate offline mode in store
    await page.context().setOffline(true);
    await page.evaluate(() => {
      const store = (window as unknown as { useOfflineStore?: { getState: () => { setIsOnline: (v: boolean) => void } } }).useOfflineStore;
      if (store) {
        store.getState().setIsOnline(false);
      }
    });

    // Use example chip
    await page.locator('[data-testid="example-chip-0"]').click();
    await expect(page.locator('[data-testid="confirm-report-card"]')).toBeVisible();

    // Submit
    await page.locator('[data-testid="submit-capture-btn"]').click();

    // Shows Queued state
    await expect(page.locator('[data-testid="queued-offline-card"]')).toBeVisible();
    await expect(page.getByText('Saved on Device')).toBeVisible();
    await expect(page.locator('[data-testid="view-queued-reports-btn"]')).toBeVisible();
  });
});
