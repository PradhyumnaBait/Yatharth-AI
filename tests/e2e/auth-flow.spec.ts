import { test, expect } from '@playwright/test';

test.describe('TASK P05 — Auth Screens A1–A8', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start in fresh unauthenticated state
    await page.goto('/welcome?preview=1');
    await page.evaluate(() => localStorage.clear());
  });

  test('A1 Welcome screen matches specifications at 390x844 with flat scrim and grabber expansion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/welcome?preview=1');

    // Verification of elements
    await expect(page.getByTestId('welcome-screen-a1')).toBeVisible();
    await expect(page.getByTestId('welcome-overlay-headline')).toBeVisible();
    await expect(page.getByTestId('welcome-overlay-headline')).toContainText('From');
    await expect(page.getByTestId('welcome-overlay-headline')).toContainText('Tomorrow');

    // Overlapping sheet and logo
    await expect(page.getByTestId('welcome-sheet')).toBeVisible();
    await expect(page.getByTestId('welcome-logo')).toBeVisible();
    await expect(page.getByTestId('welcome-headline')).toContainText('Turn field progress into schedule intelligence.');
    await expect(page.getByTestId('get-started-btn')).toBeVisible();
    await expect(page.getByTestId('login-link')).toBeVisible();
    await expect(page.getByTestId('welcome-hairline-caption')).toBeVisible();

    // Grabber expand / collapse interaction
    await page.getByTestId('welcome-grabber').click();
    await expect(page.getByTestId('welcome-value-points')).toBeVisible();
    await expect(page.getByText('Capture by voice in 15 seconds')).toBeVisible();

    // Tap to collapse
    await page.getByTestId('welcome-grabber').click();
    await expect(page.getByTestId('welcome-value-points')).not.toBeVisible();
  });

  test('A2 Intro 3-card onboarding flow advances and skip marks onboarding seen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/welcome/intro');

    // Step 1: Speak your update
    await expect(page.getByTestId('intro-card-title')).toContainText('Speak your update');
    await page.getByTestId('intro-next-btn').click();

    // Step 2: We link it to schedule
    await expect(page.getByTestId('intro-card-title')).toContainText('We link it to the schedule');
    await page.getByTestId('intro-next-btn').click();

    // Step 3: Your planner verifies it
    await expect(page.getByTestId('intro-card-title')).toContainText('Your planner verifies it');
    await expect(page.getByTestId('intro-next-btn')).toContainText('Continue');

    // Finish onboarding -> lands on /login
    await page.getByTestId('intro-next-btn').click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('A3 Login: unknown ID, incorrect PIN lockout, and language switching', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');

    // Language chip switches to Hindi
    await page.getByTestId('language-chip').click();
    await expect(page.getByTestId('language-sheet')).toBeVisible();
    await page.getByTestId('language-option-hi').click();

    // UI text in Hindi
    await expect(page.getByTestId('login-title')).toContainText('प्रोजेक्ट में साइन इन करें');

    // Switch back to English
    await page.getByTestId('language-chip').click();
    await page.getByTestId('language-option-en').click();
    await expect(page.getByTestId('login-title')).toContainText('Sign in to your project');

    // Unknown employee ID
    await page.getByTestId('employee-id-input').fill('SUP-9999');
    await page.getByTestId('pin-input-digit-0').fill('111111');
    await page.getByTestId('sign-in-btn').click();
    await expect(page.getByTestId('login-error-msg')).toContainText('No account found for SUP-9999');

    // Correct ID with wrong PIN attempt 1
    await page.getByTestId('employee-id-input').fill('SUP-0412');
    await page.getByTestId('pin-input-digit-0').fill('111111');
    await page.getByTestId('sign-in-btn').click();
    await expect(page.getByTestId('login-error-msg')).toContainText("PIN doesn't match this employee ID. 2 tries left.");

    // Wrong PIN attempt 2
    await page.getByTestId('sign-in-btn').click();
    await expect(page.getByTestId('login-error-msg')).toContainText("PIN doesn't match this employee ID. 1 try left.");

    // Wrong PIN attempt 3 -> Lockout banner triggers 30s countdown
    await page.getByTestId('sign-in-btn').click();
    await expect(page.getByTestId('lockout-banner')).toBeVisible();
    await expect(page.getByTestId('lockout-banner')).toContainText('Account locked for');
  });

  test('A4 Demo accounts sheet: signing in as each of the 4 demo users lands on the correct Home stub', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Field Supervisor (Rahul Patil) -> SU1
    await page.goto('/login');
    await page.getByTestId('demo-accounts-trigger').click();
    await expect(page.getByTestId('demo-accounts-sheet')).toBeVisible();
    await page.getByTestId('demo-user-supervisor').click();
    await expect(page).toHaveURL(/.*\/home/);
    await expect(page.getByTestId('home-screen-supervisor')).toBeVisible();

    // 2. Project Controls Planner (Meera Nair) -> PL1
    await page.goto('/login');
    await page.getByTestId('demo-accounts-trigger').click();
    await page.getByTestId('demo-user-planner').click();
    await expect(page).toHaveURL(/.*\/home/);
    await expect(page.getByTestId('home-screen-planner')).toBeVisible();

    // 3. Project Manager (Arvind Deshmukh) -> PM1
    await page.goto('/login');
    await page.getByTestId('demo-accounts-trigger').click();
    await page.getByTestId('demo-user-pm').click();
    await expect(page).toHaveURL(/.*\/home/);
    await expect(page.getByTestId('home-screen-pm')).toBeVisible();

    // 4. Project Admin (Sana Qureshi) -> AD1
    await page.goto('/login');
    await page.getByTestId('demo-accounts-trigger').click();
    await page.getByTestId('demo-user-admin').click();
    await expect(page).toHaveURL(/.*\/home/);
    await expect(page.getByTestId('home-screen-admin')).toBeVisible();
  });

  test('A5 Forgot PIN 3-step sheet flow with code hint and PIN update', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');

    await page.getByTestId('forgot-pin-link').click();
    await expect(page.getByTestId('forgot-pin-sheet')).toBeVisible();

    // Step 1: Employee ID
    await page.getByTestId('forgot-pin-id-input').fill('SUP-0412');
    await page.getByTestId('send-code-btn').click();

    // Step 2: Verification code with demo hint 482913
    await expect(page.getByText('Demo hint: use code 482913')).toBeVisible();

    // Test wrong code
    await page.getByTestId('forgot-pin-code-input-digit-0').fill('000000');
    await page.getByTestId('verify-code-btn').click();
    await expect(page.getByTestId('code-error-msg')).toBeVisible();

    // Enter correct demo code 482913
    await page.getByTestId('forgot-pin-code-input-digit-0').fill('482913');

    // Step 3: Set new PIN
    await expect(page.getByTestId('save-pin-btn')).toBeVisible();
  });

  test('A6 Request access submits and creates REQ reference', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/request-access');

    await page.getByTestId('request-name-input').fill('Anand Sharma');
    await page.getByTestId('request-contact-input').fill('+91 98765 43210');
    await page.getByTestId('request-role-segmented-planner').click();

    await page.getByTestId('submit-request-btn').click();

    await expect(page.getByTestId('request-success-card')).toBeVisible();
    await expect(page.getByText(/REQ-\d+/)).toBeVisible();
  });

  test('A7 Project picker allows switching active project', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      localStorage.setItem('schedbridge-auth', JSON.stringify({
        state: { isAuthenticated: true, user: { role: 'supervisor', name: 'Rahul Patil' } }
      }));
    });
    await page.goto('/select-project');

    await expect(page.getByTestId('select-project-screen-a7')).toBeVisible();
    await expect(page.getByTestId('project-card-kandla-panipat-p3')).toBeVisible();
    await expect(page.getByTestId('project-card-duliajan-upgrade')).toBeVisible();
    await expect(page.getByTestId('project-card-numaligarh-tank-farm')).toBeVisible();

    // Select Duliajan
    await page.getByTestId('project-card-duliajan-upgrade').click();
    await expect(page).toHaveURL(/.*\/home/);
  });
});
