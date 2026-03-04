import { test, expect } from "@playwright/test";

test.describe("Auth - Login Page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.waitForLoadState("networkidle");
  });

  test("login page renders correct elements", async ({ page }) => {
    // Page heading
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();

    // Subtitle
    await expect(
      page.getByText("Sign in to access event analytics")
    ).toBeVisible();

    // Card title (CardTitle renders as <div>, not a heading)
    await expect(
      page.locator("[class*='CardTitle'], .text-2xl.font-semibold", {
        hasText: "Sign In",
      })
    ).toBeVisible();

    // Form fields
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Submit button
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();

    // Placeholder text
    await expect(
      page.getByPlaceholder("organizer@example.com")
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Enter your password")
    ).toBeVisible();
  });

  test("main site navigation is hidden on dashboard routes", async ({
    page,
  }) => {
    // The Navigation component returns null for /dashboard/* paths
    // The "Share Preferences" link only exists in the Navigation component
    await expect(
      page.getByRole("link", { name: "Share Preferences" })
    ).not.toBeVisible();

    // The navigation header element should not exist
    await expect(page.locator("header.sticky")).toHaveCount(0);
  });
});

test.describe("Auth - Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.waitForLoadState("networkidle");
  });

  test("empty form shows validation errors on submit", async ({ page }) => {
    // Click Sign In without filling any fields
    await page.getByRole("button", { name: "Sign In" }).click();

    // Validation errors should appear (mode: onBlur, but submit also triggers)
    await expect(page.getByText("Email is required")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText("Password is required")).toBeVisible({
      timeout: 5000,
    });
  });

  test("invalid email shows validation error on blur", async ({ page }) => {
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password");

    // Type invalid email
    await emailInput.fill("notanemail");

    // Tab away to trigger onBlur validation
    await passwordInput.focus();

    // Should show email format error
    await expect(
      page.getByText("Please enter a valid email address")
    ).toBeVisible({ timeout: 5000 });
  });

  test("short password shows validation error on blur", async ({ page }) => {
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password");

    // Fill valid email first
    await emailInput.fill("test@example.com");

    // Type short password
    await passwordInput.fill("short");

    // Tab away to trigger onBlur validation
    await emailInput.focus();

    // Should show min-length error
    await expect(
      page.getByText("Password must be at least 8 characters")
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Auth - Login Form Loading State", () => {
  test("submit button shows loading state during sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/login");
    await page.waitForLoadState("networkidle");

    // Fill valid-looking credentials
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");

    // Click Sign In
    await page.getByRole("button", { name: "Sign In" }).click();

    // Button should show loading text
    await expect(
      page.getByRole("button", { name: "Signing in..." })
    ).toBeVisible({ timeout: 3000 });

    // Button should be disabled during loading
    await expect(
      page.getByRole("button", { name: "Signing in..." })
    ).toBeDisabled();

    // Form inputs should be disabled during loading
    await expect(page.getByLabel("Email")).toBeDisabled();
    await expect(page.getByLabel("Password")).toBeDisabled();
  });
});

test.describe("Auth - Route Protection", () => {
  test("unauthenticated access to /dashboard redirects to login", async ({
    page,
  }) => {
    // Navigate directly to /dashboard without auth
    await page.goto("/dashboard");

    // Should be redirected to login page (via middleware or requireAuth)
    await page.waitForURL("**/dashboard/login**", { timeout: 10000 });

    // Login form should be visible
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("non-existent dashboard sub-routes return 404", async ({ page }) => {
    // Sub-routes like /dashboard/trends don't have page.tsx files yet
    // The middleware processes the request, but Next.js returns 404
    const response = await page.goto("/dashboard/trends");

    // Verify 404 response for unimplemented dashboard sub-routes
    expect(response?.status()).toBe(404);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("login page is accessible without authentication", async ({ page }) => {
    // The login page itself should always be accessible
    const response = await page.goto("/dashboard/login");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();
  });
});
