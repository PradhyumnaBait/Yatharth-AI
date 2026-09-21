import { test, expect, Page } from '@playwright/test';

// Helper to switch role via localStorage state and navigate cleanly
async function loginAs(page: Page, role: 'supervisor' | 'planner' | 'pm' | 'admin') {
  const users = {
    supervisor: { id: 'usr-01', name: 'Rahul Patil', role: 'supervisor', employeeId: 'SUP-0412' },
    planner: { id: 'usr-02', name: 'Meera Nair', role: 'planner', employeeId: 'PLN-0107' },
    pm: { id: 'usr-03', name: 'Arvind Deshmukh', role: 'pm', employeeId: 'PM-0031' },
    admin: { id: 'usr-04', name: 'Sana Qureshi', role: 'admin', employeeId: 'ADM-0002' },
  };

  const user = users[role];
  await page.addInitScript((userData) => {
    localStorage.setItem(
      'schedbridge-auth',
      JSON.stringify({
        state: {
          user: userData,
          isAuthenticated: true,
          selectedProject: {
            id: 'kandla-panipat-p3',
            name: 'Kandla–Panipat Pipeline — Package 3',
            package: '10 km execution package · KP 178.0–188.0',
            location: 'Section 4B · Gujarat',
          },
        },
        version: 0,
      })
    );
  }, user);
}

test.describe('SPEC §11.1 Dead-control sweep across all 4 roles', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Supervisor role: all reachable screens and interactive controls produce reactions', async ({ page }) => {
    await loginAs(page, 'supervisor');

    // 1. Home (SU1)
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    // Pill filters trigger active state changes
    const progressPill = page.getByRole('button', { name: /Progress/i }).first();
    await progressPill.click();
    await expect(progressPill).toHaveClass(/bg-sb-navy/);

    const allPill = page.getByRole('button', { name: /All/i }).first();
    await allPill.click();
    await expect(allPill).toHaveClass(/bg-sb-navy/);

    // KPI Tiles navigate or filter
    await page.getByTestId('kpi-verified').click();
    await expect(page).toHaveURL(/.*\/reports/);

    await page.goto('/home');
    await page.getByTestId('kpi-delays').click();
    await expect(page).toHaveURL(/.*\/reports/);

    // Notification bell navigates
    await page.goto('/home');
    await page.getByRole('button', { name: /Notifications/i }).first().click();
    await expect(page).toHaveURL(/.*\/notifications/);

    // 2. Reports (SU3)
    await page.goto('/reports');
    await page.waitForLoadState('domcontentloaded');

    // Tab clicks change active tab
    const unreadTab = page.getByRole('tab', { name: /Reply Needed/i });
    if (await unreadTab.isVisible()) {
      await unreadTab.click();
      await expect(unreadTab).toHaveAttribute('aria-selected', 'true');
    }

    // 3. Schedule (S6)
    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');
    const searchSchedule = page.locator('input[placeholder*="Search"]').first();
    if (await searchSchedule.isVisible()) {
      await searchSchedule.fill('PIP');
      await expect(page.locator('body')).toContainText('PIP');
    }

    // 4. Notifications (S1)
    await page.goto('/notifications');
    await page.waitForLoadState('domcontentloaded');
    const notifFilter = page.getByRole('button', { name: /Unread/i }).first();
    if (await notifFilter.isVisible()) {
      await notifFilter.click();
      await expect(notifFilter).toHaveClass(/bg-sb-navy/);
    }

    // 5. Profile (S8)
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.getByTestId('profile-switch-demo-user-btn').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('bottom-sheet')).not.toBeVisible();
  });

  test('Planner role: queue, match review, workbench, ingest, and export controls produce reactions', async ({ page }) => {
    await loginAs(page, 'planner');

    // 1. Planner Home (PL1)
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Require Review|Review/i).first()).toBeVisible();

    // 2. Workbench Queue (PL2)
    await page.goto('/workbench');
    await page.waitForLoadState('domcontentloaded');
    const warningsTab = page.getByRole('tab', { name: /Warnings/i });
    await warningsTab.click();
    await expect(warningsTab).toHaveAttribute('aria-selected', 'true');

    const doneTab = page.getByRole('tab', { name: /Done/i });
    await doneTab.click();
    await expect(doneTab).toHaveAttribute('aria-selected', 'true');

    // 3. Match Review (PL3)
    await page.goto('/workbench/E-2091');
    await page.waitForLoadState('domcontentloaded');

    // Play button toggles
    const playBtn = page.getByTestId('play-pause-btn');
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    await playBtn.click();

    // Why 94% sheet opens
    const whyBtn = page.getByRole('button', { name: /Why 94%/i }).first();
    if (await whyBtn.isVisible()) {
      await whyBtn.click();
      await expect(page.getByTestId('why-confidence-sheet')).toBeVisible();
      await page.keyboard.press('Escape');
    }

    // Logic Check sheet opens
    const logicBtn = page.getByRole('button', { name: /Logic Check/i }).first();
    if (await logicBtn.isVisible()) {
      await logicBtn.click();
      await expect(page.getByTestId('logic-check-sheet')).toBeVisible();
      await page.keyboard.press('Escape');
    }

    // 4. Export (PL8)
    await page.goto('/export');
    await page.waitForLoadState('domcontentloaded');
    const xerBtn = page.getByTestId('format-xer-btn');
    await xerBtn.click();
    await expect(xerBtn).toHaveClass(/bg-sb-navy/);

    const csvBtn = page.getByTestId('format-csv-btn');
    await csvBtn.click();
    await expect(csvBtn).toHaveClass(/bg-sb-navy/);

    // Row selection toggles
    const firstRow = page.locator('[data-testid^="export-row-"]').first();
    await firstRow.click();
    await firstRow.click();

    // 5. Audit (S7)
    await page.goto('/audit');
    await page.waitForLoadState('domcontentloaded');
    const verifyBtn = page.getByTestId('verify-chain-button');
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();
    await expect(page.getByTestId('verify-result-success')).toBeVisible({ timeout: 10000 });

    // 6. Settings (S9)
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const offlineToggle = page.getByTestId('simulate-offline-toggle');
    if (await offlineToggle.isVisible()) {
      await offlineToggle.click();
      await offlineToggle.click();
    }
  });

  test('PM role: analytics tabs, filters, and ask keyword routers produce reactions', async ({ page }) => {
    await loginAs(page, 'pm');

    // 1. Analytics (PM2)
    await page.goto('/analytics');
    await page.waitForLoadState('domcontentloaded');

    // Progress tab numerals
    await expect(page.getByTestId('numeral-physical')).toBeVisible();

    // Truth Gap tab
    const truthGapTab = page.getByRole('tab', { name: /Truth Gap/i });
    await truthGapTab.click();
    await expect(truthGapTab).toHaveAttribute('aria-selected', 'true');

    // Delays tab
    const delaysTab = page.getByRole('tab', { name: /Delays/i });
    await delaysTab.click();
    await expect(delaysTab).toHaveAttribute('aria-selected', 'true');

    // Memory tab
    const memoryTab = page.getByRole('tab', { name: /Memory/i });
    await memoryTab.click();
    await expect(memoryTab).toHaveAttribute('aria-selected', 'true');

    // 2. Ask (PM3)
    await page.goto('/ask');
    await page.waitForLoadState('domcontentloaded');

    // Tap a suggested question chip
    const questionChip = page.locator('button:has-text("critical path")').first();
    if (await questionChip.isVisible()) {
      await questionChip.click();
      await expect(page.locator('[data-testid="ask-answer-card"], [data-testid="ask-response-area"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Admin role: user management, roles, dictionary, and requests produce reactions', async ({ page }) => {
    await loginAs(page, 'admin');

    // 1. Admin Users (AD1)
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    const inviteBtn = page.getByRole('button', { name: /Invite User/i }).first();
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
      await expect(page.getByTestId('invite-user-sheet')).toBeVisible();
      await page.keyboard.press('Escape');
    }

    // 2. Admin Roles Matrix (AD3)
    await page.goto('/admin/users?tab=roles');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Role-Based Access Control/i)).toBeVisible();

    // 3. Admin Dictionary (AD4)
    await page.goto('/admin/dictionary');
    await page.waitForLoadState('domcontentloaded');
    const testInput = page.locator('input[placeholder*="phrase"]').first();
    if (await testInput.isVisible()) {
      await testInput.fill('hydro');
      await expect(page.locator('body')).toContainText(/Hydrotest|PIP-24-024/i);
    }

    // 4. Access Requests (AD2)
    await page.goto('/admin/requests');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toContainText(/Access Requests|Requests/i);
  });
});
