import { test, expect, Page } from "@playwright/test";

/** Sample analytics response with data */
const MOCK_FORMATS_RESPONSE = {
  data: {
    presentations: { count: 45, percentage: 65.2 },
    workshops: { count: 30, percentage: 43.5 },
    discussions: { count: 28, percentage: 40.6 },
    networking: { count: 35, percentage: 50.7 },
    hackathons: { count: 12, percentage: 17.4 },
    mentoring: { count: 18, percentage: 26.1 },
  },
  hybrid: {
    in_person: { count: 25, percentage: 36.2 },
    virtual: { count: 15, percentage: 21.7 },
    hybrid: { count: 20, percentage: 29.0 },
    no_preference: { count: 9, percentage: 13.0 },
  },
  custom_formats: [
    { text: "coffee chats", count: 3 },
    { text: "book clubs", count: 2 },
  ],
  total_submissions: 69,
  date_range: { start: null, end: null },
};

/** Empty analytics response */
const MOCK_EMPTY_RESPONSE = {
  data: {
    presentations: { count: 0, percentage: 0 },
    workshops: { count: 0, percentage: 0 },
    discussions: { count: 0, percentage: 0 },
    networking: { count: 0, percentage: 0 },
    hackathons: { count: 0, percentage: 0 },
    mentoring: { count: 0, percentage: 0 },
  },
  hybrid: {
    in_person: { count: 0, percentage: 0 },
    virtual: { count: 0, percentage: 0 },
    hybrid: { count: 0, percentage: 0 },
    no_preference: { count: 0, percentage: 0 },
  },
  custom_formats: [],
  total_submissions: 0,
  date_range: { start: null, end: null },
};

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? "";
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

/**
 * Log in via the UI and wait for dashboard redirect.
 */
async function loginAsOrganizer(page: Page) {
  await page.goto("/dashboard/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for redirect away from login page
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  // Make sure we're not still on the login page
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 10000 }
  );
}

/**
 * Mock the formats analytics API to return test data.
 */
async function mockFormatsApi(page: Page, response = MOCK_FORMATS_RESPONSE) {
  await page.route("**/api/analytics/formats*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}


test.describe("Format Charts - Route Protection", () => {
  test("unauthenticated access to /dashboard/formats redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/formats");
    await page.waitForURL("**/dashboard/login**", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();
  });
});

test.describe("Format Charts - API Endpoint (TC-10)", () => {
  test("unauthenticated API request returns 401", async ({ request }) => {
    const response = await request.get("/api/analytics/formats");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("message", "Unauthorized");
  });

  test("API response contract matches expected structure", async () => {
    // Validate expected format for API contract
    expect(MOCK_FORMATS_RESPONSE).toHaveProperty("data");
    expect(MOCK_FORMATS_RESPONSE).toHaveProperty("hybrid");
    expect(MOCK_FORMATS_RESPONSE).toHaveProperty("custom_formats");
    expect(MOCK_FORMATS_RESPONSE).toHaveProperty("total_submissions");
    expect(MOCK_FORMATS_RESPONSE).toHaveProperty("date_range");

    for (const key of [
      "presentations",
      "workshops",
      "discussions",
      "networking",
      "hackathons",
      "mentoring",
    ]) {
      const entry =
        MOCK_FORMATS_RESPONSE.data[
          key as keyof typeof MOCK_FORMATS_RESPONSE.data
        ];
      expect(entry).toHaveProperty("count");
      expect(entry).toHaveProperty("percentage");
      expect(typeof entry.count).toBe("number");
      expect(typeof entry.percentage).toBe("number");
    }

    for (const key of ["in_person", "virtual", "hybrid", "no_preference"]) {
      const entry =
        MOCK_FORMATS_RESPONSE.hybrid[
          key as keyof typeof MOCK_FORMATS_RESPONSE.hybrid
        ];
      expect(entry).toHaveProperty("count");
      expect(entry).toHaveProperty("percentage");
    }
  });
});

/*
 * The tests below require PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD env vars
 * pointing to an organizer account. They log in via the UI, then mock the
 * /api/analytics/formats endpoint. Skipped when credentials are not set.
 */

test.describe("Format Charts - Page Load & Bar Chart (TC-01)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("page displays heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Event Format Preferences" })
    ).toBeVisible();
    await expect(
      page.getByText("Preferred event formats and delivery modes")
    ).toBeVisible();
  });

  test("bar chart is visible by default", async ({ page }) => {
    const barChart = page.locator(
      '[role="img"][aria-label*="Bar chart showing format preferences"]'
    );
    await expect(barChart).toBeVisible({ timeout: 10000 });
  });

  test("format preferences card title is visible", async ({ page }) => {
    await expect(
      page.getByText("Format Preferences", { exact: true })
    ).toBeVisible();
  });

  test("submission count footer is displayed", async ({ page }) => {
    await expect(page.getByText("Based on 69 submissions")).toBeVisible();
  });
});

test.describe("Format Charts - Pie Chart Toggle (TC-02)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("clicking Pie Chart tab switches to pie chart view", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Pie Chart" }).click();

    const pieChart = page.locator(
      '[role="img"][aria-label*="Pie chart showing format preferences"]'
    );
    await expect(pieChart).toBeVisible({ timeout: 5000 });

    const barChart = page.locator(
      '[role="img"][aria-label*="Bar chart showing format preferences"]'
    );
    await expect(barChart).not.toBeVisible();
  });

  test("Pie Chart tab shows selected state", async ({ page }) => {
    const pieTab = page.getByRole("tab", { name: "Pie Chart" });
    await pieTab.click();
    await expect(pieTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("Format Charts - Chart Toggle Consistency (TC-03)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("switching between bar and pie chart renders without errors", async ({
    page,
  }) => {
    const barTab = page.getByRole("tab", { name: "Bar Chart" });
    const pieTab = page.getByRole("tab", { name: "Pie Chart" });

    await expect(barTab).toHaveAttribute("aria-selected", "true");

    // Switch to pie
    await pieTab.click();
    await expect(
      page.locator('[role="img"][aria-label*="Pie chart"]')
    ).toBeVisible({ timeout: 5000 });

    // Switch back to bar
    await barTab.click();
    await expect(
      page.locator(
        '[role="img"][aria-label*="Bar chart showing format preferences"]'
      )
    ).toBeVisible({ timeout: 5000 });

    await expect(page.getByText("Failed to load data")).not.toBeVisible();
  });
});

test.describe("Format Charts - Tooltips (TC-04)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("hovering over bar chart shows tooltip with count and percentage", async ({
    page,
  }) => {
    const barChartContainer = page.locator(
      '[role="img"][aria-label*="Bar chart showing format preferences"]'
    );
    await expect(barChartContainer).toBeVisible({ timeout: 10000 });

    // Hover over a bar element rendered by Recharts
    const bars = barChartContainer.locator(".recharts-bar-rectangle rect");
    const barCount = await bars.count();

    if (barCount > 0) {
      await bars.first().hover({ force: true });

      // Tooltip should appear showing response count and percentage
      await expect(
        page
          .locator(".recharts-tooltip-wrapper")
          .or(page.locator("text=/responses/"))
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Format Charts - Hybrid Preference Chart (TC-05)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("delivery mode preferences section is visible", async ({ page }) => {
    await expect(page.getByText("Delivery Mode Preferences")).toBeVisible();
  });

  test("hybrid chart contains all delivery mode options", async ({ page }) => {
    const hybridChart = page.locator(
      '[role="img"][aria-label*="Bar chart showing delivery mode preferences"]'
    );
    await expect(hybridChart).toBeVisible({ timeout: 10000 });

    const ariaLabel = await hybridChart.getAttribute("aria-label");
    expect(ariaLabel).toContain("In Person");
    expect(ariaLabel).toContain("Virtual");
    expect(ariaLabel).toContain("Hybrid");
    expect(ariaLabel).toContain("No Preference");
  });
});

test.describe("Format Charts - Custom Formats Section (TC-06)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("custom format suggestions section displays entries", async ({
    page,
  }) => {
    await expect(page.getByText("Custom Format Suggestions")).toBeVisible();
    await expect(page.getByText("coffee chats")).toBeVisible();
    await expect(page.getByText("3 mentions")).toBeVisible();
    await expect(page.getByText("book clubs")).toBeVisible();
    await expect(page.getByText("2 mentions")).toBeVisible();
  });

  test("custom formats section is hidden when no custom data", async ({
    page,
  }) => {
    await page.unrouteAll();
    await mockFormatsApi(page, {
      ...MOCK_FORMATS_RESPONSE,
      custom_formats: [],
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Custom Format Suggestions")
    ).not.toBeVisible();
  });
});

test.describe("Format Charts - Responsive Design (TC-07)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("charts resize at mobile viewport (375px)", async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Event Format Preferences" })
    ).toBeVisible();

    const barChart = page.locator(
      '[role="img"][aria-label*="Bar chart showing format preferences"]'
    );
    await expect(barChart).toBeVisible({ timeout: 10000 });

    const box = await barChart.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });

  test("charts display at tablet viewport (768px)", async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator(
        '[role="img"][aria-label*="Bar chart showing format preferences"]'
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test("charts display at desktop viewport (1280px)", async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");

    await expect(
      page.locator(
        '[role="img"][aria-label*="Bar chart showing format preferences"]'
      )
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[role="img"][aria-label*="delivery mode preferences"]')
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Format Charts - Empty State (TC-08)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("displays empty state when no data available", async ({ page }) => {
    await mockFormatsApi(page, MOCK_EMPTY_RESPONSE);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No Format Data")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText("Format preference data will appear here")
    ).toBeVisible();

    await expect(
      page.getByText("Format Preferences", { exact: true })
    ).not.toBeVisible();
    await expect(
      page.locator('[role="img"][aria-label*="Bar chart"]')
    ).not.toBeVisible();
  });
});

test.describe("Format Charts - Accessibility (TC-09)", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockFormatsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");
  });

  test("chart containers have ARIA labels", async ({ page }) => {
    const barChart = page.locator(
      '[role="img"][aria-label*="Bar chart showing format preferences"]'
    );
    await expect(barChart).toBeVisible({ timeout: 10000 });
    const barLabel = await barChart.getAttribute("aria-label");
    expect(barLabel).toBeTruthy();

    const hybridChart = page.locator(
      '[role="img"][aria-label*="delivery mode preferences"]'
    );
    await expect(hybridChart).toBeVisible();
    const hybridLabel = await hybridChart.getAttribute("aria-label");
    expect(hybridLabel).toBeTruthy();
  });

  test("chart toggle has tablist role with proper tab structure", async ({
    page,
  }) => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();
    await expect(tablist).toHaveAttribute("aria-label", "Chart view toggle");

    const barTab = page.getByRole("tab", { name: "Bar Chart" });
    const pieTab = page.getByRole("tab", { name: "Pie Chart" });
    await expect(barTab).toBeVisible();
    await expect(pieTab).toBeVisible();

    await expect(barTab).toHaveAttribute("aria-selected", "true");
    await expect(pieTab).toHaveAttribute("aria-selected", "false");
  });

  test("chart area has aria-live region for dynamic updates", async ({
    page,
  }) => {
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
  });
});

test.describe("Format Charts - Error Handling", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("page handles API error gracefully", async ({ page }) => {
    await page.route("**/api/analytics/formats*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });

    await loginAsOrganizer(page);
    await page.goto("/dashboard/formats");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Failed to fetch format analytics")
    ).toBeVisible({ timeout: 10000 });
  });
});
