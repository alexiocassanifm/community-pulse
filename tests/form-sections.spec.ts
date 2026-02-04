import { test, expect } from '@playwright/test';

test.describe('Form Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
    await page.waitForLoadState('networkidle');
  });

  test('should fill Professional Background section', async ({ page }) => {
    // Fill in the role/occupation
    const roleInput = page.locator('#professional_role');
    await roleInput.fill('Software Engineer');
    await expect(roleInput).toHaveValue('Software Engineer');

    // Select experience level
    const experienceSelect = page.locator('#experience_level');
    await experienceSelect.click();
    await page.locator('[role="option"]').filter({ hasText: 'Mid-Level' }).click();

    // Fill in industry
    const industryInput = page.locator('#industry');
    await industryInput.fill('Technology');
    await expect(industryInput).toHaveValue('Technology');
  });

  test('should fill Availability section', async ({ page }) => {
    // Navigate to Availability section
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check available days using the clickable div containers
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Monday"]').click();
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Wednesday"]').click();
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Friday"]').click();

    // Verify checkboxes are checked
    await expect(page.locator('[role="checkbox"][aria-labelledby="day-label-Monday"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[role="checkbox"][aria-labelledby="day-label-Wednesday"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[role="checkbox"][aria-labelledby="day-label-Friday"]')).toHaveAttribute('aria-checked', 'true');

    // Check preferred times
    await page.locator('[role="checkbox"][aria-labelledby="time-label-morning"]').click();
    await page.locator('[role="checkbox"][aria-labelledby="time-label-evening"]').click();

    // Select frequency
    const frequencySelect = page.locator('#frequency');
    await frequencySelect.click();
    await page.locator('[role="option"]').filter({ hasText: 'Weekly' }).click();
  });

  test('should fill Event Formats section', async ({ page }) => {
    // Navigate to Event Formats section
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Check for placeholder or actual format options
    await expect(page.locator('h2', { hasText: 'Event Formats' })).toBeVisible();
  });

  test('should select Topics of Interest', async ({ page }) => {
    // Navigate to Topics section
    for (let i = 0; i < 3; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    // Check for topics section
    await expect(page.locator('h2', { hasText: 'Topics of Interest' })).toBeVisible();
  });

  test('should check GDPR consent checkbox', async ({ page }) => {
    // Navigate to GDPR section
    for (let i = 0; i < 4; i++) {
      await page.locator('button:has-text("Next")').click();
      await page.waitForTimeout(500);
    }

    // Check consent checkbox
    const consentCheckbox = page.locator('#data_retention_acknowledged');
    await expect(consentCheckbox).toBeVisible();
    await consentCheckbox.click();
    await expect(consentCheckbox).toBeChecked();
  });

  test('should fill multiple sections and retain data when navigating', async ({ page }) => {
    // Fill Professional Background
    await page.locator('#professional_role').fill('Product Manager');
    await page.locator('#industry').fill('Finance');

    // Navigate to Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Fill Availability
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Monday"]').click();
    await page.locator('[role="checkbox"][aria-labelledby="time-label-evening"]').click();

    // Navigate back to Professional Background
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);

    // Verify data is retained
    await expect(page.locator('#professional_role')).toHaveValue('Product Manager');
    await expect(page.locator('#industry')).toHaveValue('Finance');

    // Navigate forward to Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Verify data is retained
    await expect(page.locator('[role="checkbox"][aria-labelledby="day-label-Monday"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[role="checkbox"][aria-labelledby="time-label-evening"]')).toHaveAttribute('aria-checked', 'true');
  });
});
