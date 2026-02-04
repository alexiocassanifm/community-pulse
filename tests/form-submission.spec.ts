import { test, expect } from '@playwright/test';

test.describe('Form Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
    await page.waitForLoadState('networkidle');
  });

  test('should submit form and show success modal', async ({ page }) => {
    // Fill some fields in Professional Background
    await page.locator('#professional_role').fill('Data Analyst');

    // Navigate to Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check a day
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Tuesday"]').click();

    // Navigate to Event Formats
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate to Topics
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate to GDPR
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check consent
    const consentCheckbox = page.locator('#data_retention_acknowledged');
    await consentCheckbox.click();

    // Submit form
    const submitButton = page.locator('button:has-text("Submit")');
    await submitButton.click();

    // Wait for success modal
    const successModal = page.locator('text=/thank you/i');
    await expect(successModal).toBeVisible({ timeout: 10000 });
  });

  test('should show "Thank You!" message in success modal', async ({ page }) => {
    // Navigate to GDPR step
    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    // Check consent
    await page.locator('#data_retention_acknowledged').click();

    // Submit
    await page.locator('button:has-text("Submit")').click();

    // Verify "Thank You!" message
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });
  });

  test('should reset form when closing success modal', async ({ page }) => {
    // Fill a field
    await page.locator('#professional_role').fill('Designer');

    // Navigate to GDPR and submit
    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    await page.locator('#data_retention_acknowledged').click();
    await page.locator('button:has-text("Submit")').click();

    // Wait for success modal
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });

    // Close modal - look for close button in dialog
    const closeButton = page.locator('[role="dialog"] button').last();
    await closeButton.click();

    // Wait for modal to close
    await page.waitForTimeout(1000);

    // Verify form is reset - should be back on step 1
    await expect(page.locator('h2', { hasText: 'Professional Background' })).toBeVisible();

    // Verify field is empty
    await expect(page.locator('#professional_role')).toHaveValue('');

    // Verify progress is reset
    await expect(page.locator('text=0%')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and force it to fail
    await page.route('**/api/submit-preferences', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Navigate to GDPR and submit
    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    await page.locator('#data_retention_acknowledged').click();
    await page.locator('button:has-text("Submit")').click();

    // Should not show success modal
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/thank you/i')).not.toBeVisible();
  });
});
