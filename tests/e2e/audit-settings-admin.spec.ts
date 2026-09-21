import { test, expect } from '@playwright/test';

test.describe('TASK P14 — Security Audit, Profile, Settings & Admin Suite (S7, S8, S9, AD1–AD4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => {
      localStorage.clear();
      const authState = {
        state: {
          user: {
            id: 'user-sana',
            name: 'Sana Qureshi',
            title: 'Project Admin',
            employeeId: 'ADM-0002',
            role: 'admin',
            organization: 'Sterling Infra EPC',
            currentProjectId: 'kandla-panipat-p3',
          },
          isAuthenticated: true,
          activeProjectId: 'kandla-panipat-p3',
          hasSeenOnboarding: true,
          hasSeenPermissionsPrimer: true,
          accessRequests: [
            {
              id: 'REQ-0086',
              name: 'Vikram Mehta',
              contact: 'SUP-0391',
              organization: 'Sterling Infra EPC',
              projectId: 'kandla-panipat-p3',
              role: 'supervisor',
              time: '10 min ago',
            },
            {
              id: 'REQ-0087',
              name: 'Pooja Sharma',
              contact: 'PLN-0142',
              organization: 'Sterling Infra EPC',
              projectId: 'kandla-panipat-p3',
              role: 'planner',
              time: '25 min ago',
            },
          ],
        },
        version: 0,
      };
      localStorage.setItem('schedbridge-auth', JSON.stringify(authState));
    });
  });

  test('S7 Audit Trail: SubtleCrypto verify passes green, dev tamper detects break, export CSV', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/audit?frame=off');

    // Wait for deterministic 1280 audit entries to initialize
    await expect(page.getByText('1280 entries')).toBeVisible({ timeout: 10000 });

    // 1. Initial Verify Chain
    await page.getByTestId('verify-chain-button').click();
    await expect(page.getByTestId('verify-result-success')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chain intact')).toBeVisible();

    // 2. Tamper an entry
    await page.getByTestId('tamper-entry-button').click();

    // 3. Re-verify chain -> must detect break
    await page.getByTestId('verify-chain-button').click();
    await expect(page.getByTestId('verify-result-break')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Break at entry #')).toBeVisible();

    // 4. Jump to break
    await page.getByTestId('jump-to-break-button').click();

    // 5. Export CSV
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-audit-csv').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('Audit_Trail_SHA256');
  });

  test('S8 Profile: role metrics, switch demo user, and sign out confirmation dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile?frame=off');

    // User details and admin role stats
    await expect(page.getByRole('heading', { level: 2, name: 'Sana Qureshi' })).toBeVisible();
    await expect(page.getByText('Active users')).toBeVisible();

    // Switch demo user sheet
    await page.getByTestId('profile-switch-demo-user-btn').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await page.getByTestId('switch-user-role-planner').click();

    // Role switches to Planner immediately
    await expect(page.getByRole('heading', { level: 2, name: 'Meera Nair' })).toBeVisible();

    // Sign out dialog
    await page.getByTestId('profile-sign-out-btn').click();
    await expect(page.getByTestId('sign-out-dialog')).toBeVisible();
    await page.getByTestId('cancel-sign-out-btn').click();
    await expect(page.getByTestId('sign-out-dialog')).not.toBeVisible();
  });

  test('S9 Settings: moving Auto-accept to 90 re-tiers events in preview bar and queue', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/settings?frame=off');

    // Locked info rows
    await expect(page.getByText('Actual Finish is never auto-accepted')).toBeVisible();
    await expect(page.getByText('Progress measure: Physical % complete')).toBeVisible();
    await expect(page.getByText('P6 option assumed: Retained Logic')).toBeVisible();

    // Move Auto-accept slider from 95 to 90
    const slider = page.getByTestId('slider-auto-accept');
    await slider.fill('90');
    await expect(page.getByTestId('auto-accept-value')).toContainText('90%');

    // Check tier preview bar re-tiers
    await expect(page.getByTestId('tier-preview-auto-accept')).toBeVisible();

    // Navigate to workbench and verify confidence badge has tier="auto-accept" for 94% item
    await page.goto('/workbench?frame=off&role=planner');
    const badge94 = page.locator('[data-tier="auto-accept"]').first();
    await expect(badge94).toBeVisible();
  });

  test('AD2 Users & Roles: approve REQ-0087 access request and inspect roles matrix', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/users?frame=off');

    // 1. Check searchable users list
    await expect(page.getByTestId('user-row-usr-1')).toBeVisible();
    await page.getByTestId('search-users-input').fill('Rahul');
    await expect(page.getByTestId('user-row-usr-1')).toBeVisible();
    await page.getByTestId('search-users-input').fill('');

    // 2. Switch to Requests tab
    await page.getByTestId('underline-tabs-requests').click();
    await expect(page.getByTestId('request-card-REQ-0087')).toBeVisible();

    // Approve REQ-0087
    await page.getByTestId('approve-request-btn-REQ-0087').click();
    await expect(page.getByTestId('request-card-REQ-0087')).not.toBeVisible();

    // 3. Switch to Roles tab
    await page.getByTestId('underline-tabs-roles').click();
    await expect(page.getByText('Role-Based Access Control (RBAC) Matrix')).toBeVisible();
    await expect(page.getByText('Voice / Text Capture (SU2)')).toBeVisible();
  });

  test('AD3 Dictionary: interactive phrase tester recognizes entities live', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/dictionary?frame=off');

    // Check test phrase container
    const testInput = page.getByTestId('test-phrase-input');
    await testInput.fill('Line 24-XX ki spool 17 hydro test complete ho gayi');
    await expect(page.getByTestId('phrase-matches-container')).toBeVisible();
    await expect(page.getByTestId('match-chip-0')).toContainText('Hydrotest');

    // Add entry sheet
    await page.getByTestId('add-entry-button').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await page.getByTestId('input-term').fill('Holiday');
    await page.getByTestId('input-canonical').fill('Holiday Integrity Test');
    await page.getByTestId('submit-add-entry').click();
  });

  test('AD4 Projects & Baselines: inspect v1-v3 baselines and thresholds', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/projects?frame=off');

    // Click project card
    await page.getByTestId('project-card-kandla-panipat-p3').click();
    await expect(page.getByTestId('bottom-sheet')).toBeVisible();
    await expect(page.getByText('Primavera P6 Baseline Versions (v1–v3)')).toBeVisible();
    await expect(page.getByText('v3 (Current)')).toBeVisible();
  });
});
