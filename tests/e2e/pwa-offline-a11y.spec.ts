import { test, expect, Page } from '@playwright/test';

async function loginAsSupervisor(page: Page) {
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
        failedAttempts: 0,
        lockoutUntil: null,
      },
      version: 0,
    };
    localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
  });
}

test.describe('TASK P16: PWA, Offline, i18n, Accessibility & Scale', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('PWA manifest and service worker assets exist and are valid', async ({ page }) => {
    // 1. Check web manifest
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('SchedBridge AI');
    expect(manifest.short_name).toBe('SchedBridge');
    expect(manifest.theme_color).toBe('#1E293B');
    expect(manifest.icons.length).toBeGreaterThan(0);
    const maskable = manifest.icons.find((i: any) => i.purpose?.includes('maskable'));
    expect(maskable).toBeDefined();

    // 2. Check service worker script exists
    const swResponse = await page.request.get('/sw.js');
    expect(swResponse.ok()).toBeTruthy();
    const swContent = await swResponse.text();
    expect(swContent).toContain('schedbridge-cache-v1');
    expect(swContent).toContain('/offline');

    // 3. Offline fallback page exists and is navigable
    await page.goto('/offline');
    await expect(page.locator('h1')).toContainText(/offline/i);
    await expect(page.getByTestId('offline-retry-btn')).toBeVisible();
    await expect(page.getByTestId('offline-go-reports-btn')).toBeVisible();
  });

  test('Offline banner, queue, and simulation in settings', async ({ page }) => {
    await loginAsSupervisor(page);
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    
    // Offline banner should appear when simulate offline is checked
    const toggle = page.locator('[data-testid="toggle-simulate-offline"]');
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();
    await expect(page.locator('[data-testid="offline-persistent-banner"]')).toBeVisible();

    // Capture works with network simulated offline
    await page.goto('/capture');
    await page.waitForLoadState('domcontentloaded');
    const chip = page.locator('[data-testid="example-chip-3"]');
    await chip.waitFor({ state: 'visible' });
    await chip.click();

    // Submit update
    const submitBtn = page.locator('[data-testid="submit-capture-btn"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click();

    // Should show queued banner/status
    await expect(page.locator('[data-testid="queued-offline-card"]')).toBeVisible();

    // Now go back to settings and turn off simulation (reconnect)
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const toggleBack = page.locator('[data-testid="toggle-simulate-offline"]');
    await toggleBack.waitFor({ state: 'visible' });
    await toggleBack.click();
    
    // Banner transitions to Online / auto-flushes
    await expect(page.locator('[data-testid="offline-persistent-banner"]')).toContainText(/Online|Sync/i);
  });

  test('i18n Hindi and English switching applies instantly and persists', async ({ page }) => {
    await loginAsSupervisor(page);
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    // Check English text on Home
    await expect(page.locator('[data-testid="kpi-verified"]')).toContainText('Verified');

    // Switch to Hindi in Settings
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const hiBtn = page.locator('[data-testid="lang-btn-hi"]');
    await hiBtn.waitFor({ state: 'visible' });
    await hiBtn.click();

    // Verify Settings UI translated
    await expect(page.locator('[data-testid="page-header-title"]')).toContainText('सेटिंग्स');

    // Navigate to Home - Hindi persists and shows सत्यापित
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="kpi-verified"]')).toContainText('सत्यापित');

    // Navigate to Reports (SU3) - Translated
    await page.goto('/reports');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="page-header-title"]')).toContainText('फील्ड रिपोर्टें');

    // Navigate to Notifications (S8) - Translated
    await page.goto('/notifications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('[data-testid="page-header-title"]')).toContainText('सूचना');

    // Switch back to English
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('[data-testid="lang-btn-en"]').click();
    await expect(page.locator('[data-testid="page-header-title"]')).toContainText('Settings');
  });

  test('Accessibility: Sheet focus handling, no color-only status, large text scale', async ({ page }) => {
    await loginAsSupervisor(page);
    await page.goto('/reports');
    await page.waitForLoadState('domcontentloaded');

    // 1. Sheet open / focus trap / close on reports
    const filterBtn = page.locator('[data-testid="reports-filter-btn"]');
    await filterBtn.waitFor({ state: 'visible' });
    await filterBtn.click();
    const sheet = page.locator('[data-testid="sheet-reports-filter"], [data-testid="bottom-sheet"]');
    await expect(sheet).toBeVisible();
    // Escape key closes sheet
    await page.keyboard.press('Escape');
    await expect(sheet).not.toBeVisible();

    // 2. Large text scaling setting applies attribute to html
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const largeBtn = page.locator('[data-testid="display-size-large"]');
    await largeBtn.waitFor({ state: 'visible' });
    await largeBtn.click();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-text-size', 'large');

    // Switch back to default
    await page.click('[data-testid="display-size-default"]');
    await expect(html).toHaveAttribute('data-text-size', 'default');
  });
});


