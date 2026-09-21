import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('P17.1 Pixel comparison screenshot capture at 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  test('Capture A1, SU1, and PL3 for side-by-side comparison', async ({ page }) => {
    const outDir = path.join(process.cwd(), 'docs', 'reference', 'captured');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 1. A1 Welcome Screen
    await page.goto('/welcome');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'actual-A1-welcome.png') });

    // 2. SU1 Supervisor Home Screen (seed 'reference')
    await page.goto('/dev/reset?snapshot=reference');
    await page.waitForLoadState('networkidle');

    // Login as Rahul Patil (supervisor)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const demoAccountsBtn = page.getByTestId('demo-accounts-trigger');
    if (await demoAccountsBtn.isVisible()) {
      await demoAccountsBtn.click();
      await page.getByTestId('demo-user-supervisor').click();
    } else {
      await page.goto('/home');
    }
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Rahul Patil')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'actual-SU1-home.png') });

    // 3. PL3 Match Review Screen (E-2091, 94% match)
    // Switch to Meera Nair (Planner)
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('profile-switch-demo-user-btn').click();
    await page.getByTestId('switch-user-role-planner').click();

    // Navigate to PL3 Match Review
    await page.goto('/workbench/E-2091');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('match-review-screen-pl3')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, 'actual-PL3-match-review.png') });
  });
});
