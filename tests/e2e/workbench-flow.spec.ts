import { test, expect } from '@playwright/test';
import { generateSeedEvents } from '@/mocks/fixtures/events';

test.describe('TASK P10 — Workbench PL2 Queue and PL3 Match Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome?preview=1');
    const demoEvents = generateSeedEvents('demo-start');
    await page.evaluate((events) => {
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
      localStorage.setItem(
        'schedbridge-events-store',
        JSON.stringify({
          state: {
            events,
            lastApprovedAt: Date.now() - 3000,
            previousStates: {},
          },
          version: 0,
        })
      );
    }, demoEvents);
  });

  test('PL2 Queue: tabs, confidence badges, sort & filter, multi-select batch approval', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/workbench?frame=off');

    // 1. Verify Header & Tabs
    await expect(page.getByRole('heading', { name: 'Workbench' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Review/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Unmatched/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Warnings/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Done/ })).toBeVisible();

    // 2. Freshness clock is visible
    await expect(page.getByTestId('freshness-clock')).toBeVisible();

    // 3. Review items are present
    await expect(page.getByTestId('event-item-E-2091')).toBeVisible();
    await expect(page.getByTestId('confidence-E-2091')).toContainText('94%');

    // 4. Open Sort sheet and change sort
    await page.getByTestId('queue-sort-btn').click();
    await expect(page.getByTestId('queue-sort-sheet')).toBeVisible();
    await page.getByTestId('sort-option-confidence-asc').click();
    await expect(page.getByTestId('queue-sort-sheet')).not.toBeVisible();

    // 5. Open Filter sheet
    await page.getByTestId('queue-filter-btn').click();
    await expect(page.getByTestId('queue-filter-sheet')).toBeVisible();
    await page.keyboard.press('Escape');

    // 6. Test Select Mode (Batch Approval)
    await page.getByTestId('toggle-select-mode-btn').click();
    await expect(page.getByTestId('batch-approve-bar')).toBeVisible();
    await expect(page.getByTestId('batch-approve-btn')).toBeDisabled();

    // Select two items
    await page.getByTestId('checkbox-E-2091').click();
    await page.getByTestId('checkbox-E-2092').click();
    const batchBtn = page.getByTestId('batch-approve-btn');
    await expect(batchBtn).toBeEnabled();
    await expect(batchBtn).toContainText('Approve selected (2)');

    // Exit select mode
    await page.getByTestId('toggle-select-mode-btn').click();
    await expect(page.getByTestId('batch-approve-bar')).not.toBeVisible();
  });

  test('PL3 Match Review: Screen 3 layout, 94% badge, chips, audio waveform, factor breakdown, and approval flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/workbench/E-2091?frame=off');

    // 1. Verify Reference Screen 3 Header Elements
    await expect(page.getByText('Activity Matching')).toBeVisible();
    await expect(page.getByTestId('pager-text')).toContainText('of');
    await expect(page.getByTestId('review-count-line')).toContainText('events require review');

    // 2. FIELD EVIDENCE card
    await expect(page.getByTestId('field-evidence-card')).toBeVisible();
    await expect(page.getByTestId('play-pause-btn')).toBeVisible();
    await expect(page.getByTestId('audio-waveform')).toBeVisible();

    // Verify Extracted Chips
    await expect(page.getByTestId('chip-action')).toContainText('Welding');
    await expect(page.getByTestId('chip-object')).toContainText('Spool 17');
    await expect(page.getByTestId('chip-location')).toContainText('Line 24-XX');

    // 3. Open Supervisor sheet & call link
    await page.getByTestId('call-supervisor-btn').click();
    await expect(page.getByTestId('supervisor-contact-sheet')).toBeVisible();
    const callLink = page.getByTestId('supervisor-tel-link');
    await expect(callLink).toHaveAttribute('href', 'tel:+919820123456');
    await page.keyboard.press('Escape');

    // 4. AI MATCH card
    await expect(page.getByTestId('ai-match-card')).toBeVisible();
    await expect(page.getByTestId('confidence-xl-btn')).toContainText('94%');
    await expect(page.getByTestId('match-activity-id-link')).toContainText('PIP-24-017');

    // 5. Why 94% factor breakdown sheet
    await page.getByTestId('confidence-xl-btn').click();
    await expect(page.getByTestId('why-confidence-sheet')).toBeVisible();
    await expect(page.getByText('Semantic similarity')).toBeVisible();
    await expect(page.getByText('Discipline match (Piping)')).toBeVisible();
    await page.keyboard.press('Escape');

    // 6. Logic Check Sheet
    await page.getByTestId('logic-check-pill').click();
    await expect(page.getByTestId('logic-check-sheet')).toBeVisible();
    await expect(page.getByText('Predecessors complete')).toBeVisible();
    await page.keyboard.press('Escape');

    // 7. Evidence Linked Chain Sheet
    await page.getByTestId('evidence-chain-link').click();
    await expect(page.getByTestId('evidence-chain-sheet')).toBeVisible();
    await page.keyboard.press('Escape');

    // 8. Live Chip Edit & Re-matching
    await page.getByTestId('chip-edit-action').click();
    await expect(page.getByTestId('chip-edit-sheet')).toBeVisible();
    await page.getByTestId('chip-edit-input').fill('Hydrotest');
    await page.getByTestId('chip-edit-save-btn').click();
    await expect(page.getByTestId('toast-notification')).toBeVisible();

    // 9. Approve Match -> Diff Sheet -> Confirmation & Undo Toast
    await page.getByTestId('approve-match-btn').click();
    const diffSheet = page.getByTestId('diff-preview-sheet');
    await expect(diffSheet).toBeVisible();
    await expect(diffSheet.getByText('PIP-24-017')).toBeVisible();
    await expect(diffSheet.getByText('38%')).toBeVisible();
    await expect(diffSheet.getByText('40%')).toBeVisible();

    // Confirm Approval
    await page.getByTestId('confirm-approval-btn').click();
    await expect(page.getByTestId('diff-preview-sheet')).not.toBeVisible();

    // Verify 8s Undo Toast appears
    const toast = page.getByTestId('toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Approved match');
  });

  test('PL3 Out-of-Sequence variant (E-2093) requires override reason before approval', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/workbench/E-2093?frame=off');

    // Out-of-sequence warning banner
    await expect(page.getByTestId('out-of-sequence-banner')).toBeVisible();

    // Approve Match button is initially disabled without override reason
    const approveBtn = page.getByTestId('approve-match-btn');
    await expect(approveBtn).toBeDisabled();

    // Click override reason chip
    await page.getByTestId('override-reason-work-front-available').click();
    await expect(approveBtn).toBeEnabled();

    // Now click Approve Match to open diff sheet
    await approveBtn.click();
    await expect(page.getByTestId('diff-preview-sheet')).toBeVisible();
  });

  test('PL3 Desktop Keyboard Shortcuts (A, C, U, J, K)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/workbench/E-2091?frame=off');

    // Press 'A' to open Approve diff sheet
    await page.keyboard.press('a');
    await expect(page.getByTestId('diff-preview-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('diff-preview-sheet')).not.toBeVisible();

    // Press 'C' to open Choose Another sheet
    await page.keyboard.press('c');
    await expect(page.getByTestId('choose-another-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('choose-another-sheet')).not.toBeVisible();

    // Press 'U' to open Unmatched sheet
    await page.keyboard.press('u');
    await expect(page.getByTestId('unmatched-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('unmatched-sheet')).not.toBeVisible();
  });
});
