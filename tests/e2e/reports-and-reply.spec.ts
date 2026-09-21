import { test, expect } from '@playwright/test';

test.describe('TASK P09 — SU3 Reports, S5 Event Detail, S1 Notifications & Reply Loop', () => {
  test.beforeEach(async ({ page }) => {
    // Start with supervisor user
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

  test('1. SU3 Reports: Mine/All crews switcher, underline tabs, and queued offline sync', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('[data-testid="reports-screen-su3"]')).toBeVisible();

    // Mine / All crews toggle
    await expect(page.locator('[data-testid="reports-segment-mine"]')).toBeVisible();
    await expect(page.locator('[data-testid="reports-segment-all"]')).toBeVisible();
    await page.locator('[data-testid="reports-segment-all"]').click();

    // Tabs
    await expect(page.locator('[data-testid="underline-tabs-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-drafts"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-queued"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-history"]')).toBeVisible();

    // Drafts empty state
    await page.locator('[data-testid="underline-tabs-drafts"]').click();
    await expect(page.getByText('No drafts.')).toBeVisible();

    // Queued tab with offline reports & sync
    await page.locator('[data-testid="underline-tabs-queued"]').click();
    await expect(page.locator('[data-testid="sync-queued-now-btn"]')).toBeVisible();
    await page.locator('[data-testid="sync-queued-now-btn"]').click();
    await expect(page.getByText('Everything is sent.')).toBeVisible();
  });

  test('2. S5 Event Detail: Audio player, transcript, extracted chips, and AI match block', async ({ page }) => {
    await page.goto('/event/E-2091');
    await expect(page.locator('[data-testid="event-detail-screen-s5"]')).toBeVisible();

    // Audio player
    const playBtn = page.locator('[data-testid="audio-play-pause-btn"]');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    // Verify audio starts
    await expect(page.locator('[data-testid="waveform"]')).toBeVisible();

    // Quoted transcript
    await expect(page.locator('[data-testid="event-transcript"]')).toContainText('Line 24-XX ki spool 17 welding complete ho gayi hai');

    // Extracted chips
    await expect(page.locator('[data-testid="event-extracted-chips"]')).toContainText('Welding');
    await expect(page.locator('[data-testid="event-extracted-chips"]')).toContainText('Spool 17');
    await expect(page.locator('[data-testid="event-extracted-chips"]')).toContainText('Completed');

    // AI Match Block
    await expect(page.locator('[data-testid="event-match-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="match-confidence-badge"]')).toContainText('94% Confidence');
    await expect(page.getByText('PIP-24-017')).toBeVisible();
    await expect(page.getByText('Voice → Event → Match → Approval')).toBeVisible();
  });

  test('3. S1 Notifications Hub: tabs, item list, and mark all read', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('[data-testid="notifications-screen-s1"]')).toBeVisible();

    // Tabs
    await expect(page.locator('[data-testid="underline-tabs-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="underline-tabs-needs-action"]')).toBeVisible();

    // Notification list
    await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();

    // Mark all read
    const markAllBtn = page.locator('[data-testid="mark-all-read-btn"]');
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    // Unread indicators gone
    const unreadDots = page.locator('[data-testid^="unread-dot-"]');
    expect(await unreadDots.count()).toBe(0);
  });

  test('4. End-to-end reply loop: planner asks question -> supervisor sees banner -> replies -> returns to review queue', async ({ page }) => {
    // 1. Planner asks question on E-2091
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

    await page.goto('/event/E-2091');
    const askBtn = page.locator('[data-testid="planner-ask-btn"]');
    await expect(askBtn).toBeVisible();
    await askBtn.dispatchEvent('click');

    // Fill question in sheet
    await page.locator('[data-testid="ask-question-textarea"]').fill('Which spool range was this for?');
    await page.locator('[data-testid="submit-question-btn"]').click();

    // 2. Switch back to Supervisor role
    await page.evaluate(() => {
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
        },
        version: 0,
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
    });

    // 3. Supervisor opens Reports, sees reply needed banner
    await page.goto('/reports');
    await expect(page.locator('[data-testid="planner-reply-banner"]')).toBeVisible();
    await page.locator('[data-testid="planner-reply-banner"]').click();

    // 4. Lands on E-2091 with Reply Needed status
    await expect(page).toHaveURL(/.*event\/E-2091/);
    await expect(page.locator('[data-testid="planner-question-text"]')).toContainText('Which spool range was this for?');

    // 5. Supervisor clicks Reply and submits answer
    const replyBtn = page.locator('[data-testid="open-reply-sheet-btn"]');
    await expect(replyBtn).toBeVisible();
    await replyBtn.dispatchEvent('click');
    await page.locator('[data-testid="reply-input-textarea"]').fill('Spool 17 to 18 on Line 24-XX completed.');
    await page.locator('[data-testid="submit-reply-btn"]').click();

    // 6. Question now displays supervisor reply and event status is Review
    await expect(page.locator('[data-testid="supervisor-reply-text"]')).toHaveText(
      'Spool 17 to 18 on Line 24-XX completed.'
    );
  });
});
