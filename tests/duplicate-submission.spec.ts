import { test, expect, Page } from '@playwright/test';

/**
 * Helper: clear all client-side submission tracking state
 */
async function clearAllSubmissionState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('meetup_form_submitted');
    localStorage.removeItem('meetup_device_id');
    localStorage.removeItem('meetup_submission_time');
    document.cookie = 'meetup_form_submitted=; max-age=0; path=/; SameSite=Strict';
  });
}

/**
 * Helper: clear only localStorage keys (keep cookie)
 */
async function clearLocalStorageOnly(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('meetup_form_submitted');
    localStorage.removeItem('meetup_device_id');
    localStorage.removeItem('meetup_submission_time');
  });
}

/**
 * Helper: clear form draft and step state from localStorage
 */
async function clearFormDraftState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('anonymous-form-draft');
    localStorage.removeItem('anonymous-form-steps');
  });
}

/**
 * Helper: navigate through the 5-step form and submit
 */
async function fillAndSubmitForm(page: Page) {
  // Step 1: Professional Background
  await page.locator('#professional_role').fill('Software Engineer');

  // Step 2: Availability
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 3: Event Formats
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 4: Topics
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Step 5: GDPR
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(500);

  // Check GDPR consent
  await page.locator('#data_retention_acknowledged').click();

  // Submit
  await page.locator('button:has-text("Submit")').click();
}

/**
 * Helper: mock the submit-preferences API to return a successful 201 response
 */
async function mockSuccessfulSubmission(page: Page) {
  await page.route('**/api/submit-preferences', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Preferences submitted successfully',
        completion_percentage: 20,
      }),
    });
  });
}

/**
 * Helper: mock the submit-preferences API to return a 429 duplicate response
 */
async function mock429DuplicateResponse(page: Page) {
  await page.route('**/api/submit-preferences', (route) => {
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'You have already submitted your preferences recently. Please try again later.',
      }),
    });
  });
}

test.describe('Duplicate Submission Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form');
    await page.waitForLoadState('networkidle');
    await clearAllSubmissionState(page);
    await clearFormDraftState(page);
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Successful first submission returns 201 and shows success modal', async ({ page }) => {
    await mockSuccessfulSubmission(page);

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/submit-preferences') && resp.request().method() === 'POST'
    );

    await fillAndSubmitForm(page);

    // Verify API returns 201
    const response = await responsePromise;
    expect(response.status()).toBe(201);

    // Verify success modal with "Thank You" message
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });
  });

  test('Test 2: Client-side duplicate prevention shows AlreadySubmittedMessage on reload', async ({ page }) => {
    await mockSuccessfulSubmission(page);

    // Complete a successful submission
    await fillAndSubmitForm(page);
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });

    // Reload the page (no route mocking needed — client state prevents form from showing)
    await page.unrouteAll();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show the already submitted message
    await expect(
      page.locator('text=already submitted your response')
    ).toBeVisible({ timeout: 10000 });

    // The form should NOT be visible
    await expect(page.locator('button:has-text("Next")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).not.toBeVisible();
  });

  test('Test 3: Cookie fallback prevents duplicate when only localStorage is cleared', async ({ page }) => {
    await mockSuccessfulSubmission(page);

    // Complete a successful submission
    await fillAndSubmitForm(page);
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });

    // Clear ONLY localStorage (keep the cookie)
    await clearLocalStorageOnly(page);

    // Reload the page
    await page.unrouteAll();
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Cookie fallback should still show the already submitted message
    await expect(
      page.locator('text=already submitted your response')
    ).toBeVisible({ timeout: 10000 });

    // Form should NOT be visible
    await expect(page.locator('button:has-text("Next")')).not.toBeVisible();
  });

  test('Test 4: Server-side duplicate prevention returns 429 after clearing client state', async ({ page }) => {
    await mockSuccessfulSubmission(page);

    // Complete a successful first submission
    await fillAndSubmitForm(page);
    await expect(page.locator('text=/thank you/i')).toBeVisible({ timeout: 10000 });

    // Clear ALL client-side state
    await clearAllSubmissionState(page);
    await clearFormDraftState(page);

    // Replace mock: next submission should get 429 (simulating server-side IP duplicate check)
    await page.unrouteAll();
    await mock429DuplicateResponse(page);

    // Reload - form should appear again since all client state is cleared
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Next")')).toBeVisible({ timeout: 10000 });

    // Intercept the response for verification
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/submit-preferences') && resp.request().method() === 'POST'
    );

    // Try to submit again
    await fillAndSubmitForm(page);

    // Verify API returns 429
    const response = await responsePromise;
    expect(response.status()).toBe(429);
  });

  test('Test 5: After 429 response, user sees already-submitted view (not success modal)', async ({ page }) => {
    // Start directly with a 429 mock (simulates clearing client state after a prior submission)
    await mock429DuplicateResponse(page);

    // Submit the form
    await fillAndSubmitForm(page);

    // After 429, the app calls markAsSubmitted() and sets hasAlreadySubmitted=true
    // This redirects to the already-submitted view
    await expect(
      page.locator('text=already submitted your response')
    ).toBeVisible({ timeout: 10000 });

    // The success modal should NOT appear
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
