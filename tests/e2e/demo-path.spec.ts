import { test, expect } from '@playwright/test';

test.describe('App Shell & Navigation (P03)', () => {
  test.beforeEach(async ({ page }) => {
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

  test('landing page directs to home with DeviceFrame and BottomNav', async ({ page }) => {
    await page.goto('/home');
    await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="page-header-home"]')).toBeVisible();
  });

  test('role switcher dynamically changes bottom nav and center button', async ({ page }) => {
    await page.goto('/dev/roles');

    // Switch to Planner role
    await page.click('[data-testid="role-select-planner"]');
    await page.click('[data-testid="go-to-home"]');

    // Planner should have Workbench in slot 2 and Ingest in center button
    await expect(page.locator('[data-testid="bottom-nav-workbench"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-nav-center-btn"]')).toBeVisible();

    // Switch to PM role
    await page.goto('/dev/roles');
    await page.click('[data-testid="role-select-pm"]');
    await page.click('[data-testid="go-to-home"]');

    // PM should have Analytics in slot 2 and Ask in center button
    await expect(page.locator('[data-testid="bottom-nav-analytics"]')).toBeVisible();
  });

  test('all stub routes respond with their screen ID and title', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.locator('[data-testid="stub-s6"]')).toBeVisible();

    await page.goto('/profile');
    await expect(page.locator('[data-testid="stub-s8"]')).toBeVisible();
  });
});
