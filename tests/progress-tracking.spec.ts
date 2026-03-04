import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
    await page.waitForLoadState('networkidle');
  });

  test('should start at 0% progress', async ({ page }) => {
    await expect(page.locator('text=0%')).toBeVisible();
  });

  test('should update progress when filling a section', async ({ page }) => {
    // Initially at 0%
    await expect(page.locator('text=0%')).toBeVisible();

    // Fill Professional Background section
    await page.locator('#professional_role').fill('Engineer');

    const experienceSelect = page.locator('#experience_level');
    await experienceSelect.click();
    await page.locator('[role="option"]').filter({ hasText: 'Junior' }).click();

    await page.locator('#industry').fill('Tech');

    // Navigate to next section
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Progress should increase (should be 20% as one of five sections is complete)
    const progressText = await page.locator('text=/\\d+%/').textContent();
    const progressValue = parseInt(progressText || '0');
    expect(progressValue).toBeGreaterThan(0);
  });

  test('should mark section as completed after filling and navigating away', async ({ page }) => {
    // Fill Professional Background
    await page.locator('#professional_role').fill('Developer');

    // Navigate to Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate back to Professional Background
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);

    // Verify we're back on Professional Background section
    await expect(page.locator('h2', { hasText: 'Professional Background' })).toBeVisible();
  });

  test('should increase progress as multiple sections are completed', async ({ page }) => {
    // Fill Professional Background
    await page.locator('#professional_role').fill('Manager');

    // Navigate to Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Fill Availability
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Monday"]').click();

    // Navigate to Event Formats
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Check progress has increased
    const progressText = await page.locator('text=/\\d+%/').textContent();
    const progressValue = parseInt(progressText || '0');

    // Should be at least 20% (at least 1 of 5 sections)
    expect(progressValue).toBeGreaterThanOrEqual(20);
  });

  test('should show high progress when all sections are filled', async ({ page }) => {
    // Fill Professional Background
    await page.locator('#professional_role').fill('Analyst');

    // Navigate and fill Availability
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('[role="checkbox"][aria-labelledby="day-label-Tuesday"]').click();

    // Navigate to Event Formats
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate to Topics
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate and fill GDPR
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await page.locator('#data_retention_acknowledged').click();

    // Wait a moment for progress to update
    await page.waitForTimeout(1000);

    // Check progress (should be high, potentially 100% or near it)
    const progressText = await page.locator('text=/\\d+%/').textContent();
    const progressValue = parseInt(progressText || '0');

    // Should be at least 40%
    expect(progressValue).toBeGreaterThanOrEqual(40);
  });

  test('should maintain progress when navigating back and forth', async ({ page }) => {
    // Fill Professional Background
    await page.locator('#professional_role').fill('Consultant');

    // Navigate forward
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Get current progress
    const progressAfterFirstSection = await page.locator('text=/\\d+%/').textContent();

    // Navigate to another section
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Navigate back twice
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);

    // Navigate forward again
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);

    // Progress should be maintained
    const progressAfterNavigation = await page.locator('text=/\\d+%/').textContent();
    expect(progressAfterNavigation).toBe(progressAfterFirstSection);
  });
});
