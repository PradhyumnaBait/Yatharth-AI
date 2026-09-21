import { test, expect } from '@playwright/test';

test.describe('TASK P15 — Responsive Desktop / Tablet Layouts (≥ 1024px)', () => {
  test('At 1280px: Planner, PM, and Admin display Left Nav Rail while Supervisor stays in phone frame', async ({ page }) => {
    // 1. Planner at 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
      const authState = {
        state: {
          user: {
            id: 'user-meera',
            name: 'Meera Nair',
            title: 'Project Controls Planner',
            employeeId: 'PLN-0107',
            role: 'planner',
            organization: 'Sterling Infra EPC',
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

    await page.goto('/home');
    // Left nav rail is visible for planner
    await expect(page.getByTestId('left-nav-rail')).toBeVisible();

    // 2. Supervisor at 1280x800 stays inside phone frame
    await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('schedbridge-auth') || '{}');
      auth.state.user = {
        id: 'user-rahul',
        name: 'Rahul Patil',
        role: 'supervisor',
        employeeId: 'SUP-0412',
        title: 'Field Supervisor',
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(auth));
    });

    await page.goto('/home');
    // Left rail is NOT visible for supervisor
    await expect(page.getByTestId('left-nav-rail')).not.toBeVisible();
    // Bottom nav is visible for supervisor
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
  });

  test('Dual-Pane Workbench: queue on left, Match Review on right, row click updates without navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
      const authState = {
        state: {
          user: {
            id: 'user-meera',
            name: 'Meera Nair',
            title: 'Project Controls Planner',
            employeeId: 'PLN-0107',
            role: 'planner',
            organization: 'Sterling Infra EPC',
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

    await page.goto('/workbench');

    // 1. Check dual-pane visibility
    await expect(page.getByTestId('workbench-queue-pl2')).toBeVisible();
    await expect(page.getByTestId('workbench-dual-pane-review')).toBeVisible();

    // 2. Click second event item in queue (e.g. E-2092)
    await page.getByTestId('event-item-E-2092').click();

    // URL should stay on /workbench (no page navigation)
    expect(page.url()).toContain('/workbench');
    expect(page.url()).not.toContain('/workbench/E-2092');

    // Right pane displays the selected event details
    await expect(page.getByTestId('workbench-dual-pane-review')).toContainText('E-2092');

    // 3. Desktop Keyboard Shortcut test: press 'A' to trigger Diff Sheet
    await page.keyboard.press('a');
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await expect(page.getByText('Approve Schedule Update')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('No horizontal page scroll from 360px to 1920px', async ({ page }) => {
    const viewports = [
      { width: 360, height: 740 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/analytics?frame=off');
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });
});
