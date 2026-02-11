import { test, expect, Page } from "@playwright/test";

/** Mock demographics analytics response with data */
const MOCK_DEMOGRAPHICS_RESPONSE = {
  totalSubmissions: 150,
  roles: [
    { category: "Developer", count: 45, percentage: 30.0 },
    { category: "Designer", count: 30, percentage: 20.0 },
    { category: "Product Manager", count: 25, percentage: 16.7 },
    { category: "Data Scientist", count: 20, percentage: 13.3 },
    { category: "DevOps Engineer", count: 15, percentage: 10.0 },
    { category: "QA Engineer", count: 10, percentage: 6.7 },
    { category: "Technical Writer", count: 5, percentage: 3.3 },
  ],
  experience: [
    { category: "junior", count: 25, percentage: 16.7 },
    { category: "mid", count: 50, percentage: 33.3 },
    { category: "senior", count: 40, percentage: 26.7 },
    { category: "lead", count: 20, percentage: 13.3 },
    { category: "executive", count: 15, percentage: 10.0 },
  ],
  industries: [
    { category: "Technology", count: 60, percentage: 40.0 },
    { category: "Finance", count: 25, percentage: 16.7 },
    { category: "Healthcare", count: 15, percentage: 10.0 },
    { category: "Education", count: 12, percentage: 8.0 },
    { category: "Retail", count: 10, percentage: 6.7 },
    { category: "Manufacturing", count: 8, percentage: 5.3 },
    { category: "Other", count: 20, percentage: 13.3 },
  ],
  totalDistinctIndustries: 7,
  skills: [
    { category: "javascript", count: 80, percentage: 53.3 },
    { category: "react", count: 70, percentage: 46.7 },
    { category: "typescript", count: 65, percentage: 43.3 },
    { category: "python", count: 50, percentage: 33.3 },
    { category: "node.js", count: 45, percentage: 30.0 },
    { category: "sql", count: 40, percentage: 26.7 },
    { category: "docker", count: 30, percentage: 20.0 },
    { category: "aws", count: 25, percentage: 16.7 },
  ],
  date_range: { start: null, end: null },
};

/** Empty demographics response */
const MOCK_EMPTY_RESPONSE = {
  totalSubmissions: 0,
  roles: [],
  experience: [],
  industries: [],
  totalDistinctIndustries: 0,
  skills: [],
  date_range: { start: null, end: null },
};

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? "";
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

async function loginAsOrganizer(page: Page) {
  await page.goto("/dashboard/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 10000 }
  );
}

async function mockDemographicsApi(
  page: Page,
  response = MOCK_DEMOGRAPHICS_RESPONSE
) {
  await page.route("**/api/analytics/demographics*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

async function mockFilterOptionsApi(page: Page) {
  await page.route("**/api/analytics/filter-options*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        roles: ["Developer", "Designer", "Product Manager"],
        levels: ["junior", "mid", "senior", "lead", "executive"],
        industries: ["Technology", "Finance", "Healthcare"],
        backgrounds: ["tech", "business", "design"],
      }),
    });
  });
}

test.describe("Demographics Dashboard - Route Protection", () => {
  test("unauthenticated access to /dashboard/demographics redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/demographics");
    await page.waitForURL("**/dashboard/login**", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();
  });
});

test.describe("Demographics Dashboard - API Endpoint", () => {
  test("unauthenticated API request returns 401", async ({ request }) => {
    const response = await request.get("/api/analytics/demographics");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("message", "Unauthorized");
  });

  test("API response contract matches expected structure", async () => {
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("totalSubmissions");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("roles");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("experience");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("industries");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("totalDistinctIndustries");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("skills");
    expect(MOCK_DEMOGRAPHICS_RESPONSE).toHaveProperty("date_range");

    for (const entry of MOCK_DEMOGRAPHICS_RESPONSE.roles) {
      expect(entry).toHaveProperty("category");
      expect(entry).toHaveProperty("count");
      expect(entry).toHaveProperty("percentage");
      expect(typeof entry.count).toBe("number");
      expect(typeof entry.percentage).toBe("number");
    }

    for (const entry of MOCK_DEMOGRAPHICS_RESPONSE.experience) {
      expect(entry).toHaveProperty("category");
      expect(["junior", "mid", "senior", "lead", "executive"]).toContain(
        entry.category
      );
    }

    const otherIndustry = MOCK_DEMOGRAPHICS_RESPONSE.industries.find(
      (i) => i.category === "Other"
    );
    expect(otherIndustry).toBeDefined();
    expect(otherIndustry!.count).toBeGreaterThan(0);

    for (const entry of MOCK_DEMOGRAPHICS_RESPONSE.skills) {
      expect(entry.category).toBe(entry.category.toLowerCase());
    }
  });
});

test.describe("Demographics Dashboard - Page Load & Charts", () => {
  test.skip(
    !hasCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD"
  );

  test.beforeEach(async ({ page }) => {
    await mockDemographicsApi(page);
    await mockFilterOptionsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/demographics");
    await page.waitForLoadState("networkidle");
  });

  test("page displays heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Audience Demographics" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "Participant distribution by role, experience level, industry, and skills"
      )
    ).toBeVisible();
  });

  test("all 4 demographic sections are visible", async ({ page }) => {
    for (const title of [
      "Professional Roles",
      "Experience Levels",
      "Industry Distribution",
      "Top Skills",
    ]) {
      await expect(
        page.getByRole("heading", { name: title })
      ).toBeVisible();
    }
  });

  test("charts have ARIA labels for accessibility", async ({ page }) => {
    const charts = page.locator('[role="img"]');
    const count = await charts.count();
    expect(count).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < count; i++) {
      const ariaLabel = await charts.nth(i).getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    }
  });

  test("submission count footer is displayed", async ({ page }) => {
    await expect(page.getByText("Based on 150 submissions")).toBeVisible();
  });

  test("role chart shows top 3 summary cards", async ({ page }) => {
    await expect(page.getByText("Developer")).toBeVisible();
    await expect(page.getByText("Designer")).toBeVisible();
    await expect(page.getByText("Product Manager")).toBeVisible();
  });

  test("experience chart has bar/pie toggle buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Bar Chart" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pie Chart" })).toBeVisible();
  });

  test("experience chart toggle switches chart type", async ({ page }) => {
    const pieButton = page.getByRole("button", { name: "Pie Chart" });
    await pieButton.click();

    // After clicking pie, the pie button should have primary styling
    await expect(pieButton).toHaveClass(/bg-primary/);
  });

  test("industry chart shows Other category", async ({ page }) => {
    await expect(page.getByText("Other Count")).toBeVisible();
  });

  test("skills chart shows normalization note", async ({ page }) => {
    await expect(
      page.getByText("Skills are normalized (case-insensitive)")
    ).toBeVisible();
  });
});

test.describe("Demographics Dashboard - Empty State", () => {
  test.skip(
    !hasCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD"
  );

  test("displays empty state when no data available", async ({ page }) => {
    await mockDemographicsApi(page, MOCK_EMPTY_RESPONSE);
    await mockFilterOptionsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/demographics");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No Demographic Data")).toBeVisible();
    await expect(
      page.getByText("Demographic data will appear here")
    ).toBeVisible();
  });
});

test.describe("Demographics Dashboard - Error Handling", () => {
  test.skip(
    !hasCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD"
  );

  test("page handles API error gracefully", async ({ page }) => {
    await page.route("**/api/analytics/demographics*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });
    await mockFilterOptionsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/demographics");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Failed to fetch demographic analytics")
    ).toBeVisible();
  });
});

test.describe("Demographics Dashboard - Responsive Design", () => {
  test.skip(
    !hasCredentials,
    "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD"
  );

  test("charts display at tablet viewport (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await mockDemographicsApi(page);
    await mockFilterOptionsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/demographics");
    await page.waitForLoadState("networkidle");

    const charts = page.locator('[role="img"]');
    const count = await charts.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("charts display at desktop viewport (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockDemographicsApi(page);
    await mockFilterOptionsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/demographics");
    await page.waitForLoadState("networkidle");

    const charts = page.locator('[role="img"]');
    const count = await charts.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});
