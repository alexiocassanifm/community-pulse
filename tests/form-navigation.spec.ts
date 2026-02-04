import { test, expect } from '@playwright/test';

test.describe('Form Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
    await page.waitForLoadState('networkidle');
  });

  test('should load page with step 1 active', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Share Your Preferences Anonymously');

    // Check that the first step (Professional Background) is visible
    await expect(page.locator('h2', { hasText: 'Professional Background' })).toBeVisible();

    // Check that progress is at 0%
    await expect(page.locator('text=0%')).toBeVisible();
  });

  test('should navigate to step 2 when clicking Next', async ({ page }) => {
    // Click Next button
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Check that we're on step 2 (Availability)
    await expect(page.locator('h2', { hasText: 'Availability' })).toBeVisible({ timeout: 5000 });
  });

  test('should navigate back to step 1 when clicking Previous', async ({ page }) => {
    // Navigate to step 2
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Click Previous
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    await page.waitForTimeout(500);

    // Check that we're back on step 1
    await expect(page.locator('h2', { hasText: 'Professional Background' })).toBeVisible();
  });

  test('should allow direct step navigation by clicking step indicator', async ({ page }) => {
    // Click on step 3 in the step indicator
    await page.locator('text=Event Formats').first().click();
    await page.waitForTimeout(500);

    // Check that we're on step 3
    await expect(page.locator('h2', { hasText: 'Event Formats' })).toBeVisible();
  });

  test('should show Submit button on last step', async ({ page }) => {
    // Navigate to the last step (GDPR Consent - step 5)
    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    // Check that Submit button is visible
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();

    // Check that Next button is not visible
    await expect(page.locator('button:has-text("Next")')).not.toBeVisible();
  });

  test('should disable Previous button on first step', async ({ page }) => {
    // On step 1, Previous button should be disabled
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeDisabled();
  });

  test('should enable Previous button after navigating to step 2', async ({ page }) => {
    // Navigate to step 2
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Previous button should now be enabled
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeEnabled();
  });
});
